/** @type {import('next').NextConfig} */
const nextConfig = {
    swcMinify: false,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.supabase.co",
                pathname: "/storage/**",
            },
            {
                protocol: "https",
                hostname: "picsum.photos",
            },
        ],
    },
};

module.exports = nextConfig;
