import Head from "next/head";
import DiscoverLayout from "@/components/discover/DiscoverLayout";

export default function LanguagesPage() {
  return (
    <>
      <Head>
        <title>Languages – JoyFlix</title>
      </Head>
      <div className="pt-20">
        <DiscoverLayout pageType="language" title="Languages" />
      </div>
    </>
  );
}
