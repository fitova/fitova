"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Lightweight scroll-reveal hook using IntersectionObserver.
 * Returns a ref to attach to the target element and an `isVisible` boolean.
 * When visible, apply transition classes to animate in.
 */
export function useScrollReveal(threshold = 0.15) {
    const ref = useRef<HTMLElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(el); // fire once
                }
            },
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    const revealClass = isVisible
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-8";

    const baseClass =
        "transition-all duration-700 ease-out";

    return { ref, isVisible, revealClass, baseClass };
}
