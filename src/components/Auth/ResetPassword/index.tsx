"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Optional: verification to ensure user is in recovery mode or has an active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                toast.error("Invalid or expired reset link.");
                router.push("/signin");
            }
        });
    }, [router, supabase.auth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.error("Please fill in all fields.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        setLoading(false);

        if (error) {
            toast.error(error.message);
            return;
        }

        toast.success("Password updated successfully! You can now sign in.");
        router.push("/my-account");
    };

    return (
        <>
            <Breadcrumb title={"Set New Password"} pages={["Set New Password"]} />
            <section
                className="overflow-hidden py-20"
                style={{ background: "#F6F5F2" }}
            >
                <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
                    <div
                        className="max-w-[495px] w-full mx-auto p-8 sm:p-10 xl:p-12"
                        style={{ background: "#FFFFFF", border: "1px solid #E8E4DF" }}
                    >
                        {/* Header */}
                        <div className="mb-10 text-center">
                            <h2
                                className="font-playfair font-normal text-2xl xl:text-3xl text-dark mb-4"
                                style={{ letterSpacing: "-0.02em" }}
                            >
                                Set New Password
                            </h2>
                            <p
                                className="text-xs font-light tracking-wide"
                                style={{ color: "#8A8A8A" }}
                            >
                                Enter your new password below.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Password */}
                            <div className="mb-5">
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-light tracking-[0.1em] uppercase mb-2"
                                    style={{ color: "#4A4A4A" }}
                                >
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full py-3 px-4 text-sm font-light outline-none ease-out duration-200"
                                    style={{
                                        border: "1px solid #E8E4DF",
                                        background: "#FAFAF9",
                                        color: "#1A1A1A",
                                    }}
                                    onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#1A1A1A"; }}
                                    onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#E8E4DF"; }}
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="mb-5">
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-xs font-light tracking-[0.1em] uppercase mb-2"
                                    style={{ color: "#4A4A4A" }}
                                >
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full py-3 px-4 text-sm font-light outline-none ease-out duration-200"
                                    style={{
                                        border: "1px solid #E8E4DF",
                                        background: "#FAFAF9",
                                        color: "#1A1A1A",
                                    }}
                                    onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#1A1A1A"; }}
                                    onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#E8E4DF"; }}
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 text-xs font-light tracking-[0.15em] uppercase ease-out duration-200 mt-6 disabled:opacity-60"
                                style={{ background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }}
                                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#2C2C2C"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0A0A0A"; }}
                            >
                                {loading ? "Updating Password..." : "Update Password"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ResetPassword;
