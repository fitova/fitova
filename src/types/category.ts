export type Category = {
  id: number;
  name: string;
  slug: string;
  img?: string;
  image_url?: string | null;
  parent_id?: number | null;
  gender_id?: number | null;
  sort_order?: number;
  piece_type?: string | null;
};

export type CategoryImage = {
  id: number;
  gender_id: number;
  image_url: string;
  alt_text?: string | null;
  sort_order: number;
};

export type CategoryWithChildren = Category & {
  children: Category[];
  slider_images?: CategoryImage[];
};

