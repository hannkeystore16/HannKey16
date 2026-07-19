import crypto from "node:crypto";
import { logger } from "./logger";

const REQUEST_TARGET = "/checkout/v1/payment";

export class DokuNotConfiguredError extends Error {
  constructor() {
    super("DOKU_CLIENT_ID / DOKU_SECRET_KEY environment variables are not configured.");
    this.name = "DokuNotConfiguredError";
  }
}

export class DokuApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "DokuApiError";
  }
}

interface DokuCredentials {
  clientId: string;
  secretKey: string;
  baseUrl: string;
}

export function getDokuCredentials(): DokuCredentials {
  const clientId = process.env.DOKU_CLIENT_ID;
  const secretKey = process.env.DOKU_SECRET_KEY;
  if (!clientId || !secretKey) {
    throw new DokuNotConfiguredError();
  }
  const isProduction = process.env.DOKU_ENV === "production";
  return {
    clientId,
    secretKey,
    baseUrl: isProduction ? "https://api.doku.com" : "https://api-sandbox.doku.com",
  };
}

/** Base64(SHA-256(rawBody)) — the "Digest" component of DOKU's signature scheme. */
export function generateDigest(rawBody: string | Buffer): string {
  return crypto.createHash("sha256").update(rawBody).digest("base64");
}

/**
 * DOKU's non-SNAP signature: HMAC-SHA256 (base64) of a component string built
 * from the request headers, keyed with the merchant's secret key. Used both
 * to sign outgoing requests and to verify incoming HTTP notifications.
 */
export function generateSignature(params: {
  clientId: string;
  requestId: string;
  requestTimestamp: string;
  requestTarget: string;
  digest?: string;
  secretKey: string;
}): string {
  const { clientId, requestId, requestTimestamp, requestTarget, digest, secretKey } = params;
  let component = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}`;
  if (digest) {
    component += `\nDigest:${digest}`;
  }
  const hmac = crypto.createHmac("sha256", secretKey).update(component, "utf8").digest("base64");
  return `HMACSHA256=${hmac}`;
}

/** ISO8601 UTC timestamp without milliseconds, as required by DOKU. */
function requestTimestampNow(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

export interface CreatePaymentInput {
  invoiceNumber: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  callbackUrlResult?: string;
  paymentDueDateMinutes?: number;
}

export interface DokuPaymentResult {
  checkoutUrl: string;
  tokenId: string | undefined;
  sessionId: string | undefined;
  expiredDate: string | undefined;
}

interface DokuCreatePaymentResponse {
  message?: string[];
  response?: {
    order?: { session_id?: string };
    payment?: { url?: string; token_id?: string; expired_date?: string };
  };
}

export async function createPayment(
  input: CreatePaymentInput,
): Promise<DokuPaymentResult> {
  const { clientId, secretKey, baseUrl } = getDokuCredentials();

  const requestId = crypto.randomUUID();
  const requestTimestamp = requestTimestampNow();

  const body = {
    order: {
      amount: Math.round(input.amount),
      invoice_number: input.invoiceNumber,
      currency: "IDR",
      callback_url_result: input.callbackUrlResult,
      auto_redirect: true,
    },
    payment: {
      payment_due_date: input.paymentDueDateMinutes ?? 60,
    },
    customer: {
      name: input.customerName,
      email: input.customerEmail,
      phone: input.customerPhone,
    },
  };

  const jsonBody = JSON.stringify(body);
  const digest = generateDigest(jsonBody);
  const signature = generateSignature({
    clientId,
    requestId,
    requestTimestamp,
    requestTarget: REQUEST_TARGET,
    digest,
    secretKey,
  });

  const response = await fetch(`${baseUrl}${REQUEST_TARGET}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Client-Id": clientId,
      "Request-Id": requestId,
      "Request-Timestamp": requestTimestamp,
      Signature: signature,
    },
    body: jsonBody,
  });

  const data = (await response.json().catch(() => null)) as DokuCreatePaymentResponse | null;

  if (!response.ok || !data || data.message?.[0] !== "SUCCESS" || !data.response?.payment?.url) {
    logger.error({ status: response.status, body: data }, "DOKU createPayment failed");
    throw new DokuApiError(`DOKU API returned ${response.status}`, response.status);
  }

  return {
    checkoutUrl: data.response.payment.url,
    tokenId: data.response.payment.token_id,
    sessionId: data.response.order?.session_id,
    expiredDate: data.response.payment.expired_date,
  };
}
