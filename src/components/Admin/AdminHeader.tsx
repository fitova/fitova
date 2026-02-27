"use client";
import React from "react";
import { useRouter } from "next/navigation";
// ⚠ DATABASE CONFIGURATION REQUIRED HERE
// يجب وضع بيانات قاعدة البيانات الجديدة هنا
type User = any; // Dummy type

const AdminHeader = ({ user }: { user: User }) => {
    const router = useRouter();
    // ⚠ DATABASE CONFIGURATION REQUIRED HERE
    // يجب وضع بيانات قاعدة البيانات الجديدة هنا
    const handleSignOut = async () => {
        // ⚠ DATABASE CONFIGURATION REQUIRED HERE
        // يجب وضع بيانات قاعدة البيانات الجديدة هنا
        router.push("/signin");
    };

    const email = user.email ?? "";

    return (
        <header className="flex items-center justify-between px-6 lg:px-8 py-4 bg-white border-b border-[#E8E4DF]">
            <div>
                <h1 className="font-playfair font-normal text-xl text-[#0A0A0A]" style={{ letterSpacing: "-0.02em" }}>
                    Admin Panel
                </h1>
                <p className="text-xs font-light text-[#8A8A8A] mt-0.5">Fitova Content Management</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-light text-[#4A4A4A]">{email}</span>
                    <span className="text-[10px] font-light tracking-widest text-[#8A8A8A] uppercase">Administrator</span>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-xs font-light text-[#4A4A4A] hover:text-[#0A0A0A] ease-out duration-200 border border-[#E8E4DF] px-3 py-2 rounded-sm hover:border-[#0A0A0A]"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Sign out
                </button>
            </div>
        </header>
    );
};

export default AdminHeader;
