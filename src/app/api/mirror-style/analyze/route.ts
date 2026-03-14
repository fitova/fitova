import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

// Vision models — ordered fastest first (vision-capable free models)
const VISION_MODELS = [
    "google/gemma-3-12b-it:free",
    "google/gemma-3-27b-it:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "google/gemma-3-4b-it:free",
];

const VALID_STYLES = ["Casual", "Formal", "Street", "Sporty", "Minimal", "Elegant", "Gothic"];
const VALID_COLORS = ["black", "white", "navy", "red", "green", "beige", "grey", "brown", "olive", "burgundy", "camel", "cream", "blue", "pink", "orange"];

// ── Vision Analysis Prompt ──────────────────────────────────────────
// NOTE: No height/weight — these CANNOT be reliably determined from a photo.
// Instead we use visually observable attributes only.
const ANALYSIS_SYSTEM_PROMPT = `You are a professional AI fashion stylist at FITOVA. Analyze the uploaded photo of a person and return ONLY a raw JSON object — no markdown, no code fences, no extra text.

Carefully examine:
- perceived gender (Male / Female / Non-binary)
- actual hair color you can see (e.g. black, brown, blonde, red, grey, white)
- skin tone (light, medium, olive, dark, deep)
- face shape (oval, round, square, heart, diamond, oblong)
- body type visible (slim, athletic, regular, broad, curvy, plus)
- body frame (petite, average, tall) — estimate from proportions, not absolute numbers
- overall visual style aesthetic

Return EXACTLY this JSON structure:
{
  "analysis": {
    "gender": "Male or Female",
    "hair_color": "actual hair color you see",
    "skin_tone": "brief label",
    "face_shape": "shape label",
    "body_type": "type label",
    "body_frame": "petite or average or tall"
  },
  "styles": ["Casual", "Street"],
  "recommended_colors": ["black", "navy", "beige"],
  "tops": ["oversized hoodie", "minimal t-shirt"],
  "bottoms": ["wide pants", "cargo pants"],
  "shoes": ["chunky sneakers", "minimal sneakers"],
  "summary": "2-3 sentence premium personalized styling advice, written directly to the person."
}

Valid styles: ${VALID_STYLES.join(', ')}
Valid colors: ${VALID_COLORS.join(', ')}
IMPORTANT: Only return valid JSON. No text before or after. No "Estimated" values — only describe what you can actually see.`;

// ── Image prompt for Pollinations ──────────────────────────────────
function buildImagePrompt(
    analysis: any,
    styles: string[],
    tops: string[],
    bottoms: string[],
    palette: string[]
): string {
    const primaryStyle = styles[0] || "Minimal";
    const outfit = [tops[0], bottoms[0]].filter(Boolean).join(" with ") || "modern outfit";
    const skinTone = analysis?.skin_tone || "medium";
    const faceShape = analysis?.face_shape || "oval";
    const bodyType = analysis?.body_type || "athletic";
    const gender = analysis?.gender || "person";
    const colors = palette.slice(0, 3).join(", ");

    return `Professional high-fashion editorial portrait. A ${gender} model with ${skinTone} skin, ${faceShape} face, ${bodyType} build. Wearing ${primaryStyle.toLowerCase()} style: ${outfit}. Color palette: ${colors}. Neutral studio background, cinematic lighting, fashion editorial, photorealistic, 4K resolution. Clean white background.`;
}

// ── Image Generation via Hugging Face Inference API (free, no key needed) ─
const HF_IMAGE_MODELS = [
    "black-forest-labs/FLUX.1-schnell",
    "stabilityai/stable-diffusion-xl-base-1.0",
];

async function tryGenerateImage(prompt: string): Promise<string | null> {
    const safePrompt = prompt.replace(/[^a-zA-Z0-9\s,.\-!]/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);

    for (const model of HF_IMAGE_MODELS) {
        try {
            console.log(`[Mirror Style] Generating image with HuggingFace: ${model}`);
            const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "image/png",
                },
                body: JSON.stringify({
                    inputs: safePrompt,
                    parameters: { width: 768, height: 1024 },
                }),
                signal: AbortSignal.timeout(45000),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error(`[Mirror Style] HF model ${model} failed: ${response.status}`, errText.slice(0, 150));
                continue;
            }

            const contentType = response.headers.get("content-type") || "image/png";
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const ext = contentType.includes("jpeg") ? "jpg" : "png";
            const base64 = `data:${contentType};base64,${buffer.toString("base64")}`;
            console.log(`[Mirror Style] ✅ Image generated with ${model}, size: ${buffer.length} bytes`);
            return base64;
        } catch (e: any) {
            console.error(`[Mirror Style] HF model ${model} error:`, e.message);
        }
    }
    return null;
}

