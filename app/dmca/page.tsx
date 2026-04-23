import type { Metadata } from "next";
import { getBreadcrumbJsonLd, getWebPageJsonLd, makeRouteMetadata } from "@/lib/seo";

export const metadata: Metadata = makeRouteMetadata(
  "DMCA Policy | Stream It",
  "Stream It DMCA notice and takedown policy. We respect intellectual property rights and respond to valid infringement notices.",
  "/dmca"
);

export default function DMCAPage() {
  const canonical = "/dmca";
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "DMCA", url: canonical },
    ]),
    getWebPageJsonLd(
      "DMCA Policy | Stream It",
      "Official DMCA notice and takedown policy for Stream It.",
      canonical
    ),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="px-4 md:px-8 pt-24 pb-20 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[var(--color-brand)]">
              Legal Compliance
            </p>
            <h1 className="font-display text-4xl md:text-6xl tracking-wide text-white">
              DMCA Notice & Takedown
            </h1>
            <p className="text-white/60 text-base md:text-lg leading-relaxed">
              Stream It respects the intellectual property of others. If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement and is accessible via this app, please notify us.
            </p>
          </div>

          <section className="space-y-6 text-white/70 leading-relaxed">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-2xl font-display text-white mb-4">1. No Hosting Policy</h2>
              <p>
                Stream It is a search and discovery platform. We do not host, store, or distribute any media files (movies, TV shows, etc.) on our servers. All content is discovered through third-party APIs and public metadata providers.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-2xl font-display text-white mb-4">2. Takedown Requests</h2>
              <p>
                As we do not host content, we cannot "remove" it from the internet. However, we can remove metadata or links from our search results upon receiving a valid DMCA notice.
              </p>
              <p className="mt-4">
                To file a notice, please provide:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>Identification of the material that is claimed to be infringing (URL or ID).</li>
                <li>Your contact information (email, address, phone).</li>
                <li>A statement that you have a good faith belief that use of the material is not authorized.</li>
                <li>A statement that the information in the notification is accurate.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm">
              <p>
                Note: Misrepresenting that material is infringing may lead to liability for damages. We recommend contacting the third-party host or source directly for permanent removal.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
