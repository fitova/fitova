"use client";

const VideoHero = () => {
    return (
        <section
            className="relative w-full overflow-hidden"
            style={{ height: "100vh", background: "#0A0A0A" }}
        >
            {/* ── Background video ─────────────────────────────── */}
            {/*
          TO ADD YOUR VIDEO:
          1. Place your .mp4 file inside the /public/videos/ folder
          2. Change the src below to: /videos/your-filename.mp4
      */}
            <video
                className="absolute inset-0 w-full h-full object-contain"
                style={{ opacity: 1, transition: "opacity 0.6s" }}
                src="/images/media/Jan_30__2251_15s_202601302305_bvw76.mp4"
                muted
                loop
                playsInline
                autoPlay
            />

            {/* ── Dark gradient overlay ─────────────────────────── */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.1) 50%, rgba(10,10,10,0.6) 100%)",
                }}
            />

            {/* ── Center content ────────────────────────────────── */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-4">
                {/* Eyebrow */}
                <span
                    className="block font-light tracking-[0.4em] uppercase text-xs mb-8"
                    style={{ color: "rgba(246,245,242,0.6)" }}
                >
                    Fitova — AI Fashion
                </span>

                {/* Headline */}
                <h1
                    className="font-playfair text-4xl sm:text-6xl lg:text-7xl xl:text-8xl mb-10 leading-tight"
                    style={{
                        color: "#F6F5F2",
                        letterSpacing: "-0.03em",
                        textShadow: "0 2px 40px rgba(0,0,0,0.4)",
                    }}
                >
                    Wear Your
                    <br />
                    <em style={{ fontStyle: "italic", fontWeight: 400 }}>Identity</em>
                </h1>

                {/* Shop button */}
                <a
                    href="/shop-with-sidebar"
                    className="group relative inline-flex items-center justify-center gap-3 font-light text-xs tracking-[0.15em] uppercase border px-10 py-4 mt-8 ease-out duration-300 hover:bg-[#F6F5F2] hover:text-[#0A0A0A]"
                    style={{
                        borderColor: "#F6F5F2",
                        color: "#F6F5F2",
                    }}
                >
                    Shop Now
                </a>
            </div>

            {/* ── Scroll indicator ──────────────────────────────── */}
            <div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
                style={{ color: "rgba(246,245,242,0.45)" }}
            >
                <div
                    className="w-px h-12 origin-top"
                    style={{
                        background:
                            "linear-gradient(to bottom, rgba(246,245,242,0.5), transparent)",
                        animation: "scrollPulse 2s ease-in-out infinite",
                    }}
                />
                <span className="text-[10px] font-light tracking-[0.3em] uppercase">
                    Scroll
                </span>
            </div>

            <style jsx>{`
        @keyframes scrollPulse {
          0%, 100% { transform: scaleY(1); opacity: 0.5; }
          50%       { transform: scaleY(0.5); opacity: 1; }
        }
      `}</style>
        </section>
    );
};

export default VideoHero;
