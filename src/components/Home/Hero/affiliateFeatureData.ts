export interface AffiliateFeature {
    title: string;
    description: string;
    icon: string; // SVG path string identifier
}

export const affiliateFeatureData: AffiliateFeature[] = [
    {
        title: "Verified Deals",
        description: "Every product is curated and partner-verified",
        icon: "verified",
    },
    {
        title: "Commission Transparency",
        description: "We show you exactly how we earn",
        icon: "transparency",
    },
    {
        title: "Smart AI Styling",
        description: "AI-powered outfit suggestions from your wardrobe",
        icon: "ai",
    },
    {
        title: "Weekly Trending Picks",
        description: "Updated every Monday with what's actually selling",
        icon: "trending",
    },
    {
        title: "Exclusive Partner Discounts",
        description: "Special codes for FITOVA community members",
        icon: "discount",
    },
];
