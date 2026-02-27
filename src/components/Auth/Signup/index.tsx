"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const inputStyle = {
  border: "1px solid #E8E4DF",
  background: "#FAFAF9",
  color: "#1A1A1A",
};

const labelStyle =
  "block text-xs font-light tracking-[0.1em] uppercase mb-2";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    setLoading(false);

    if (error) {
      console.error("SUPABASE SIGNUP ERROR:", error);
      toast.error(error.message);
      return;
    }

    toast.success("Account created successfully!");
    router.push("/");
  };

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Breadcrumb title={"Create Account"} pages={["Sign Up"]} />
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
            <div className="mb-8">
              <h2
                className="font-playfair font-normal text-2xl xl:text-3xl text-dark mb-2"
                style={{ letterSpacing: "-0.02em" }}
              >
                Create Account
              </h2>
              <p
                className="text-xs font-light tracking-wide"
                style={{ color: "#8A8A8A" }}
              >
                Join Fitova and unlock your personal style world
              </p>
            </div>

            {/* Google button */}
            <div className="flex flex-col gap-3 mb-7">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="flex justify-center items-center gap-3 py-3 text-xs font-light tracking-[0.1em] ease-out duration-200"
                style={{ border: "1px solid #E8E4DF", color: "#4A4A4A", background: "#FAFAF9" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1A1A1A"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E8E4DF"; }}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M19.999 10.222C20.011 9.534 19.939 8.848 19.783 8.177H10.203V11.888H15.827C15.72 12.539 15.48 13.162 15.122 13.72C14.763 14.277 14.294 14.758 13.741 15.133L16.75 17.557C18.887 15.833 19.999 13.266 19.999 10.222Z" fill="#4285F4" />
                  <path d="M10.204 20C12.959 20 15.272 19.111 16.961 17.578L13.741 15.133C12.879 15.722 11.723 16.133 10.204 16.133C8.913 16.126 7.658 15.721 6.616 14.975C5.574 14.229 4.798 13.18 4.398 11.978L1.129 14.377C1.936 16.146 3.238 17.539 4.848 18.512C6.458 19.485 8.312 20 10.204 20Z" fill="#34A853" />
                  <path d="M4.399 11.978C4.176 11.341 4.061 10.673 4.058 10C4.062 9.328 4.173 8.661 4.387 8.022L1.088 5.511C0.373 6.903 0 8.441 0 10C0 11.559 0.373 13.096 1.088 14.489L4.399 11.978Z" fill="#FBBC05" />
                  <path d="M10.204 3.867C11.666 3.844 13.08 4.378 14.15 5.356L17.029 2.6C15.182 0.902 12.736-0.03 10.204 0C8.312 0 6.458 0.515 4.848 1.488C3.238 2.461 1.936 3.854 1.088 5.511L4.387 8.022C4.791 6.82 5.57 5.772 6.613 5.027C7.657 4.281 8.912 3.875 10.204 3.867Z" fill="#EB4335" />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-7">
              <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: "#E8E4DF" }} />
              <span
                className="relative inline-block px-3 bg-white text-xs font-light"
                style={{ left: "50%", transform: "translateX(-50%)", color: "#C8C4BF" }}
              >
                or
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="mb-5">
                <label htmlFor="name" className={labelStyle} style={{ color: "#4A4A4A" }}>
                  Full Name <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-3 px-4 text-sm font-light outline-none ease-out duration-200"
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#1A1A1A"; }}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#E8E4DF"; }}
                />
              </div>

              {/* Email */}
              <div className="mb-5">
                <label htmlFor="email" className={labelStyle} style={{ color: "#4A4A4A" }}>
                  Email Address <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 px-4 text-sm font-light outline-none ease-out duration-200"
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#1A1A1A"; }}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#E8E4DF"; }}
                />
              </div>

              {/* Password */}
              <div className="mb-5">
                <label htmlFor="password" className={labelStyle} style={{ color: "#4A4A4A" }}>
                  Password <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3 px-4 text-sm font-light outline-none ease-out duration-200"
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#1A1A1A"; }}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#E8E4DF"; }}
                />
              </div>

              {/* Confirm Password */}
              <div className="mb-5">
                <label htmlFor="re-password" className={labelStyle} style={{ color: "#4A4A4A" }}>
                  Confirm Password <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <input
                  type="password"
                  id="re-password"
                  name="re-password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full py-3 px-4 text-sm font-light outline-none ease-out duration-200"
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#1A1A1A"; }}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#E8E4DF"; }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs font-light tracking-[0.15em] uppercase ease-out duration-200 mt-4 disabled:opacity-60"
                style={{ background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#2C2C2C"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0A0A0A"; }}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              <p className="text-center text-xs font-light mt-6" style={{ color: "#8A8A8A" }}>
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-dark underline underline-offset-2 ease-out duration-200 hover:opacity-60"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
