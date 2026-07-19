export interface SeoCheck {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export interface SeoFindings {
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  imageCount: number;
  imagesMissingAlt: number;
  hasViewportMeta: boolean;
  hasCanonical: boolean;
  htmlLang: string | null;
  fetchTimeMs: number;
  checks: SeoCheck[];
}

function matchOne(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  return match ? match[1].trim() : null;
}

/**
 * Extracts a handful of well-known on-page SEO signals from raw HTML with
 * lightweight regexes — good enough for a directional audit without pulling
 * in a full HTML parser dependency.
 */
export function analyzeHtml(html: string, fetchTimeMs: number): SeoFindings {
  const title = matchOne(html, /<title[^>]*>([\s\S]*?)<\/title>/i);

  const metaDescription =
    matchOne(
      html,
      /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i,
    ) ??
    matchOne(
      html,
      /<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i,
    );

  const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;

  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const imagesMissingAlt = imgTags.filter(
    (tag) => !/\balt=["'][^"']*["']/i.test(tag) || /\balt=["']["']/i.test(tag),
  ).length;

  const hasViewportMeta = /<meta[^>]+name=["']viewport["']/i.test(html);
  const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html);
  const htmlLang = matchOne(html, /<html[^>]+lang=["']([^"']+)["']/i);

  const checks: SeoCheck[] = [];

  if (!title) {
    checks.push({ id: "title", label: "Title tag", status: "fail", detail: "Halaman tidak memiliki tag <title>." });
  } else if (title.length < 15 || title.length > 65) {
    checks.push({ id: "title", label: "Title tag", status: "warn", detail: `Panjang title ${title.length} karakter (idealnya 15-65).` });
  } else {
    checks.push({ id: "title", label: "Title tag", status: "pass", detail: `"${title}" (${title.length} karakter).` });
  }

  if (!metaDescription) {
    checks.push({ id: "meta-description", label: "Meta description", status: "fail", detail: "Tidak ada meta description." });
  } else if (metaDescription.length < 50 || metaDescription.length > 160) {
    checks.push({ id: "meta-description", label: "Meta description", status: "warn", detail: `Panjang ${metaDescription.length} karakter (idealnya 50-160).` });
  } else {
    checks.push({ id: "meta-description", label: "Meta description", status: "pass", detail: `Panjang ${metaDescription.length} karakter.` });
  }

  if (h1Count === 0) {
    checks.push({ id: "h1", label: "Heading H1", status: "fail", detail: "Tidak ditemukan heading H1." });
  } else if (h1Count > 1) {
    checks.push({ id: "h1", label: "Heading H1", status: "warn", detail: `Ditemukan ${h1Count} tag H1 (idealnya 1).` });
  } else {
    checks.push({ id: "h1", label: "Heading H1", status: "pass", detail: "Tepat 1 tag H1." });
  }

  if (imgTags.length > 0) {
    if (imagesMissingAlt > 0) {
      checks.push({ id: "alt", label: "Alt text gambar", status: "warn", detail: `${imagesMissingAlt} dari ${imgTags.length} gambar tanpa alt text.` });
    } else {
      checks.push({ id: "alt", label: "Alt text gambar", status: "pass", detail: `Semua ${imgTags.length} gambar punya alt text.` });
    }
  }

  checks.push(
    hasViewportMeta
      ? { id: "viewport", label: "Viewport mobile", status: "pass", detail: "Meta viewport ditemukan." }
      : { id: "viewport", label: "Viewport mobile", status: "fail", detail: "Meta viewport tidak ditemukan — halaman mungkin tidak mobile-friendly." },
  );

  checks.push(
    hasCanonical
      ? { id: "canonical", label: "Canonical URL", status: "pass", detail: "Tag canonical ditemukan." }
      : { id: "canonical", label: "Canonical URL", status: "warn", detail: "Tidak ada tag canonical." },
  );

  checks.push(
    htmlLang
      ? { id: "lang", label: "Atribut bahasa", status: "pass", detail: `lang="${htmlLang}".` }
      : { id: "lang", label: "Atribut bahasa", status: "warn", detail: "Atribut lang pada <html> tidak ditemukan." },
  );

  if (fetchTimeMs > 3000) {
    checks.push({ id: "speed", label: "Waktu respons server", status: "warn", detail: `Server merespons dalam ${(fetchTimeMs / 1000).toFixed(1)}s (idealnya < 1-2s).` });
  } else {
    checks.push({ id: "speed", label: "Waktu respons server", status: "pass", detail: `Server merespons dalam ${fetchTimeMs}ms.` });
  }

  return {
    title,
    metaDescription,
    h1Count,
    imageCount: imgTags.length,
    imagesMissingAlt,
    hasViewportMeta,
    hasCanonical,
    htmlLang,
    fetchTimeMs,
    checks,
  };
}
