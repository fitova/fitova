"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    {
        href: "/admin",
        label: "Overview",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        href: "/admin/analytics",
        label: "Analytics",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 20V10M18 20V4M6 20v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        href: "/admin/products",
        label: "Products",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        href: "/admin/categories",
        label: "Categories",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="7" cy="7" r="1.5" fill="currentColor" />
            </svg>
        ),
    },
    {
        href: "/admin/collections",
        label: "Collections",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        href: "/admin/offers",
        label: "Offers",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        href: "/admin/coupons",
        label: "Coupons",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 12v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 010 4v2a2 2 0 002 2h14a2 2 0 002-2v-2a2 2 0 010-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        href: "/admin/homepage",
        label: "Homepage Control",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 9.5L12 4l9 5.5M19 13v7.4a.6.6 0 01-.6.6H5.6a.6.6 0 01-.6-.6V13 M14 21v-5a2 2 0 00-4 0v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        href: "/admin/style-hub",
        label: "Style Hub",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        href: "/admin/affiliate",
        label: "Affiliate Links",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        href: "/admin/users",
        label: "Users",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
];

const AdminSidebar = () => {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Auto-collapse on tablet breakpoints
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && window.innerWidth < 1024) {
                setCollapsed(true);
            } else if (window.innerWidth >= 1024) {
                setCollapsed(false);
            }
        };
        // Initial check
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Close mobile drawer when route changes
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Hamburger Toggle (Visible only < md) */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed bottom-6 right-6 z-50 bg-[#0A0A0A] text-white p-3 rounded-full shadow-xl"
                aria-label="Open Admin Menu"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>

            <aside
                className={`fixed md:relative z-50 flex flex-col bg-[#0A0A0A] transition-all duration-300 ease-in-out h-[100dvh] md:min-h-screen
                    ${mobileOpen ? "translate-x-0 w-60" : "-translate-x-full md:translate-x-0"}
                    ${collapsed ? "md:w-16" : "md:w-60"}
                `}
            >
                {/* Logo wrapper */}
                <div className={`flex items-center justify-between px-4 py-5 border-b border-white/10 ${collapsed ? "md:justify-center" : ""}`}>
                    {(!collapsed || mobileOpen) && (
                        <Link href="/admin" className="flex items-center gap-2">
                            <img src="/images/logo/logo.svg" alt="Fitova" className="h-10 w-auto brightness-0 invert" />
                            <span className="text-white/40 text-[10px] font-light tracking-[0.2em] uppercase mt-0.5">Admin</span>
                        </Link>
                    )}

                    {/* Desktop/Tablet Collapse Toggle */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-white/40 hover:text-white ease-out duration-200 hidden md:block"
                        aria-label="Toggle sidebar"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            {collapsed ? (
                                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            ) : (
                                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            )}
                        </svg>
                    </button>

                    {/* Mobile Close Toggle */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="text-white/40 hover:text-white ease-out duration-200 md:hidden ml-auto"
                        aria-label="Close sidebar"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 flex flex-col gap-0.5 hide-scrollbar">
                    {navItems.map((item) => {
                        const isActive =
                            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-light tracking-wide ease-out duration-200 group ${isActive
                                    ? "bg-white/10 text-white"
                                    : "text-white/50 hover:text-white hover:bg-white/5"
                                    } ${collapsed && !mobileOpen ? "justify-center px-0" : ""}`}
                                title={collapsed && !mobileOpen ? item.label : undefined}
                            >
                                <span className="flex-shrink-0">{item.icon}</span>
                                {(!collapsed || mobileOpen) && <span className="whitespace-nowrap">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Back to site */}
                <div className={`px-2 pb-4 pt-4 border-t border-white/10 flex-shrink-0 ${collapsed && !mobileOpen ? "flex justify-center" : ""}`}>
                    <Link
                        href="/"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/40 hover:text-white hover:bg-white/5 ease-out duration-200
                       ${collapsed && !mobileOpen ? "justify-center px-0" : ""}
                    `}
                        title={collapsed && !mobileOpen ? "Back to Site" : undefined}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {(!collapsed || mobileOpen) && <span className="whitespace-nowrap">Back to Site</span>}
                    </Link>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
