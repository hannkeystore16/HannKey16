import { Router, type IRouter } from "express";
import crypto from "node:crypto";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateDigest, generateSignature, getDokuCredentials, DokuNotConfiguredError } from "../lib/dokuClient";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Must match the path this router is mounted at in app.ts, and the
// "Notification URL" path configured in the DOKU Back Office — DOKU signs
// its notification using this path as the Request-Target.
const NOTIFICATION_PATH = "/api/orders/webhook";

const STATUS_BY_TRANSACTION_STATUS: Record<string, "paid" | "expired" | "failed" | "cancelled"> = {
  SUCCESS: "paid",
  EXPIRED: "expired",
  EXPIRE: "expired",
  FAILED: "failed",
  FAILURE: "failed",
  CANCELLED: "cancelled",
  CANCELED: "cancelled",
  CANCEL: "cancelled",
};

interface DokuNotificationPayload {
  transaction?: { status?: string };
  order?: { invoice_number?: string; amount?: number };
}

// Terminal states must never be silently overwritten by a late/replayed
// notification (e.g. an "expired" arriving after a real "paid").
const TERMINAL_STATUSES = new Set(["paid", "failed", "cancelled"]);

router.post("/", async (req, res) => {
  let credentials;
  try {
    credentials = getDokuCredentials();
  } catch (err) {
    if (err instanceof DokuNotConfiguredError) {
      logger.error("Received DOKU webhook but DOKU_CLIENT_ID/DOKU_SECRET_KEY are not configured.");
      res.status(500).json({ error: "Webhook not configured." });
      return;
    }
    throw err;
  }

  const rawBody = req.body;
  const requestId = req.header("Request-Id");
  const requestTimestamp = req.header("Request-Timestamp");
  const signature = req.header("Signature");
  const incomingClientId = req.header("Client-Id");

  if (!Buffer.isBuffer(rawBody) || !requestId || !requestTimestamp || !signature || !incomingClientId) {
    res.status(400).json({ error: "Invalid webhook request." });
    return;
  }

  if (incomingClientId !== credentials.clientId) {
    res.status(401).json({ error: "Invalid signature." });
    return;
  }

  const digest = generateDigest(rawBody);
  const expected = generateSignature({
    clientId: credentials.clientId,
    requestId,
    requestTimestamp,
    requestTarget: NOTIFICATION_PATH,
    digest,
    secretKey: credentials.secretKey,
  });

  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const isValid =
    signatureBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

  if (!isValid) {
    logger.warn("Rejected DOKU webhook with invalid signature.");
    res.status(401).json({ error: "Invalid signature." });
    return;
  }

  let payload: DokuNotificationPayload;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    res.status(400).json({ error: "Invalid JSON payload." });
    return;
  }

  const invoiceNumber = payload.order?.invoice_number;
  const transactionStatus = payload.transaction?.status;
  const nextStatus = transactionStatus ? STATUS_BY_TRANSACTION_STATUS[transactionStatus] : undefined;

  if (!invoiceNumber) {
    res.status(200).json({ ok: true });
    return;
  }

  if (!nextStatus) {
    // Unknown/pending status — acknowledge so DOKU stops retrying, but log
    // it so an unmapped terminal status doesn't silently strand an order.
    logger.warn({ invoiceNumber, transactionStatus }, "DOKU webhook: unmapped transaction status");
    res.status(200).json({ ok: true });
    return;
  }

  const order = await db.query.ordersTable.findFirst({
    where: eq(ordersTable.id, invoiceNumber),
  });

  if (!order) {
    logger.warn({ invoiceNumber }, "DOKU webhook: order not found");
    res.status(200).json({ ok: true });
    return;
  }

  // A validly signed notification must still match the order we created:
  // reject any amount mismatch before touching payment state.
  const notifiedAmount = payload.order?.amount;
  if (typeof notifiedAmount !== "number" || Math.round(notifiedAmount) !== order.amount) {
    logger.error(
      { invoiceNumber, notifiedAmount, expected: order.amount },
      "DOKU webhook: amount mismatch — refusing to update order",
    );
    res.status(200).json({ ok: true });
    return;
  }

  // Never overwrite a terminal status with a late/replayed notification.
  if (TERMINAL_STATUSES.has(order.status)) {
    if (order.status !== nextStatus) {
      logger.warn(
        { invoiceNumber, current: order.status, incoming: nextStatus },
        "DOKU webhook: ignoring status change on already-terminal order",
      );
    }
    res.status(200).json({ ok: true });
    return;
  }

  await db
    .update(ordersTable)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(eq(ordersTable.id, invoiceNumber));

  res.status(200).json({ ok: true });
});

export default router;
