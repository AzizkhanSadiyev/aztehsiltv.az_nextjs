import { notFound } from "next/navigation";
import { type Locale, defaultLocale } from "@/i18n/config";
import { getSiteSettings } from "@/lib/data/settings.data";
import { getPublishedPageBySlug } from "@/lib/data/pages.data";
import { pickLocalizedExact } from "@/lib/localization";
import PageTopItems from "@/components/PageTopItems/PageTopItems";

export const dynamic = "force-dynamic";

const normalizeDescriptionHtml = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }
  const escapeHtml = (input: string) =>
    input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  return trimmed
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("");
};

export default async function StaticPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const settings = await getSiteSettings();
  const fallbackLocale =
    settings.localization?.defaultLocale || defaultLocale;
  const resolvedLocale = (locale || fallbackLocale) as Locale;

  const page = await getPublishedPageBySlug(slug);
  if (!page) {
    notFound();
  }

  const title = pickLocalizedExact(
    page.title,
    resolvedLocale,
    fallbackLocale,
  ).trim();
  if (!title) {
    notFound();
  }

  const descriptionRaw = pickLocalizedExact(
    page.description ?? {},
    resolvedLocale,
    fallbackLocale,
  );
  const descriptionHtml = normalizeDescriptionHtml(descriptionRaw || "");

  return (
    <div className="section_wrap wrap_inner_page pad_bottom_40">
      <div className="main_center">
        <PageTopItems locale={resolvedLocale} />
      </div>

      <div className="main_center margin_top_12">
        <div className="section_wrap">
          <div className="sect_header">
            <h1 className="sect_title">{title}</h1>
          </div>
          <div className="sect_body">
            {descriptionHtml ? (
              <div
                className="nw_in_text clearfix"
                data-detail-container="true"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : (
              <div className="nw_in_text clearfix">
                <p>No description</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
