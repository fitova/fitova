"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";

const labelClass =
  "block text-xs font-light tracking-[0.1em] uppercase mb-2";
const inputClass =
  "w-full py-3 px-4 text-sm font-light outline-none ease-out duration-200";
const inputStyle = {
  border: "1px solid #E8E4DF",
  background: "#FAFAF9",
  color: "#1A1A1A",
};

const Contact = () => {
  return (
    <>
      <Breadcrumb title={"Contact"} pages={["contact"]} />

      <section
        className="overflow-hidden py-16"
        style={{ background: "#F6F5F2" }}
      >
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7">
            {/* ── Contact Info ──────────────────────────────── */}
            <div
              className="xl:max-w-[340px] w-full p-8"
              style={{ background: "#FFFFFF", border: "1px solid #E8E4DF" }}
            >
              <h2
                className="font-playfair font-normal text-xl text-dark mb-6"
                style={{ letterSpacing: "-0.02em" }}
              >
                Contact Information
              </h2>

              <div className="flex flex-col gap-5">
                {[
                  {
                    label: "Email",
                    value: "hello@fitova.com",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ),
                  },
                  {
                    label: "Phone",
                    value: "+1 234 567 890",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18a2 2 0 012-2.18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 6.91a16 16 0 006.18 6.18l.79-.79a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    ),
                  },
                  {
                    label: "Address",
                    value: "7398 Smoke Ranch Road, Las Vegas, Nevada 89128",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    ),
                  },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: "#8A8A8A" }}
                    >
                      {icon}
                    </span>
                    <div>
                      <p
                        className="text-[10px] font-light tracking-[0.15em] uppercase mb-0.5"
                        style={{ color: "#C8C4BF" }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-sm font-light text-dark"
                        style={{ lineHeight: 1.6 }}
                      >
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Message Form ──────────────────────────────── */}
            <div
              className="flex-1 p-8 sm:p-10"
              style={{ background: "#FFFFFF", border: "1px solid #E8E4DF" }}
            >
              <h2
                className="font-playfair font-normal text-xl text-dark mb-8"
                style={{ letterSpacing: "-0.02em" }}
              >
                Send a Message
              </h2>

              <form>
                <div className="flex flex-col lg:flex-row gap-5 mb-5">
                  {[
                    { id: "firstName", label: "First Name", placeholder: "John" },
                    { id: "lastName", label: "Last Name", placeholder: "Doe" },
                  ].map(({ id, label, placeholder }) => (
                    <div key={id} className="w-full">
                      <label htmlFor={id} className={labelClass} style={{ color: "#4A4A4A" }}>
                        {label} <span style={{ color: "#C0392B" }}>*</span>
                      </label>
                      <input
                        type="text"
                        id={id}
                        name={id}
                        placeholder={placeholder}
                        className={inputClass}
                        style={inputStyle}
                        onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#1A1A1A"; }}
                        onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#E8E4DF"; }}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-5 mb-5">
                  {[
                    { id: "subject", label: "Subject", placeholder: "Your subject", type: "text" },
                    { id: "phone", label: "Phone", placeholder: "+1 234 567 890", type: "tel" },
                  ].map(({ id, label, placeholder, type }) => (
                    <div key={id} className="w-full">
                      <label htmlFor={id} className={labelClass} style={{ color: "#4A4A4A" }}>
                        {label}
                      </label>
                      <input
                        type={type}
                        id={id}
                        name={id}
                        placeholder={placeholder}
                        className={inputClass}
                        style={inputStyle}
                        onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#1A1A1A"; }}
                        onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#E8E4DF"; }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mb-8">
                  <label htmlFor="message" className={labelClass} style={{ color: "#4A4A4A" }}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="How can we help you?"
                    className={`${inputClass} resize-none`}
                    style={inputStyle}
                    onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#1A1A1A"; }}
                    onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#E8E4DF"; }}
                  />
                </div>

                <button
                  type="submit"
                  className="py-3 px-8 text-xs font-light tracking-[0.15em] uppercase ease-out duration-200"
                  style={{ background: "#0A0A0A", color: "#F6F5F2", border: "1px solid #0A0A0A" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#2C2C2C"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0A0A0A"; }}
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
