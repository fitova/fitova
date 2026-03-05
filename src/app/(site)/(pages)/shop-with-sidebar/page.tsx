import { redirect } from "next/navigation";

export default async function ShopWithSidebarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  // Build query string to preserve filters when redirecting
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedParams)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, value);
      }
    }
  }
  const qs = params.toString();
  redirect(`/outfits${qs ? `?${qs}` : ""}`);
}
