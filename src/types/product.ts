export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: string; // changed to string to support Supabase UUIDs
  imgs: {
    thumbnails: string[];
    previews: string[];
  };
};

export function mapProductFromDB(dbProduct: any): Product {
  const imageUrls = dbProduct.product_images?.length
    ? dbProduct.product_images.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).map((img: any) => img.url)
    : ["/images/products/product-1-bg-1.png"]; // fallback

  return {
    id: dbProduct.id,
    title: dbProduct.name,
    price: dbProduct.price,
    discountedPrice: dbProduct.discounted_price || dbProduct.price,
    reviews: dbProduct.product_reviews?.length || 0,
    imgs: {
      previews: imageUrls,
      thumbnails: imageUrls,
    }
  };
}
