import DiscoverLayout from "@/components/discover/DiscoverLayout";
import { LANGUAGES, findLanguageBySlug } from "@/lib/tmdb";
import {
  generateLanguageMetadata,
  getBreadcrumbJsonLd,
  getCollectionPageJsonLd,
} from "@/lib/seo";

export function generateStaticParams() {
  return LANGUAGES.map((language) => ({ lang: String(language.id).toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const language = findLanguageBySlug(lang);
  return generateLanguageMetadata(language, `/languages/${lang}`);
}

export default async function LanguagePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const language = findLanguageBySlug(lang);
  const canonical = `/languages/${lang}`;
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Languages", url: "/languages" },
      { name: language?.name || "Language", url: canonical },
    ]),
    getCollectionPageJsonLd(
      language?.name ? `${language.name} Movies & TV Shows` : "Languages",
      language?.name
        ? `Browse ${language.name} movies and TV series with language-first discovery.`
        : "Browse movies and TV series by language on Stream It.",
      canonical
    ),
  ];

  if (!language) {
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <DiscoverLayout pageType="language" title="Languages" />
      </>
    );
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="pt-20">
        <DiscoverLayout
          pageType="language"
          title="Languages"
          initialSelection={language.id}
        />
      </div>
    </>
  );
}
