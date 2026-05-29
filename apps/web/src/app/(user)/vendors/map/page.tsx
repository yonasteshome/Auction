import { getVendors } from "@/lib/vendors";
import { getMarketItems } from "@/lib/market";
import { VendorMapClient } from "@/components/vendors/vendor-map-client";

export const metadata = {
  title: "Vendor Map Discovery | SpendSense",
  description: "Locate verified sellers and find cheap price zones near you.",
};

export default async function VendorMapPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  
  const [data, marketItems] = await Promise.all([
    getVendors({
      ...resolvedParams,
      pageSize: 20,
    }),
    getMarketItems()
  ]);

  return <VendorMapClient initialData={data} searchParams={resolvedParams} marketItems={marketItems} />;
}
