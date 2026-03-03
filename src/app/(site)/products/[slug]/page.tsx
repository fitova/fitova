import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRelatedProducts } from "@/lib/queries/products";
import ProductDetailsClient from "./ProductDetailsClient";

/* ─── Metadata ────────────────────────────────────────────── */
export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();
    const { data } = await supabase
        .from("products")
        .select("name, description, product_images(url, sort_order)")
        .eq("slug", slug)
        .single();

    if (!data) return { title: "Product | FITOVA" };

    const images = (data.product_images ?? []).sort(
        (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
    );
    const primaryImage = images[0]?.url;

    return {
        title: `${data.name} | FITOVA`,
        description: data.description ?? `Shop ${data.name} on FITOVA — curated affiliate fashion.`,
        openGraph: primaryImage
            ? {
                title: `${data.name} | FITOVA`,
                description: data.description ?? "",
                images: [{ url: primaryImage }],
            }
            : undefined,
    };
}

/* ─── Page (Server Component) ──────────────────────────────── */
export default async function ProductDetailsPage(
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch full product with images, reviews, and category
    const { data: product, error } = await supabase
        .from("products")
        .select("*, product_images(*), product_reviews(*), categories:category_id(id, name, slug)")
        .eq("slug", slug)
        .single();

    if (error || !product) {
        console.error("[ProductDetailsPage] slug not found:", slug, error?.message);
        notFound();
    }

    // Fetch related products (same category, excluding this one)
    const related = product.category_id
        ? await getRelatedProducts(product.category_id, product.id, 4).catch(() => [])
        : [];

    return <ProductDetailsClient product={product} related={related} />;
}
