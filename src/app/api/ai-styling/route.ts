import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";

// Ordered by speed — fastest first
const VISION_MODELS = [
    "google/gemma-3-12b-it:free",
    "google/gemma-3-27b-it:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "google/gemma-3-4b-it:free",
];

// Valid values that match our DB taxonomy
const VALID_STYLES = ["Casual", "Formal", "Street", "Sporty", "Minimal", "Elegant", "gothic"];
const VALID_COLORS = ["Black", "White", "Navy", "Red", "Green", "Beige", "Grey", "Brown"];
const VALID_PIECE_TYPES = ["Shirt", "Pants", "Shoes", "Jacket", "Accessories", "Bag", "Dress", "Hoodie", "T-Shirt"];
const VALID_MOODS = ["Confident", "Chill", "Bold", "Minimal", "Elegant"];
const VALID_OCCASIONS = ["Date", "Work", "Wedding", "Travel", "Gym"];
const VALID_SEASONS = ["Summer", "Winter", "Spring", "Autumn"];

const systemPrompt = `You are Fitova's expert AI Fashion Stylist. Analyze the clothing item in the image and return ONLY a raw JSON object (no markdown).

Valid values you MUST use:
- styles: ${VALID_STYLES.join(', ')}
- colors: ${VALID_COLORS.join(', ')}  
- gender: Men, Women, or Unisex (Auto-detect from the image)
- piece_types: ${VALID_PIECE_TYPES.join(', ')}
- seasons: ${VALID_SEASONS.join(', ')}
- moods: ${VALID_MOODS.join(', ')}
- occasions: ${VALID_OCCASIONS.join(', ')}

Return this exact structure:
{
  "identifiedItem": {
    "name": "short catchy item name",
    "color": "one of the valid colors above",
    "style": "one of the valid styles above",
    "gender": "Men, Women, or Unisex",
    "season": "one of the valid seasons above",
    "mood": "one of the valid moods above",
    "occasion": "one of the valid occasions above",
    "description": "2 sentence styling advice"
  },
  "filters": [
    { "piece_type": "Pants", "styles": ["Casual"], "colors": ["Black"], "season": "Winter", "matchReason": "why it pairs with this item" },
    { "piece_type": "Shoes", "styles": ["Casual"], "colors": ["White"], "season": "Winter", "matchReason": "why it pairs with this item" },
    { "piece_type": "Jacket", "styles": ["Casual"], "colors": ["Grey"], "season": "Winter", "matchReason": "why it pairs with this item" },
    { "piece_type": "Accessories", "styles": ["Minimal"], "colors": ["Black"], "season": "Winter", "matchReason": "why it pairs with this item" }
  ]
}

IMPORTANT: filters must have exactly 4 items. Only use the valid values listed above.`;

