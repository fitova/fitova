"use client";
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { useRouter } from "next/navigation";

import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { tracking } from "@/lib/queries/tracking";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: false,
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(false); // Default to false for UI testing
    const router = useRouter();

    const supabase = createClient();

    useEffect(() => {
        let mounted = true;

        async function getSession() {
            setLoading(true);
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();

            if (mounted) {
                if (error) {
                    console.error("Error getting session:", error.message);
                } else {
                    setSession(session);
                    const loggedInUser = session?.user ?? null;
                    setUser(loggedInUser);
                    if (loggedInUser) {
                        tracking.syncRecentlyViewed(loggedInUser.id);
                    }
                }
                setLoading(false);
            }
        }

        getSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session);
                const loggedInUser = session?.user ?? null;
                setUser(loggedInUser);

                // Only sync on SIGN_IN or initial load
                if (_event === "SIGNED_IN" && loggedInUser) {
                    tracking.syncRecentlyViewed(loggedInUser.id);
                }

                router.refresh(); // Refresh to update server components
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [router, supabase]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }, [router, supabase]);

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export function useCurrentUser() {
    const { user, loading } = useAuth();
    return { user, loading };
}
