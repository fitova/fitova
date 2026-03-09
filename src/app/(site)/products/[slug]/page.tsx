import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRelatedProducts, getCompleteYourLookProducts } from "@/lib/queries/products";
import ProductDetailsClient from "./ProductDetailsClient";
export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    let query = supabase
        .from("products")
        .select("name, description, product_images(url, sort_order)");

    if (isUuid) {
        query = query.or(`slug.eq."${slug}",id.eq."${slug}"`);
    } else {
        query = query.eq("slug", slug);
    }

    const { data } = await query.maybeSingle();

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

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    // Fetch full product with images, reviews, and category
    let query = supabase
        .from("products")
        .select("*, product_images(*), product_reviews(*), categories:category_id(id, name, slug)");

    if (isUuid) {
        query = query.or(`slug.eq."${slug}",id.eq."${slug}"`);
    } else {
        query = query.eq("slug", slug);
    }

    const { data: product, error } = await query.maybeSingle();

    if (error || !product) {
        console.error("[ProductDetailsPage] slug not found:", slug, error?.message);
        notFound();
    }

    // Fetch related products (same category, excluding this one)
    const related = await getRelatedProducts(product, 4).catch(() => []);

    // Fetch cross-sell products (Complete Your Look)
    const crossSell = await getCompleteYourLookProducts(product, 4).catch(() => []);

    return <ProductDetailsClient product={product} related={related} crossSell={crossSell} />;
}