// ── Upload to Supabase Storage ──────────────────────────────────────
async function uploadToStorage(
    supabase: any,
    fileInput: string,
    folder: string,
    fileName: string
): Promise<string | null> {
    try {
        let buffer: Buffer;
        let mime = "image/jpeg";
        let ext = "jpg";

        if (fileInput.startsWith("http")) {
            // It's a URL (Pollinations), fetch it
            console.log("[Mirror Style] Fetching URL:", fileInput);
            try {
                const res = await fetch(fileInput, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Accept": "image/jpeg, image/png, image/webp, */*"
                    }
                });
                if (!res.ok) {
                    const text = await res.text();
                    console.error("[Mirror Style] Pollinations fetch failed:", res.status, text.slice(0, 200));
                    throw new Error("Failed to fetch image from URL");
                }
                const arrayBuffer = await res.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
                mime = res.headers.get("content-type") || "image/jpeg";
                ext = mime.split("/")[1] || "jpg";
                console.log("[Mirror Style] Successfully fetched Pollinations image, Size:", buffer.length);
            } catch (err: any) {
                console.error("[Mirror Style] Could not download Pollinations image to server. Falling back to direct URL.", err.message);
                // If we can't download it to our server, just return the direct URL so the user can still see it
                return fileInput;
            }
        } else {
            // It's base64
            const base64Data = fileInput.includes(",") ? fileInput.split(",")[1] : fileInput;
            const mimeMatch = fileInput.match(/data:([^;]+);/);
            mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
            ext = mime.split("/")[1] || "jpg";
            buffer = Buffer.from(base64Data, "base64");
        }

        const path = `${folder}/${fileName}.${ext}`;

        const { data, error } = await supabase.storage
            .from("mirror-style")
            .upload(path, buffer, {
                contentType: mime,
                upsert: true,
            });

        if (error) {
            console.error("[Mirror Style] Storage upload error:", error.message);
            return null;
        }

        const { data: urlData } = supabase.storage
            .from("mirror-style")
            .getPublicUrl(path);

        return urlData?.publicUrl || null;
    } catch (e: any) {
        console.error("[Mirror Style] Storage exception:", e.message);
        return null;
    }
}

// ── Main API handler ────────────────────────────────────────────────
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { imageBase64, userId } = body;

        if (!imageBase64) {
            return NextResponse.json({ success: false, error: "Image is required" }, { status: 400 });
        }

        const supabase = await createClient(); // user-context client (for DB)
        const timestamp = Date.now();
        const userFolder = userId || "anon";

        // ── Step 1: Upload original photo ──────────────────────────
        console.log("[Mirror Style] Uploading original image...");
        const originalUrl = await uploadToStorage(
            supabase,
            imageBase64,
            `user-uploads/${userFolder}`,
            `original-${timestamp}`
        );
        console.log("[Mirror Style] Original image URL:", originalUrl ? "✅ uploaded" : "❌ failed");

        // ── Step 2: AI Vision Analysis ──────────────────────────────
        let aiResult: any = null;

        for (const model of VISION_MODELS) {
            try {
                console.log(`[Mirror Style] Analyzing with: ${model}`);

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://fitova.vercel.app",
                        "X-Title": "Fitova Mirror Style"
                    },
                    body: JSON.stringify({
                        model,
                        max_tokens: 900,
                        messages: [{
                            role: "user",
                            content: [
                                { type: "text", text: ANALYSIS_SYSTEM_PROMPT },
                                { type: "image_url", image_url: { url: imageBase64 } }
                            ]
                        }]
                    }),
                    signal: AbortSignal.timeout(25000),
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                let content = data.choices?.[0]?.message?.content || "";
                // Strip thinking tags, markdown fences
                content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error("No JSON in response");

                const parsed = JSON.parse(jsonMatch[0]);
                if (!parsed.styles?.length) throw new Error("Invalid AI response");

                aiResult = parsed;
                console.log(`[Mirror Style] Analysis success with ${model}`);
                break;
            } catch (e: any) {
                console.error(`[Mirror Style] Model ${model} failed:`, e.message);
            }
        }

        if (!aiResult) {
            return NextResponse.json(
                { success: false, error: "We couldn't analyze your photo. Try another image with better lighting." },
                { status: 500 }
            );
        }

        // ── Step 3: Generate styled image via HuggingFace ──────────
        const imagePrompt = buildImagePrompt(
            aiResult.analysis,
            aiResult.styles,
            aiResult.tops,
            aiResult.bottoms,
            aiResult.recommended_colors
        );

        let generatedImageUrl: string | null = await tryGenerateImage(imagePrompt);
        console.log("[Mirror Style] Generated image:", generatedImageUrl ? `✅ (${generatedImageUrl.length} chars)` : "❌ none");

        // If we got base64 back from HuggingFace, upload it to Supabase Storage
        if (generatedImageUrl?.startsWith("data:")) {
            console.log("[Mirror Style] Uploading HF base64 image to Storage...");
            const storedUrl = await uploadToStorage(
                supabase,
                generatedImageUrl,
                `ai-generated/${userFolder}`,
                `styled-${timestamp}`
            );
            if (storedUrl) {
                generatedImageUrl = storedUrl;
                console.log("[Mirror Style] ✅ AI image stored at:", storedUrl);
            }
        }

        // ── Step 4: Match products from store ──────────────────────
        const categoryMap: Record<string, string[]> = {
            tops: ["Shirt", "T-Shirt", "Hoodie", "Jacket"],
            bottoms: ["Pants"],
            shoes: ["Shoes"],
        };

        const productQueries = Object.entries(categoryMap).map(async ([, pieceTypes]) => {
            const styles = aiResult!.styles;
            const colors = aiResult!.recommended_colors.map((c: string) =>
                c.charAt(0).toUpperCase() + c.slice(1)
            );

            let query = supabase
                .from("products")
                .select(`*, product_images(url, type)`)
                .in("piece_type", pieceTypes)
                .eq("stock_status", "In stock")
                .limit(2);

            if (styles.length > 0) query = query.overlaps("styles", styles);
            if (colors.length > 0) query = query.overlaps("colors", colors);

            let { data: products } = await query;

            if (!products?.length) {
                const { data: f1 } = await supabase
                    .from("products")
                    .select(`*, product_images(url, type)`)
                    .in("piece_type", pieceTypes)
                    .eq("stock_status", "In stock")
                    .limit(2);
                products = f1;
            }

            return (products || []).map((p: any) => {
                const thumbnails = (p.product_images || [])
                    .filter((img: any) => img.type === "thumbnail")
                    .map((i: any) => i.url);
                return {
                    id: p.id,
                    title: p.name,
                    price: p.price,
                    discountedPrice: p.discounted_price,
                    imgs: {
                        thumbnails: thumbnails.length > 0 ? thumbnails : ["/images/products/product-1-bg-1.png"],
                        previews: thumbnails,
                    },
                    slug: p.slug,
                    piece_type: p.piece_type,
                };
            });
        });

        const productResults = await Promise.all(productQueries);
        const suggestedProducts = productResults.flat();

        // ── Step 5: Save result to DB ──────────────────────────────
        const shareToken = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

        const { error: dbError } = await supabase
            .from("mirror_style_results")
            .insert({
                user_id: userId || null,
                original_image_url: originalUrl || "",
                ai_image_url: generatedImageUrl || "",
                analysis_json: aiResult.analysis || {},
                styles: aiResult.styles || [],
                colors: aiResult.recommended_colors || [],
                clothing_suggestions: {
                    tops: aiResult.tops || [],
                    bottoms: aiResult.bottoms || [],
                    shoes: aiResult.shoes || [],
                },
                summary: aiResult.summary || "",
                share_token: shareToken,
            });

        if (dbError) {
            console.error("[Mirror Style] DB save error:", dbError.message);
        }

        return NextResponse.json({
            success: true,
            analysis: aiResult.analysis,
            styles: aiResult.styles,
            recommended_colors: aiResult.recommended_colors,
            tops: aiResult.tops,
            bottoms: aiResult.bottoms,
            shoes: aiResult.shoes,
            summary: aiResult.summary,
            originalImageUrl: originalUrl || imageBase64,
            generatedImageUrl: generatedImageUrl || null,
            shareToken: dbError ? null : shareToken,
            suggestedProducts,
        });

    } catch (err: any) {
        console.error("[Mirror Style] Fatal error:", err);
        return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
    }
}
