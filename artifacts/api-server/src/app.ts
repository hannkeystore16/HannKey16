import express, { type Express, type ErrorRequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import ordersWebhookRouter from "./routes/orders-webhook";
import { logger } from "./lib/logger";

const app: Express = express();

// The app runs behind Replit's reverse proxy (both in the dev workspace and
// in autoscale deployments), which adds exactly one `X-Forwarded-For` hop.
// Trusting that single hop lets Express (and express-rate-limit, which keys
// its limits on req.ip) see the real client IP instead of the proxy's own
// address, without trusting an arbitrary, spoofable forwarding chain.
app.set("trust proxy", 1);

function getAllowedOrigins(): string[] {
  const domains = process.env["REPLIT_DOMAINS"];
  const devDomain = process.env["REPLIT_DEV_DOMAIN"];
  const configured = [domains, devDomain]
    .filter((d): d is string => Boolean(d))
    .flatMap((d) => d.split(","))
    .map((d) => d.trim())
    .filter(Boolean);

  return Array.from(new Set(configured)).map((domain) => `https://${domain}`);
}

const allowedOrigins = getAllowedOrigins();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (server-to-server calls, curl,
      // same-machine health checks) are not subject to CORS in the first
      // place, so let them through and rely on the rate limiter/API layer
      // to bound abuse. Browser requests must match our own site's origin.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
  }),
);
// The webhook needs the raw request body to verify DOKU's HMAC signature,
// so it must be mounted before the global express.json() parser consumes the
// stream. It always sends a response itself, so express.json() below never
// runs for this path.
app.use(
  "/api/orders/webhook",
  express.raw({ type: "application/json" }),
  ordersWebhookRouter,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof Error && err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "Origin not allowed." });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error." });
};

app.use(errorHandler);

export default app;
