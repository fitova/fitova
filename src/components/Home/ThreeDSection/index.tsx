"use client";
import React, { useRef, useEffect, useState, Suspense, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";

/* ─── Scroll progress within section (0 → 1) ─────────────── */
function useScrollProgress(ref: React.RefObject<HTMLDivElement | null>) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const el = ref.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const windowH = window.innerHeight;
            // Starts at 0 when section enters, hits 1 when section is scrolled past
            const raw = (windowH - rect.top) / (windowH + rect.height);
            setProgress(Math.min(1, Math.max(0, raw)));
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [ref]);

    return progress;
}

/* ─── Typing animation hook ───────────────────────────────── */
function useTypingAnimation(text: string, speed = 60, startDelay = 300) {
    const [displayed, setDisplayed] = useState("");
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const delay = setTimeout(() => setStarted(true), startDelay);
        return () => clearTimeout(delay);
    }, [startDelay]);

    useEffect(() => {
        if (!started) return;
        if (displayed.length >= text.length) return;
        const t = setTimeout(() => {
            setDisplayed(text.slice(0, displayed.length + 1));
        }, speed);
        return () => clearTimeout(t);
    }, [displayed, text, speed, started]);

    return displayed;
}

/* ─── Model component ─────────────────────────────────────── */
function Model({
    url,
    progress,
    xOffset,
    modelScale,
    startRotation,
}: {
    url: string;
    progress: number;
    xOffset: number;
    modelScale: number;
    startRotation: number; // initial Y rotation in radians
}) {
    const { scene } = useGLTF(url);
    const groupRef = useRef<THREE.Group>(null);
    const cloned = React.useMemo(() => scene.clone(true), [scene]);

    // Animated rotation starts at startRotation, lerps toward target on scroll
    const animRef = useRef({ rot: startRotation });

    useFrame(() => {
        if (!groupRef.current) return;

        // Rotate from startRotation → 0 (face viewer) over progress 0→0.5
        // After 0.5, stay facing viewer (rotation = 0)
        let targetRot: number;
        if (progress < 0.5) {
            const t = progress / 0.5;
            targetRot = startRotation * (1 - t);
        } else {
            targetRot = 0; // facing viewer, stay there
        }
        animRef.current.rot = THREE.MathUtils.lerp(animRef.current.rot, targetRot, 0.05);
        groupRef.current.rotation.y = animRef.current.rot;

        // Scale grows on scroll for zoom-in effect
        const scale = modelScale * (1 + progress * 0.65);
        groupRef.current.scale.setScalar(
            THREE.MathUtils.lerp(groupRef.current.scale.x, scale, 0.06)
        );

        // Models drift up on scroll (reveal upper body)
        const targetY = modelScale * 0.6 + progress * modelScale * 0.9;
        groupRef.current.position.y = THREE.MathUtils.lerp(
            groupRef.current.position.y,
            targetY,
            0.06
        );
    });

    return (
        <group
            ref={groupRef}
            position={[xOffset, modelScale * 0.6, 0]}
            scale={modelScale}
        >
            <primitive object={cloned} />
        </group>
    );
}

/* ─── Dynamic Camera: zooms toward chest on scroll ───────── */
function Camera({ progress }: { progress: number }) {
    const { camera } = useThree();
    useEffect(() => {
        (camera as THREE.PerspectiveCamera).fov = 48;
        camera.updateProjectionMatrix();
    }, [camera]);

    const camRef = useRef({ z: 4.0, y: 0.7 });

    useFrame(() => {
        // Camera stays at body-center height, looking straight ahead
        const targetZ = THREE.MathUtils.lerp(4.0, 2.2, progress);
        const targetY = THREE.MathUtils.lerp(0.7, 1.4, progress);
        camRef.current.z = THREE.MathUtils.lerp(camRef.current.z, targetZ, 0.05);
        camRef.current.y = THREE.MathUtils.lerp(camRef.current.y, targetY, 0.05);
        camera.position.set(0, camRef.current.y, camRef.current.z);
        camera.lookAt(0, camRef.current.y, 0); // straight ahead, no tilt
    });

    return null;
}

/* ─── 3D Canvas scene ─────────────────────────────────────── */
function Scene({ progress, modelScale, isMobile }: { progress: number; modelScale: number; isMobile: boolean }) {
    return (
        <Canvas
            gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
            dpr={isMobile ? [1, 1] : [1, 1.5]}
            style={{ background: "transparent", width: "100%", height: "100%" }}
            frameloop={isMobile ? "demand" : "always"}
        >
            <Camera progress={progress} />
            <ambientLight intensity={1.0} />
            <directionalLight position={[3, 8, 4]} intensity={1.8} />
            <directionalLight position={[-4, 3, -2]} intensity={0.6} />
            {!isMobile && <pointLight position={[0, 5, 0]} intensity={0.8} />}

            <Suspense fallback={null}>
                <Environment preset="studio" />

                <Model
                    url="/models/suit.glb"
                    progress={progress}
                    xOffset={-modelScale * 0.6}
                    modelScale={modelScale}
                    startRotation={Math.PI / 2}   // starts sideways
                />
                <Model
                    url="/models/coat.glb"
                    progress={progress}
                    xOffset={modelScale * 0.6}
                    modelScale={modelScale}
                    startRotation={-Math.PI}      // starts with back to viewer
                />

                {/* Skip expensive blur shadow pass on mobile */}
                {!isMobile && (
                    <ContactShadows
                        position={[0, -modelScale * 2.2, 0]}
                        opacity={0.2}
                        scale={modelScale * 8}
                        blur={3}
                    />
                )}
            </Suspense>
        </Canvas>
    );
}

