import { useEffect, useRef, useState } from "react";

/**
 * useScrollReveal
 * Attaches an IntersectionObserver to the returned ref.
 * When the element scrolls into view, revealClass is updated to include 'revealed'.
 * Use with CSS: .sr { opacity: 0; transform: translateY(24px); transition: all 0.6s ease; }
 *               .sr.revealed { opacity: 1; transform: none; }
 */
export function useScrollReveal(threshold = 0.15) {
    const ref = useRef<HTMLElement | null>(null);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setRevealed(true);
                    observer.unobserve(el);
                }
            },
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return {
        ref,
        baseClass: "sr",
        revealClass: revealed ? "revealed" : "",
    };
}
