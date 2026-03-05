import { redirect } from "next/navigation";

export default function ShopWithSidebarPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // Build query string to preserve filters when redirecting
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
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