/* ─── Main exported component ─────────────────────────────── */
const ThreeDSection = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const progress = useScrollProgress(sectionRef);

    // Responsive model scale + isMobile detection
    const [modelScale, setModelScale] = useState(1.25);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            setIsMobile(w < 768);
            setIsTablet(w >= 768 && w < 1024);
            if (w < 640) setModelScale(0.65);
            else if (w < 1024) setModelScale(0.90);
            else setModelScale(1.25);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const headline = useTypingAnimation("Dress Smarter.\nNot Harder.", 55, 400);

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden"
            style={{
                background: isMobile
                    ? "linear-gradient(to bottom, #0A0A0A 0%, #1A1A1A 40%, #888880 70%, #F0EDE8 100%)"
                    : "linear-gradient(to right, #0A0A0A 0%, #1A1A1A 28%, #888880 42%, #F0EDE8 52%, #FFFFFF 100%)",
                // On mobile: auto height to prevent overflow. On desktop: 100vh.
                minHeight: isMobile ? "auto" : "100vh",
                height: isMobile ? "auto" : "100vh",
            }}
        >
            {/* Responsive layout: row on large screens, col on mobile */}
            <div className="w-full flex flex-col lg:flex-row items-stretch lg:h-full">
                {/* ── Text + CTA ── */}
                <div
                    className="w-full lg:w-[42%] flex flex-col justify-center py-14 lg:py-0 z-10 px-5 sm:px-10 lg:px-0"
                    style={{ padding: isMobile ? "56px 24px 32px" : `0 clamp(24px, 5vw, 80px) 0 clamp(16px, 4vw, 60px)` }}
                >
                    {/* Eyebrow */}
                    <span
                        className="block text-xs font-light tracking-[0.35em] uppercase mb-6"
                        style={{ color: "#8A8A8A" }}
                    >
                        AI-Powered Fashion
                    </span>

                    {/* Typing headline */}
                    <h2
                        className="font-playfair text-3xl sm:text-4xl md:text-5xl xl:text-6xl leading-tight mb-6 whitespace-pre-line"
                        style={{ color: "#F6F5F2", letterSpacing: "-0.02em" }}
                    >
                        {headline}
                        <span
                            className="inline-block w-[3px] h-[0.85em] ml-1 align-middle"
                            style={{
                                backgroundColor: "#F6F5F2",
                                animation: "blink 1s step-end infinite",
                                opacity: headline.length >= "Dress Smarter.\nNot Harder.".length ? 0 : 1,
                            }}
                        />
                    </h2>

                    {/* Subtitle */}
                    <p
                        className="text-sm md:text-base font-light leading-relaxed mb-10 max-w-sm"
                        style={{ color: "#8A8A8A", letterSpacing: "0.02em" }}
                    >
                        Upload any clothing item and let our AI build you a complete look,
                        styled to perfection. Instant outfits. Real fashion intelligence.
                    </p>

                    {/* CTA */}
                    <Link
                        href="/ai-styling"
                        className="inline-flex items-center gap-3 self-start"
                    >
                        <span
                            className="flex items-center gap-3 text-sm font-light tracking-[0.12em] uppercase px-8 py-4 border ease-out duration-300 group"
                            style={{
                                borderColor: "#F6F5F2",
                                color: "#F6F5F2",
                                transition: "background 0.3s, color 0.3s",
                            }}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.background = "#F6F5F2";
                                el.style.color = "#0A0A0A";
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.background = "transparent";
                                el.style.color = "#F6F5F2";
                            }}
                        >
                            Start AI Styling
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M5 12h14M12 5l7 7-7 7"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    </Link>

                    {/* Scroll hint */}
                    <div className="mt-16 flex items-center gap-3" style={{ color: "#555" }}>
                        <div
                            className="w-px h-8 origin-top"
                            style={{
                                background: "#555",
                                transform: `scaleY(${1 - progress * 0.8})`,
                                transition: "transform 0.3s",
                            }}
                        />
                        <span className="text-xs font-light tracking-[0.2em] uppercase">
                            Scroll to explore
                        </span>
                    </div>
                </div>

                {/* ── 3D Canvas Container ── */}
                <div
                    className="w-full lg:w-[58%] relative flex-1"
                    style={{
                        height: isMobile ? "320px" : isTablet ? "480px" : "100%",
                        minHeight: isMobile ? "320px" : isTablet ? "480px" : undefined,
                    }}
                >
                    <Scene progress={progress} modelScale={modelScale} isMobile={isMobile} />
                </div>

            </div>{/* closes flex row */}

            {/* CSS for blink cursor */}
            <style jsx>{`
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
        `}</style>
        </section>
    );
};

// Preload
useGLTF.preload("/models/suit.glb");
useGLTF.preload("/models/coat.glb");

export default ThreeDSection;
