/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            // Supabase storage (avatars, lookbook covers, etc.)
            {
                protocol: "https",
                hostname: "**.supabase.co",
                pathname: "/storage/**",
            },
            // Placeholder images (dev only)
            {
                protocol: "https",
                hostname: "picsum.photos",
            },
            // Affiliate product images — allow all HTTPS domains
            // (covers Amazon, ASOS, Namshi, Zalando, and any future affiliate)
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
};

module.exports = nextConfig;

