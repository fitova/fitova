"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email.");
            return;
        }
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        setLoading(false);

        if (error) {
            toast.error(error.message);
            return;
        }

        setSuccessMsg(true);
        toast.success("Password reset link sent to your email!");
    };

    return (
        <>
            <Breadcrumb title={"Forgot Password"} pages={["Forgot Password"]} />
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
                                Reset Password
                            </h2>
                            {successMsg ? (
                                <p className="text-sm font-light text-green-700 bg-green-50 p-4 border border-green-200">
                                    We've sent a password reset link to your email. Please check your inbox and spam folder.
                                </p>
                            ) : (
                                <p
                                    className="text-xs font-light tracking-wide"
                                    style={{ color: "#8A8A8A" }}
                                >
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                            )}
                        </div>

                        {!successMsg && (
                            <form onSubmit={handleSubmit}>
                                {/* Email */}
                                <div className="mb-5">
                                    <label
                                        htmlFor="email"
                                        className="block text-xs font-light tracking-[0.1em] uppercase mb-2"
                                        style={{ color: "#4A4A4A" }}
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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
                                    {loading ? "Sending Link..." : "Send Reset Link"}
                                </button>
                            </form>
                        )}

                        <p
                            className="text-center text-xs font-light mt-7"
                            style={{ color: "#8A8A8A" }}
                        >
                            Remembered your password?{" "}
                            <Link
                                href="/signin"
                                className="text-dark underline underline-offset-2 ease-out duration-200 hover:opacity-60"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ForgotPassword;
