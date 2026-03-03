"use client";
import React, { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/v1/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrorMsg("You are already subscribed.");
        } else {
          setErrorMsg(data?.error ?? "Something went wrong. Please try again.");
        }
        setStatus("error");
      } else {
        setStatus("success");
        setEmail("");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <section className="overflow-hidden py-16 sm:py-20" style={{ backgroundColor: "#0A0A0A" }}>
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div
          className="relative overflow-hidden"
          style={{
            border: "1px solid #1E1E1E",
            background: "linear-gradient(135deg, #111111 0%, #0D0D0D 50%, #141414 100%)",
          }}
        >
          {/* Decorative corner accent */}
          <div
            className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at top right, rgba(246,245,242,0.04) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-40 h-40 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at bottom left, rgba(246,245,242,0.03) 0%, transparent 70%)",
            }}
          />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 px-6 sm:px-10 xl:px-14 py-12 xl:py-16">
            {/* Left: copy */}
            <div className="max-w-[480px] w-full">
              <span
                className="block text-[10px] font-light tracking-[0.35em] uppercase mb-5"
                style={{ color: "#8A8A8A" }}
              >
                Stay in the loop
              </span>
              <h2
                className="font-playfair font-normal text-2xl sm:text-3xl xl:text-4xl mb-4 leading-snug"
                style={{ color: "#F6F5F2", letterSpacing: "-0.02em" }}
              >
                Curated Trends, <br className="hidden sm:block" />
                Delivered Weekly.
              </h2>
              <p
                className="text-sm font-light leading-relaxed max-w-[360px]"
                style={{ color: "#6A6A6A" }}
              >
                Get the latest affiliate deals, AI-recommended looks, and exclusive partner discounts — straight to your inbox.
              </p>
            </div>

            {/* Right: form */}
            <div className="max-w-[450px] w-full">
              {status === "success" ? (
                <div
                  className="flex items-center gap-3 px-6 py-4"
                  style={{ border: "1px solid #2A2A2A", background: "#111" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="#F6F5F2"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p
                    className="text-sm font-light"
                    style={{ color: "#F6F5F2", letterSpacing: "0.02em" }}
                  >
                    You&apos;re subscribed. Welcome to FITOVA.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="flex flex-col sm:flex-row gap-0">
                    <input
                      type="email"
                      id="newsletter-email"
                      name="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") {
                          setStatus("idle");
                          setErrorMsg("");
                        }
                      }}
                      placeholder="Your email address"
                      aria-label="Email address for newsletter"
                      className="w-full text-sm font-light outline-none px-5 py-3.5 bg-transparent flex-1"
                      style={{
                        border: "1px solid #2A2A2A",
                        borderRight: "none",
                        color: "#F6F5F2",
                        caretColor: "#F6F5F2",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#3A3A3A";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#2A2A2A";
                      }}
                      disabled={status === "loading"}
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="flex items-center justify-center gap-2 text-xs font-light tracking-[0.15em] uppercase px-7 py-3.5 ease-out duration-300 flex-shrink-0"
                      style={{
                        border: "1px solid #2A2A2A",
                        background: status === "loading" ? "#1A1A1A" : "#F6F5F2",
                        color: status === "loading" ? "#6A6A6A" : "#0A0A0A",
                      }}
                      onMouseEnter={(e) => {
                        if (status !== "loading") {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "#E8E4DF";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (status !== "loading") {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "#F6F5F2";
                        }
                      }}
                    >
                      {status === "loading" ? (
                        <span
                          className="inline-block w-4 h-4 rounded-full border-2 border-t-[#6A6A6A] border-[#2A2A2A] animate-spin"
                        />
                      ) : (
                        <>
                          Subscribe
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M5 12h14M12 5l7 7-7 7"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Error message */}
                  {errorMsg && (
                    <p
                      className="mt-3 text-xs font-light"
                      style={{ color: "#D97474" }}
                      role="alert"
                    >
                      {errorMsg}
                    </p>
                  )}

                  <p
                    className="mt-3 text-[10px] font-light"
                    style={{ color: "#4A4A4A" }}
                  >
                    No spam. Unsubscribe anytime.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
