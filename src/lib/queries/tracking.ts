import { createClient } from "../supabase/client";

export const tracking = {
    // Track product view with a 30 min debounce built into the UI logic or DB
    async trackProductView(productId: string, userId?: string) {
        if (!userId) {
            // Anonymous user: Store in localStorage
            if (typeof window === "undefined") return;

            try {
                const stored = localStorage.getItem("fitova_rv");
                let rvList: string[] = stored ? JSON.parse(stored) : [];

                // Remove if exists to push it to the top
                rvList = rvList.filter((id) => id !== productId);
                rvList.unshift(productId);

                // Keep only last 20
                if (rvList.length > 20) {
                    rvList = rvList.slice(0, 20);
                }

                localStorage.setItem("fitova_rv", JSON.stringify(rvList));
            } catch (err) {
                console.error("Failed to track view in localStorage", err);
            }
            return;
        }

        // Authenticated user: Insert into DB (fire and forget)
        const supabase = createClient();
        try {
            // Note: We'll rely on a lightweight check or just insert since Postgres can handle volume.
            // A true debounce would be a quick SELECT first or an ON CONFLICT rule if we had one.
            const { error } = await supabase
                .from("product_views")
                .insert({ product_id: productId, user_id: userId });

            if (error) console.error("Failed to track view in DB:", error);
        } catch (err) {
            console.error("Failed to track view in DB:", err);
        }
    },

    async trackCartEvent(productId: string, userId?: string, eventType: "add" | "remove" = "add") {
        // Only track cart events for logged-in users to affect global trending
        if (!userId) return;

        const supabase = createClient();
        try {
            const { error } = await supabase
                .from("cart_events")
                .insert({ product_id: productId, user_id: userId, event_type: eventType });

            if (error) console.error("Failed to track cart event:", error);
        } catch (err) {
            console.error("Failed to track cart event:", err);
        }
    },

    async trackAffiliateClick(productId: string) {
        const supabase = createClient();
        try {
            // Using an RPC function would be safest to increment to avoid race conditions
            // But for simplicity, we can do a read-then-write or create a quick RPC.
            // We will create an RPC: increment_affiliate_click(p_id uuid)
            const { error } = await supabase.rpc("increment_affiliate_click", {
                p_id: productId,
            });

            if (error) console.error("Failed to track affiliate click:", error);
        } catch (err) {
            console.error("Failed to track affiliate click:", err);
        }
    },

    async syncRecentlyViewed(userId: string) {
        if (typeof window === "undefined") return;

        try {
            const stored = localStorage.getItem("fitova_rv");
            if (!stored) return;

            const rvList: string[] = JSON.parse(stored);
            if (!Array.isArray(rvList) || rvList.length === 0) return;

            const supabase = createClient();

            // Insert all products in parallel
            const promises = rvList.map((productId) =>
                supabase.from("product_views").insert({ product_id: productId, user_id: userId })
            );

            await Promise.allSettled(promises);

            // Optional: clear local storage so we don't sync them again next time
            localStorage.removeItem("fitova_rv");
        } catch (err) {
            console.error("Failed to sync recently viewed items:", err);
        }
    },
};
