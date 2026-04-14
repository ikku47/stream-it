import DiscoverLayout from "@/components/discover/DiscoverLayout";
import { LANGUAGES, findLanguageBySlug } from "@/lib/tmdb";
import { generateLanguageMetadata } from "@/lib/seo";

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

  if (!language) {
    return <DiscoverLayout pageType="language" title="Languages" />;
  }

  return (
    <div className="pt-20">
      <DiscoverLayout
        pageType="language"
        title="Languages"
        initialSelection={language.id}
      />
    </div>
  );
}
