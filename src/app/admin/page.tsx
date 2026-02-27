"use client";
import React from "react";
import Link from "next/link";
import StatsCard from "@/components/Admin/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminOverviewPage() {
    const { data: analytics, isLoading } = useQuery({
        queryKey: ["admin-analytics"],
        queryFn: adminService.getAnalytics,
    });

    const quickLinks = [
        { href: "/admin/products", label: "Add Product", desc: "Add a new affiliate product" },
        { href: "/admin/offers", label: "Add Coupon", desc: "Create a new offer or discount" },
        { href: "/admin/collections", label: "New Collection", desc: "Build a lookbook collection" },
        { href: "/admin/affiliate", label: "Affiliate Links", desc: "Manage commissions & links" },
    ];

    const counts = analytics?.counts || { products: 0, categories: 0, collections: 0, offers: 0, users: 0 };
    const charts = analytics?.charts || { signups: [], topProducts: [] };

    return (
        <div>
            {/* Page title */}
            <div className="mb-8">
                <span className="text-xs font-light tracking-[0.3em] uppercase text-[#8A8A8A]">Dashboard</span>
                <h2 className="font-playfair font-normal text-3xl text-[#0A0A0A] mt-1" style={{ letterSpacing: "-0.02em" }}>
                    Overview
                </h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-10">
                <StatsCard
                    title="Products"
                    value={isLoading ? "..." : counts.products}
                    description="Total catalog items"
                    color="#8B7355"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.5" /></svg>}
                />
                <StatsCard
                    title="Categories"
                    value={isLoading ? "..." : counts.categories}
                    description="Product categories"
                    color="#4A6FA5"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>}
                />
                <StatsCard
                    title="Collections"
                    value={isLoading ? "..." : counts.collections}
                    description="Lookbook collections"
                    color="#5C8A6A"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>}
                />
                <StatsCard
                    title="Offers"
                    value={isLoading ? "..." : counts.offers}
                    description="Active coupons"
                    color="#A55C4A"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" /><path d="M9 9h.01M15 15h.01M15 9L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                />
                <StatsCard
                    title="Users"
                    value={isLoading ? "..." : counts.users}
                    description="Registered accounts"
                    color="#6B5B8A"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Line Chart */}
                <div className="bg-white border border-[#E8E4DF] p-6">
                    <h3 className="text-sm font-medium text-[#0A0A0A] mb-6">Recent User Signups</h3>
                    <div className="h-[300px] w-full">
                        {isLoading ? (
                            <div className="h-full w-full flex items-center justify-center text-[#8A8A8A] text-sm">Loading chart data...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={charts.signups} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <Line type="monotone" dataKey="signups" stroke="#0A0A0A" strokeWidth={2} dot={{ fill: '#0A0A0A', r: 4 }} activeDot={{ r: 6, fill: '#8B7355' }} />
                                    <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fill: '#8A8A8A', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{ fill: '#8A8A8A', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E8E4DF', borderRadius: '4px', fontSize: '13px' }} cursor={{ stroke: '#f5f5f5', strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-white border border-[#E8E4DF] p-6">
                    <h3 className="text-sm font-medium text-[#0A0A0A] mb-6">Top Products Performance</h3>
                    <div className="h-[300px] w-full">
                        {isLoading ? (
                            <div className="h-full w-full flex items-center justify-center text-[#8A8A8A] text-sm">Loading chart data...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.topProducts} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#8A8A8A', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{ fill: '#8A8A8A', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E8E4DF', borderRadius: '4px', fontSize: '13px' }} cursor={{ fill: '#fafaF9' }} />
                                    <Bar dataKey="views" fill="#8B7355" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <p className="text-xs font-light tracking-[0.25em] uppercase text-[#8A8A8A] mb-4">Quick Actions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="bg-white border border-[#E8E4DF] rounded-sm p-5 hover:border-[#0A0A0A] ease-out duration-200 group"
                        >
                            <p className="font-medium text-sm text-[#0A0A0A] mb-1 group-hover:underline underline-offset-2">{link.label}</p>
                            <p className="text-xs font-light text-[#8A8A8A]">{link.desc}</p>
                            <svg className="mt-4 text-[#8A8A8A] group-hover:text-[#0A0A0A] ease-out duration-200" width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
