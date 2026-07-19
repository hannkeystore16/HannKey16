import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod/v4";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getPackage, chargeAmount } from "../lib/packages";
import {
  createPayment,
  DokuApiError,
  DokuNotConfiguredError,
} from "../lib/dokuClient";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const createOrderRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many order attempts. Please try again later." },
});

const createOrderSchema = z.object({
  packageId: z.string().min(1),
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().email().max(200),
  customerPhone: z.string().trim().min(8).max(20),
  notes: z.string().trim().max(1000).optional(),
});

function getOrigin(req: { protocol: string; get(name: string): string | undefined }): string {
  const host = req.get("host");
  return `${req.protocol}://${host}`;
}

router.post("/orders", createOrderRateLimit, async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid order data.", details: parsed.error.flatten() });
    return;
  }

  const { packageId, customerName, customerEmail, customerPhone, notes } = parsed.data;

  const pkg = getPackage(packageId);
  if (!pkg) {
    res.status(404).json({ error: "Package not found." });
    return;
  }
  if (!pkg.orderable) {
    res.status(400).json({
      error: "This package requires a free consultation before ordering. Please contact us via WhatsApp.",
    });
    return;
  }

  const amount = chargeAmount(pkg);

  const [order] = await db
    .insert(ordersTable)
    .values({
      packageId: pkg.id,
      packageName: pkg.name,
      amount,
      totalPrice: pkg.price,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    })
    .returning();

  if (!order) {
    res.status(500).json({ error: "Failed to create order." });
    return;
  }

  try {
    const payment = await createPayment({
      invoiceNumber: order.id,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      callbackUrlResult: `${getOrigin(req)}/order?status=redirect&order_id=${order.id}`,
    });

    const [updated] = await db
      .update(ordersTable)
      .set({
        dokuTokenId: payment.tokenId,
        dokuSessionId: payment.sessionId,
        checkoutUrl: payment.checkoutUrl,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, order.id))
      .returning();

    res.status(201).json({
      orderId: order.id,
      checkoutUrl: updated?.checkoutUrl ?? payment.checkoutUrl,
    });
  } catch (err) {
    if (err instanceof DokuNotConfiguredError) {
      logger.error("Order created but payment gateway is not configured yet.");
      res.status(503).json({
        error:
          "Payment is not available yet — the payment gateway hasn't been configured. Please contact us via WhatsApp to complete your order.",
      });
      return;
    }
    if (err instanceof DokuApiError) {
      res.status(502).json({ error: "Failed to create payment. Please try again shortly." });
      return;
    }
    logger.error({ err }, "Unexpected error creating order payment");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.get("/orders/:id", async (req, res) => {
  const order = await db.query.ordersTable.findFirst({
    where: eq(ordersTable.id, req.params.id),
  });

  if (!order) {
    res.status(404).json({ error: "Order not found." });
    return;
  }

  res.json({
    id: order.id,
    packageName: order.packageName,
    amount: order.amount,
    status: order.status,
  });
});

export default router;
