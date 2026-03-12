import Head from "next/head";
import DiscoverLayout from "@/components/discover/DiscoverLayout";

export default function YearsPage() {
  return (
    <>
      <Head>
        <title>Years – JoyFlix</title>
      </Head>
      <div className="pt-20">
        <DiscoverLayout pageType="year" title="Years" />
      </div>
    </>
  );
}
