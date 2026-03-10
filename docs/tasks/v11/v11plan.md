PROMPT — Implement "AI Style From Photo" Feature (Stage 2)

You are working on an existing fashion styling web app that already has an AI Styling page.

Your task is to implement a new feature page called:

AI Style From Photo

This feature allows the user to upload their photo, then the AI will:

1. Analyze their appearance


2. Detect style compatibility


3. Recommend fashion styles


4. Suggest clothing pieces


5. Suggest best colors


6. Generate a styled image of the user wearing that style



This feature must integrate with the existing product system and style categories used in the site.


---

1 — PAGE CREATION

Create a new page:

/ai-style-from-photo

Add it to:

Desktop Navbar

Place it as the last item on the right.

Example navbar order:

Home
Shop
AI Styling
AI Style From Photo
Profile

Mobile Navigation

Add it directly under "AI Styling" in the mobile menu.


---

2 — PAGE DESIGN

The page design must be visually identical to the AI Styling page.

Reuse:

layout

cards

spacing

typography

colors

buttons

loading animations


Only the inputs and results differ.


---

3 — USER FLOW

User journey:

Step 1 — Upload Photo

User uploads a photo of themselves.

Supported:

jpg
png
webp

Show:

Upload card UI

Example:

Upload your photo

We will analyze your face, body shape, colors and suggest styles that fit you.

[ Upload Image ]


---

Step 2 — AI Analysis

Send the image to an AI vision model that analyzes appearance.

The AI must detect:

face structure

skin tone

hair color

body shape

gender presentation

visual proportions

overall aesthetic



---

Step 3 — Style Detection

The AI must determine which styles fit the user best.

IMPORTANT:

The styles MUST match the categories used in the website.

Example site categories:

Streetwear
Minimal
Formal
Sport
Casual
Vintage
Luxury
Techwear

The AI must only output styles that exist in the system.


---

Step 4 — Color Analysis

The AI must determine:

Best clothing colors for the user.

Output:

recommended_colors:
- black
- beige
- navy
- olive

Avoid:

Colors that clash with the user tone.


---

Step 5 — Clothing Piece Suggestions

The AI should recommend types of clothing pieces, not specific products.

Example:

tops:
- oversized hoodie
- minimal t-shirt
- cropped jacket

bottoms:
- wide pants
- cargo pants

shoes:
- chunky sneakers
- minimal sneakers

IMPORTANT:

These are categories, not store products.

Products will be matched later.


---

Step 6 — Generate Styled Image

Use the detected style to generate an image of the user.

The generated image should show:

The user wearing that style.

Example:

User photo →
AI generates version wearing streetwear outfit


---

4 — IMAGE GENERATION

Image generation must use OpenRouter API.

Use FREE models only.

Examples of free image generation models available in OpenRouter:

stabilityai/sdxl
playgroundai/playground-v2
stabilityai/sd-turbo
kandinsky-community/kandinsky-3

The system should:

1. Try multiple models


2. Compare outputs


3. Return the best generated image




---

5 — IMAGE GENERATION STRATEGY

When generating images:

Use the original user photo as reference.

Prompt structure:

fashion photoshoot of the same person in the uploaded photo,
wearing [detected style],
high fashion outfit,
studio lighting,
professional fashion photography,
realistic face,
natural skin texture,
high detail,
fashion editorial

Insert the style dynamically:

Example:

wearing modern streetwear outfit


---

6 — SYSTEM PROMPT FOR STYLE ANALYSIS

Use a strong system prompt for the AI analysis.

System prompt:

You are a professional fashion stylist and image analyst.

Your task is to analyze a person's photo and determine what fashion styles suit them best.

Analyze carefully:

- facial structure
- skin tone
- hair color
- visual balance
- perceived body proportions
- overall aesthetic impression

Then determine:

1) which fashion styles fit them best
2) which clothing colors suit them
3) what clothing types would look best on them

Important rules:

- Only return styles that exist in the site's style categories
- Suggest clothing types (not specific brands)
- Suggest clothing shapes that enhance the user's proportions
- Avoid recommending items that clash with their tone

Return a structured JSON response.


---

7 — AI RESPONSE FORMAT

The AI must return:

{
 "styles": ["streetwear", "minimal"],
 "recommended_colors": ["black","beige","navy"],
 "tops": ["oversized hoodie","minimal t-shirt"],
 "bottoms": ["wide pants","cargo pants"],
 "shoes": ["chunky sneakers","minimal sneakers"],
 "summary": "This user suits modern minimal and streetwear aesthetics due to neutral tones and balanced facial proportions."
}


---

8 — MATCH PRODUCTS FROM STORE

After AI returns clothing types:

Map them to store products.

Example:

oversized hoodie → hoodie category
wide pants → pants category

Then show recommended products.

Display section:

Recommended for you

Products should be filtered by:

style

color

clothing type



---

9 — RESULTS PAGE

After processing, show results sections:


---

Style Match

Cards showing:

Best Styles For You

Example cards:

Streetwear
Minimal


---

Colors That Fit You

Color palette cards.

Example:

Black
Beige
Navy
Olive


---

Clothing Suggestions

Sections:

Best Tops
Best Bottoms
Best Shoes

Each as cards.


---

Generated Outfit

Show generated image.

Title:

Your AI Styled Look


---

Product Suggestions

Show:

Recommended Products For You

Based on detected style.


---

10 — SHARE FEATURE

Add share button.

When user clicks share:

Generate share page:

/style-result/{id}

Preview card should show:

Generated outfit image

detected styles

color palette

CTA


Example:

This is my AI styled look.

Try it yourself →


---

11 — PERFORMANCE

Because image generation is heavy:

Add:

loading animation
progress steps

Example:

Analyzing face
Detecting style
Generating outfit
Preparing results


---

12 — ERROR HANDLING

If AI fails:

Fallback message:

We couldn't analyze your photo.

Try another image with better lighting.


---

FINAL RESULT

The new page must:

integrate with existing styling system

reuse design of AI Styling page

analyze user appearance

suggest styles

suggest colors

suggest clothing types

generate styled image

recommend products

allow sharing results