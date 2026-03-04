import { useEffect, useRef } from "react";

/**
 * useScrollReveal
 * Attaches an IntersectionObserver to the returned ref.
 * When the element scrolls into view, it adds 'revealed' class.
 * Use with CSS: .sr { opacity: 0; transform: translateY(24px); transition: all 0.6s ease; }
 *               .sr.revealed { opacity: 1; transform: none; }
 */
export function useScrollReveal(threshold = 0.15) {
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add("revealed");
                    observer.unobserve(el);
                }
            },
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return ref;
}