export async function POST(req: Request) {
    try {
        const { imageBase64 } = await req.json();

        if (!imageBase64) {
            return NextResponse.json({ error: "Image is required" }, { status: 400 });
        }

        // ── Step 1: Ask AI to analyze the image and return style filters ──
        let aiResult: any = null;

        for (let i = 0; i < Math.min(3, VISION_MODELS.length); i++) {
            const model = VISION_MODELS[i];
            try {
                console.log(`[AI Styling] Attempt ${i + 1} — model: ${model}`);

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://fitova.vercel.app",
                        "X-Title": "Fitova AI Styling"
                    },
                    body: JSON.stringify({
                        model,
                        max_tokens: 600,
                        messages: [
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: `${systemPrompt}\n\nUser Request:\nAnalyze this clothing item and suggest an outfit.` },
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
                // Strip markdown + thinking tags
                content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error("No JSON in response");

                const parsed = JSON.parse(jsonMatch[0]);
                if (!parsed.identifiedItem || !parsed.filters?.length) throw new Error("Invalid structure");

                aiResult = parsed;
                console.log(`[AI Styling] AI success with ${model}:`, JSON.stringify(aiResult.identifiedItem));
                break;
            } catch (e: any) {
                console.error(`[AI Styling] Model ${model} failed:`, e.message);
            }
        }

        if (!aiResult) {
            return NextResponse.json({ error: "Could not analyze the image. Please try again." }, { status: 500 });
        }

        // ── Step 2: Query Supabase for real products matching each filter ──
        const supabase = await createClient();

        // Extract gender from what the AI detected
        const detectedGender = aiResult.identifiedItem?.gender || "Unisex";

        const productQueries = aiResult.filters.slice(0, 4).map(async (filter: any) => {
            const pieceType = filter.piece_type;
            const styles: string[] = filter.styles || [];
            const colors: string[] = filter.colors || [];
            const season: string = filter.season || "";
            const matchReason: string = filter.matchReason || "";

            // Build gender tag filter
            const genderTags: string[] = [];
            if (detectedGender === "Men") genderTags.push("men", "unisex");
            else if (detectedGender === "Women") genderTags.push("women", "unisex");

            // Try 1: Exact match with piece_type + styles + colors + season
            let query = supabase
                .from("products")
                .select(`*, product_images(url, type)`)
                .eq("piece_type", pieceType)
                .eq("stock_status", "In stock")
                .limit(1);

            if (styles.length > 0) query = query.overlaps("styles", styles);
            if (colors.length > 0) query = query.overlaps("colors", colors);
            if (season) query = query.ilike("season", season);
            if (genderTags.length > 0) query = query.overlaps("tags", genderTags);

            let { data: products } = await query;

            // Fallback 1: Drop color & season, keep style + gender
            if (!products || products.length === 0) {
                let fallback1 = supabase
                    .from("products")
                    .select(`*, product_images(url, type)`)
                    .eq("piece_type", pieceType)
                    .eq("stock_status", "In stock")
                    .limit(1);
                if (styles.length > 0) fallback1 = fallback1.overlaps("styles", styles);
                if (genderTags.length > 0) fallback1 = fallback1.overlaps("tags", genderTags);
                const { data: f1 } = await fallback1;
                products = f1;
            }

            // Fallback 2: Drop style, piece_type only
            if (!products || products.length === 0) {
                const { data: f2 } = await supabase
                    .from("products")
                    .select(`*, product_images(url, type)`)
                    .eq("piece_type", pieceType)
                    .eq("stock_status", "In stock")
                    .limit(1);
                products = f2;
            }

            if (!products || products.length === 0) return null;

            const product = products[0];
            const thumbnail = (product.product_images || []).find((img: any) => img.type === "thumbnail");

            // Map to the color gradient for fallback visual
            const colorGradients: Record<string, string> = {
                Black: "linear-gradient(135deg, #0A0A0A 0%, #2C2C2C 100%)",
                White: "linear-gradient(135deg, #F0F0F0 0%, #E0E0E0 100%)",
                Navy: "linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 100%)",
                Grey: "linear-gradient(135deg, #4A4A4A 0%, #787878 100%)",
                Beige: "linear-gradient(135deg, #C8B99A 0%, #E8D8C0 100%)",
                Brown: "linear-gradient(135deg, #3B1F0A 0%, #7B4A2A 100%)",
                Red: "linear-gradient(135deg, #8B0000 0%, #C0392B 100%)",
                Green: "linear-gradient(135deg, #1A3A1A 0%, #27AE60 100%)",
            };
            const dominantColor = (product.colors?.[0]) || "Black";
            const gradient = colorGradients[dominantColor] || "linear-gradient(135deg, #0A0A0A 0%, #2C2C2C 100%)";

            return {
                id: product.id,
                name: product.name,
                category: pieceType,
                price: product.discounted_price || product.price,
                matchReason,
                gradient,
                imageUrl: thumbnail?.url || null,
                affiliateLink: product.affiliate_link || null,
                slug: product.slug,
            };
        });

        const rawSuggestions = await Promise.all(productQueries);
        const suggestions = rawSuggestions.filter(Boolean);

        if (suggestions.length === 0) {
            return NextResponse.json({ error: "No matching products found. Please try again with a different image." }, { status: 404 });
        }

        return NextResponse.json({
            identifiedItem: aiResult.identifiedItem,
            suggestions,
        });

    } catch (err: any) {
        console.error("[AI Styling] Fatal Error:", err);
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}
