"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Signed in successfully!");
    router.push("/my-account");
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
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

  const handleGithubSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
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
      <Breadcrumb title={"Sign In"} pages={["Sign In"]} />
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
            <div className="mb-10">
              <h2
                className="font-playfair font-normal text-2xl xl:text-3xl text-dark mb-2"
                style={{ letterSpacing: "-0.02em" }}
              >
                Welcome Back
              </h2>
              <p
                className="text-xs font-light tracking-wide"
                style={{ color: "#8A8A8A" }}
              >
                Enter your credentials to access your account
              </p>
            </div>

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

              {/* Password */}
              <div className="mb-5">
                <label
                  htmlFor="password"
                  className="block text-xs font-light tracking-[0.1em] uppercase mb-2"
                  style={{ color: "#4A4A4A" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  autoComplete="on"
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

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs font-light tracking-[0.15em] uppercase ease-out duration-200 mt-6 disabled:opacity-60"
                style={{ background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#2C2C2C"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0A0A0A"; }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

              <a
                href="#"
                className="block text-center text-xs font-light mt-4 ease-out duration-200"
                style={{ color: "#8A8A8A" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#1A1A1A"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#8A8A8A"; }}
              >
                Forgot your password?
              </a>

              {/* Divider */}
              <div className="relative my-7">
                <div
                  className="absolute inset-x-0 top-1/2 h-px"
                  style={{ background: "#E8E4DF" }}
                />
                <span
                  className="relative inline-block px-3 bg-white text-xs font-light"
                  style={{ left: "50%", transform: "translateX(-50%)", color: "#C8C4BF" }}
                >
                  or
                </span>
              </div>

              {/* Social buttons */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
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

                <button
                  type="button"
                  onClick={handleGithubSignIn}
                  className="flex justify-center items-center gap-3 py-3 text-xs font-light tracking-[0.1em] ease-out duration-200"
                  style={{ border: "1px solid #E8E4DF", color: "#4A4A4A", background: "#FAFAF9" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1A1A1A"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E8E4DF"; }}
                >
                  <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                    <path d="M11 1.833C5.938 1.833 1.833 6.041 1.833 11.232C1.833 15.385 4.46 18.908 8.102 20.15C8.56 20.238 8.728 19.947 8.728 19.698V17.948C6.165 18.517 5.627 16.84 5.627 16.84C5.21 15.753 4.61 15.464 4.61 15.464C3.778 14.881 4.672 14.893 4.672 14.893C5.593 14.959 6.077 15.862 6.077 15.862C6.895 17.298 8.222 16.883 8.745 16.643C8.827 16.035 9.065 15.621 9.327 15.386C7.291 15.148 5.151 14.342 5.151 10.741C5.151 9.715 5.509 8.877 6.095 8.218C5.999 7.982 5.686 7.026 6.184 5.731C6.184 5.731 6.954 5.479 8.705 6.695C9.436 6.486 10.221 6.382 11 6.378C11.779 6.382 12.564 6.486 13.296 6.695C15.046 5.479 15.815 5.731 15.815 5.731C16.313 7.026 15.999 7.982 15.904 8.218C16.492 8.877 16.848 9.715 16.848 10.741C16.848 14.351 14.703 15.146 12.662 15.379C12.991 15.67 13.284 16.242 13.284 17.119V19.698C13.284 19.948 13.438 20.242 13.903 20.149C17.543 18.905 20.166 15.383 20.166 11.232C20.166 6.041 16.062 1.833 11 1.833Z" fill="#15171A" />
                  </svg>
                  Continue with GitHub
                </button>
              </div>

              <p
                className="text-center text-xs font-light mt-7"
                style={{ color: "#8A8A8A" }}
              >
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-dark underline underline-offset-2 ease-out duration-200 hover:opacity-60"
                >
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
