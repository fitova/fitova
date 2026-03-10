import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

// Vision models ordered by speed — fastest first
const VISION_MODELS = [
    "google/gemma-3-12b-it:free",
    "google/gemma-3-27b-it:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "google/gemma-3-4b-it:free",
];

// Valid values matching site DB taxonomy
const VALID_STYLES = ["Casual", "Formal", "Street", "Sporty", "Minimal", "Elegant", "gothic"];
const VALID_COLORS = ["black", "white", "navy", "red", "green", "beige", "grey", "brown", "olive", "burgundy", "camel", "cream"];
const VALID_PIECE_TYPES = ["Shirt", "Pants", "Shoes", "Jacket", "Accessories", "Bag", "Dress", "Hoodie", "T-Shirt"];

const systemPrompt = `You are a professional AI fashion stylist and personal image analyst at FITOVA.

Your task: Analyze the uploaded person photo carefully and return ONLY a raw JSON object (no markdown, no code fences).

Analyze the following carefully:
- facial structure (oval, round, square, heart, etc.)
- skin tone (light, medium, olive, dark, etc.)
- hair color
- perceived body proportions
- gender presentation
- overall visual aesthetic

Then determine:
1. Which fashion styles suit this person best
2. Which clothing colors complement them
3. Which clothing categories (types) would look best

Valid values ONLY:
- styles: ${VALID_STYLES.join(', ')}
- recommended_colors: ${VALID_COLORS.join(', ')}
- tops categories: oversized hoodie, minimal t-shirt, cropped jacket, button shirt, turtleneck, graphic tee, blazer, polo shirt
- bottoms categories: wide pants, cargo pants, slim jeans, tailored trousers, shorts, joggers, skirt
- shoes categories: chunky sneakers, minimal sneakers, boots, loafers, dress shoes, sandals

Return this EXACT JSON structure:
{
  "analysis": {
    "skin_tone": "brief description",
    "hair_color": "color",
    "body_type": "brief description",
    "overall_aesthetic": "brief description"
  },
  "styles": ["style1", "style2"],
  "recommended_colors": ["color1", "color2", "color3", "color4"],
  "tops": ["item1", "item2"],
  "bottoms": ["item1", "item2"],
  "shoes": ["item1", "item2"],
  "summary": "2-3 sentence personalized styling advice for this person."
}

IMPORTANT: Only return valid JSON. No markdown. Use only values from the valid lists above.`;

export async function POST(req: Request) {
    try {
        const { imageBase64 } = await req.json();

        if (!imageBase64) {
            return NextResponse.json({ success: false, error: "Image is required" }, { status: 400 });
        }

        // ── Step 1: AI Vision Analysis ──
        let aiResult: {
            analysis: { skin_tone: string; hair_color: string; body_type: string; overall_aesthetic: string };
            styles: string[];
            recommended_colors: string[];
            tops: string[];
            bottoms: string[];
            shoes: string[];
            summary: string;
        } | null = null;

        for (let i = 0; i < VISION_MODELS.length; i++) {
            const model = VISION_MODELS[i];
            try {
                console.log(`[AI Style From Photo] Attempt ${i + 1} — model: ${model}`);

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://fitova.vercel.app",
                        "X-Title": "Fitova AI Style From Photo"
                    },
                    body: JSON.stringify({
                        model,
                        max_tokens: 800,
                        messages: [
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: systemPrompt },
                                    { type: "image_url", image_url: { url: imageBase64 } }
                                ]
                            }
                        ]
                    })
                });

                if (!response.ok) {
                    const err = await response.text();
                    throw new Error(`HTTP ${response.status}: ${err}`);
                }

                const data = await response.json();
                let content = data.choices?.[0]?.message?.content || "";
                // Strip thinking tags and markdown
                content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error("No JSON in response");

                const parsed = JSON.parse(jsonMatch[0]);
                if (!parsed.styles?.length || !parsed.recommended_colors?.length) throw new Error("Invalid AI response structure");

                aiResult = parsed;
                console.log(`[AI Style From Photo] Success with ${model}`);
                break;
            } catch (e: any) {
                console.error(`[AI Style From Photo] Model ${model} failed:`, e.message);
            }
        }

        if (!aiResult) {
            return NextResponse.json(
                { success: false, error: "We couldn't analyze your photo. Try another image with better lighting." },
                { status: 500 }
            );
        }

        // ── Step 2: Match products from store ──
        const supabase = await createClient();

        // Map clothing categories to piece_types
        const categoryMap: Record<string, string[]> = {
            tops: ["Shirt", "T-Shirt", "Hoodie", "Jacket"],
            bottoms: ["Pants"],
            shoes: ["Shoes"],
        };

        const productQueries = Object.entries(categoryMap).map(async ([section, pieceTypes]) => {
            const styles = aiResult!.styles;
            const colors = aiResult!.recommended_colors.map(c => c.charAt(0).toUpperCase() + c.slice(1));

            // Try 1: Exact match
            let query = supabase
                .from("products")
                .select(`*, product_images(url, type)`)
                .in("piece_type", pieceTypes)
                .eq("stock_status", "In stock")
                .limit(2);

            if (styles.length > 0) query = query.overlaps("styles", styles);
            if (colors.length > 0) query = query.overlaps("colors", colors);

            let { data: products } = await query;

            // Fallback: drop color
            if (!products || products.length === 0) {
                let fallback = supabase
                    .from("products")
                    .select(`*, product_images(url, type)`)
                    .in("piece_type", pieceTypes)
                    .eq("stock_status", "In stock")
                    .limit(2);
                if (styles.length > 0) fallback = fallback.overlaps("styles", styles);
                const { data: f1 } = await fallback;
                products = f1;
            }

            // Fallback 2: piece_type only
            if (!products || products.length === 0) {
                const { data: f2 } = await supabase
                    .from("products")
                    .select(`*, product_images(url, type)`)
                    .in("piece_type", pieceTypes)
                    .eq("stock_status", "In stock")
                    .limit(2);
                products = f2;
            }

            if (!products || products.length === 0) return [];

            return products.map((product: any) => {
                const thumbnails = (product.product_images || [])
                    .filter((img: any) => img.type === "thumbnail")
                    .map((i: any) => i.url);
                const previews = (product.product_images || [])
                    .filter((img: any) => img.type === "preview")
                    .map((i: any) => i.url);

                return {
                    id: product.id,
                    title: product.name,
                    category: product.piece_type,
                    price: product.price,
                    discountedPrice: product.discounted_price,
                    imgs: {
                        thumbnails: thumbnails.length > 0 ? thumbnails : ["/images/products/product-1-bg-1.png"],
                        previews: previews.length > 0 ? previews : ["/images/products/product-1-bg-1.png"]
                    },
                    slug: product.slug,
                    brand: product.brand,
                    colors: product.colors,
                    tags: product.tags,
                    piece_type: product.piece_type,
                };
            });
        });

        const productResults = await Promise.all(productQueries);
        const suggestedProducts = productResults.flat();

        return NextResponse.json({
            success: true,
            analysis: aiResult.analysis,
            styles: aiResult.styles,
            recommended_colors: aiResult.recommended_colors,
            tops: aiResult.tops,
            bottoms: aiResult.bottoms,
            shoes: aiResult.shoes,
            summary: aiResult.summary,
            suggestedProducts,
        });

    } catch (err: any) {
        console.error("[AI Style From Photo] Fatal Error:", err);
        return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
    }
}
