export type Product = {
  id: string;
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  imgs: {
    thumbnails: string[];
    previews: string[];
  };
  // Extended DB fields
  slug?: string;
  description?: string | null;
  brand?: string | null;
  material?: string | null;
  piece_type?: string | null;
  season?: string | null;
  colors?: string[] | null;
  styles?: string[] | null;
  size?: string[] | null;
  tags?: string[] | null;
  gender?: 'men' | 'women' | 'kids' | 'unisex' | null;
  category_id?: string | null;
  affiliate_link?: string | null;
  affiliate_program?: string | null;
  commission?: number | null;
  stock_status?: string;
  // Homepage section flags
  is_featured?: boolean;
  is_deal?: boolean;
  deal_tag?: string | null;
  is_new_arrival?: boolean;
  is_trending?: boolean;
  is_bestseller?: boolean;
  is_hidden?: boolean;
};

export function mapProductFromDB(dbProduct: any): Product {
  const images = dbProduct.product_images ?? [];
  const sorted = [...images].sort(
    (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
  );
  const imageUrls = sorted.length
    ? sorted.map((img: any) => img.url)
    : ["/images/products/product-1-bg-1.png"];

  return {
    id: dbProduct.id,
    title: dbProduct.name,
    slug: dbProduct.slug,
    price: dbProduct.price,
    discountedPrice: dbProduct.discounted_price ?? dbProduct.price,
    reviews: dbProduct.product_reviews?.length ?? 0,
    description: dbProduct.description,
    brand: dbProduct.brand,
    material: dbProduct.material,
    piece_type: dbProduct.piece_type,
    season: dbProduct.season,
    colors: dbProduct.colors,
    styles: dbProduct.styles,
    size: dbProduct.size,
    tags: dbProduct.tags,
    gender: dbProduct.gender,
    category_id: dbProduct.category_id,
    affiliate_link: dbProduct.affiliate_link,
    affiliate_program: dbProduct.affiliate_program,
    commission: dbProduct.commission,
    stock_status: dbProduct.stock_status,
    is_featured: dbProduct.is_featured,
    is_deal: dbProduct.is_deal,
    deal_tag: dbProduct.deal_tag,
    is_new_arrival: dbProduct.is_new_arrival,
    is_trending: dbProduct.is_trending,
    is_bestseller: dbProduct.is_bestseller,
    is_hidden: dbProduct.is_hidden,
    imgs: {
      previews: imageUrls,
      thumbnails: imageUrls,
    },
  };
}
