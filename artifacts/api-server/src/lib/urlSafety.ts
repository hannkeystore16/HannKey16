import dns from "node:dns";
import net from "node:net";
import ipaddr from "ipaddr.js";
import { Agent, fetch as undiciFetch } from "undici";

const MAX_REDIRECTS = 3;
const MAX_HTML_BYTES = 2 * 1024 * 1024; // 2 MB
const FETCH_TIMEOUT_MS = 8000;

/**
 * Returns true only for addresses that are genuinely public/routable unicast.
 * Uses ipaddr.js's `process()` to normalize IPv4-mapped, 6to4, and Teredo
 * IPv6 forms (e.g. `::ffff:127.0.0.1`, `::ffff:10.0.0.5`) down to their
 * embedded IPv4 address before classifying, so those forms can't be used to
 * smuggle a private/loopback/link-local target past the check. Anything that
 * isn't a plain "unicast" address (loopback, private, link-local, unique
 * local, carrier-grade NAT, multicast, reserved, benchmarking, etc.) is
 * rejected.
 */
function isSafePublicAddress(address: string): boolean {
  let addr: ipaddr.IPv4 | ipaddr.IPv6;
  try {
    addr = ipaddr.process(address);
  } catch {
    return false;
  }
  return addr.range() === "unicast";
}

type DnsLookupCallback = (
  err: NodeJS.ErrnoException | null,
  address: string | dns.LookupAddress[],
  family?: number,
) => void;

/**
 * A `dns.lookup`-compatible resolver that validates every resolved address
 * against `isSafePublicAddress` at the exact moment a connection is about to
 * be made. Passing this into undici's `Agent` (rather than validating once,
 * earlier, and separately from where the socket connects) closes the
 * DNS-rebinding TOCTOU window: there is no gap between "checked the address"
 * and "connected to the address" because they're the same lookup call.
 */
function safeLookup(
  hostname: string,
  options: dns.LookupAllOptions | dns.LookupOneOptions | dns.LookupOptions | ((...args: unknown[]) => void),
  callback?: DnsLookupCallback,
): void {
  const cb = (typeof options === "function" ? options : callback) as DnsLookupCallback;
  const wantsAll = typeof options === "object" && options !== null && "all" in options && options.all === true;

  dns.lookup(hostname, { all: true, verbatim: true }, (err, addresses) => {
    if (err) {
      cb(err, wantsAll ? [] : "");
      return;
    }
    if (addresses.length === 0 || addresses.some((entry) => !isSafePublicAddress(entry.address))) {
      cb(Object.assign(new Error("Blocked: target resolves to a non-public address."), { code: "EAI_AGAIN" }), wantsAll ? [] : "");
      return;
    }
    if (wantsAll) {
      cb(null, addresses);
    } else {
      cb(null, addresses[0].address, addresses[0].family);
    }
  });
}

// A dedicated dispatcher whose every connection is resolved through
// `safeLookup`. Used for both the URL pre-check (a HEAD-less validation call
// isn't made; we rely on this being the same dispatcher as the real fetch)
// and the actual page fetch, so redirects are re-validated on every hop.
const safeDispatcher = new Agent({ connect: { lookup: safeLookup } });

/**
 * Validates that a URL points at a public http(s) host.
 *
 * For hostnames that are domain names, the authoritative check happens in
 * `safeLookup` at connection time (see above). But when the URL's host is
 * already a literal IP address (e.g. `http://127.0.0.1/`, `http://[::ffff:
 * 127.0.0.1]/`), Node's connector skips DNS resolution entirely — a literal
 * IP is used to connect directly, so `safeLookup` is never invoked for it.
 * This function is what actually blocks that case, by classifying the
 * literal IP address itself up front. It also handles cheap, DNS-free
 * rejections (bad scheme, obviously local hostnames) so we can fail fast
 * with a friendly message before spending a network round-trip.
 */
function assertPublicHttpUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("URL tidak valid.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Hanya URL http/https yang didukung.");
  }

  // URL hostnames wrap IPv6 literals in brackets (e.g. "[::1]"); strip them
  // before classifying so net.isIP / ipaddr.js see the bare address.
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (hostname === "localhost" || hostname.endsWith(".local") || hostname === "0.0.0.0") {
    throw new Error("URL ini tidak dapat diaudit.");
  }

  if (net.isIP(hostname) && !isSafePublicAddress(hostname)) {
    throw new Error("URL ini tidak dapat diaudit.");
  }

  return url;
}

export interface FetchedPage {
  finalUrl: string;
  html: string;
  status: number;
  fetchTimeMs: number;
}

/**
 * Safely fetches a public page's HTML for the SEO/audit tool: validates the
 * URL (and every redirect hop) against private/internal targets — including
 * at actual connection time via a pinned, safety-checked DNS lookup — bounds
 * the response size, and enforces a request timeout.
 */
export async function safeFetchHtml(rawUrl: string): Promise<FetchedPage> {
  let currentUrl = assertPublicHttpUrl(rawUrl);
  const startedAt = Date.now();

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Awaited<ReturnType<typeof undiciFetch>>;
    try {
      // Deliberately using undici's own `fetch` (not the global one) here:
      // Node's global fetch is powered by an internally-bundled undici whose
      // Dispatcher ABI isn't guaranteed to match the standalone `undici`
      // package version used to build `safeDispatcher`, which can otherwise
      // fail with an internal "invalid onRequestStart method" error.
      response = await undiciFetch(currentUrl, {
        redirect: "manual",
        signal: controller.signal,
        dispatcher: safeDispatcher,
        headers: {
          "User-Agent": "HANNKEY16-AI-Audit/1.0 (+https://hannkey.com)",
          Accept: "text/html",
        },
      });
    } catch (err) {
      const cause = err instanceof Error ? (err.cause ?? err) : err;
      if (cause instanceof Error && /non-public address/.test(cause.message)) {
        throw new Error("URL ini tidak dapat diaudit.");
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Redirect tanpa lokasi tujuan.");
      const nextUrl = new URL(location, currentUrl);
      currentUrl = assertPublicHttpUrl(nextUrl.toString());
      continue;
    }

    if (!response.ok) {
      throw new Error(`Halaman merespons dengan status ${response.status}.`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      const html = await response.text();
      return {
        finalUrl: currentUrl.toString(),
        html: html.slice(0, MAX_HTML_BYTES),
        status: response.status,
        fetchTimeMs: Date.now() - startedAt,
      };
    }

    const decoder = new TextDecoder();
    let html = "";
    let bytesRead = 0;
    while (bytesRead < MAX_HTML_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      html += decoder.decode(value, { stream: true });
    }
    reader.cancel().catch(() => {});

    return {
      finalUrl: currentUrl.toString(),
      html,
      status: response.status,
      fetchTimeMs: Date.now() - startedAt,
    };
  }

  throw new Error("Terlalu banyak redirect.");
}
