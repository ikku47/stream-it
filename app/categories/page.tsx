import Head from "next/head";
import DiscoverLayout from "@/components/discover/DiscoverLayout";

export default function CategoriesPage() {
  return (
    <>
      <Head>
        <title>Categories – JoyFlix</title>
      </Head>
      <div className="pt-20">
        <DiscoverLayout pageType="category" title="Categories" />
      </div>
    </>
  );
}
