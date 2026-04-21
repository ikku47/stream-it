import type { Metadata } from "next";
import Link from "next/link";
import { getBreadcrumbJsonLd, getWebPageJsonLd, makeRouteMetadata } from "@/lib/seo";

export const metadata: Metadata = makeRouteMetadata(
  "Policy | Stream It",
  "Read the Stream It content, legal, and usage policy, including third-party data and streaming disclaimers.",
  "/policy"
);

export default function PolicyPage() {
  const canonical = "/policy";
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Policy", url: canonical },
    ]),
    getWebPageJsonLd(
      "Policy | Stream It",
      "Read the Stream It content, legal, and usage policy, including third-party data and streaming disclaimers.",
      canonical
    ),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="px-4 md:px-8 pt-24 pb-20 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[var(--color-brand)]">
              Policy & Legal
            </p>
            <h1 className="font-display text-4xl md:text-6xl tracking-wide text-white">
              Usage, content, and legal guidance for Stream It.
            </h1>
            <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-3xl">
              Stream It is intended for educational and personal discovery use. The app acts as a search and
              discovery layer over third-party metadata and streaming sources, and users are responsible for how they
              access and use external content.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-display text-white mb-4">Content policy</h2>
              <ul className="space-y-3 text-white/65 leading-relaxed">
                <li>Stream It does not host, store, or distribute copyrighted media files.</li>
                <li>Movie and TV data is sourced from third-party metadata providers such as TMDB.</li>
                <li>Live TV channels and radio stations are discovered from public external sources.</li>
                <li>External providers can change, break, or disappear without notice.</li>
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-display text-white mb-4">User responsibility</h2>
              <ul className="space-y-3 text-white/65 leading-relaxed">
                <li>Users must comply with all laws in their jurisdiction.</li>
                <li>Users are responsible for ensuring they have the rights to access any content.</li>
                <li>Stream It does not endorse copyright infringement.</li>
                <li>Official services should always be used when they are available.</li>
              </ul>
            </section>
          </div>

          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-display text-white mb-3">Data and privacy</h2>
              <p className="text-white/65 leading-relaxed max-w-4xl">
                The app stores certain UI preferences locally in the browser, such as provider selection and saved
                favourites. It does not claim ownership of external content, and it does not operate as a content host.
              </p>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display text-white mb-3">Legal notice</h2>
              <p className="text-white/65 leading-relaxed max-w-4xl">
                This application is provided as-is. Any legal issues should be addressed to the relevant third-party
                content providers or data sources, and users should verify the legality of the content they access.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/about"
                className="px-5 py-3 rounded-xl border border-white/10 text-white/80 hover:bg-white/5 transition"
              >
                About Stream It
              </Link>
              <Link
                href="/"
                className="px-5 py-3 rounded-xl bg-[var(--color-brand)] text-white font-medium hover:opacity-90 transition"
              >
                Browse Content
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
