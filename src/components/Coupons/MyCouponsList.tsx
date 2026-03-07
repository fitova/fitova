import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserCoupons, deleteUserCoupon, toggleCouponStatus } from "@/lib/queries/coupons";
import { useCurrentUser } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

export default function MyCouponsList() {
    const { user } = useCurrentUser();
    const queryClient = useQueryClient();

    // If we wanted to add a "Create New" button here, we could add a prop or state to toggle the form.
    // The current UI in MyAccount has the form rendering above the list.

    const { data: coupons = [], isLoading } = useQuery({
        queryKey: ["user_coupons", user?.id],
        queryFn: () => getUserCoupons(user!.id),
        enabled: !!user,
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            toggleCouponStatus(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user_coupons", user?.id] });
            toast.success("Coupon status updated");
        },
        onError: () => toast.error("Failed to update status"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteUserCoupon(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user_coupons", user?.id] });
            toast.success("Coupon deleted");
        },
        onError: () => toast.error("Failed to delete coupon"),
    });

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Code copied to clipboard!");
    };

    if (!user) return null;
    if (isLoading) return <p className="text-sm text-[#8A8A8A] py-8 text-center animate-pulse">Loading your coupons...</p>;

    if (coupons.length === 0) {
        return (
            <div className="bg-white p-8 border border-[#E8E4DF] rounded-sm text-center mt-6">
                <p className="text-[#8A8A8A] text-sm">You haven't created any coupons yet.</p>
                <p className="text-xs text-[#8A8A8A] mt-2">Use the form above to generate your first coupon code.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {coupons.map((coupon) => (
                <div key={coupon.id} className="bg-white border border-[#E8E4DF] p-5 rounded-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between relative overflow-hidden">
                    {/* Subtle status indicator edge */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${coupon.is_active ? 'bg-green-500' : 'bg-red-400'}`} />

                    <div className="flex-1 min-w-0 pl-2">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <span className="font-mono text-lg font-bold text-[#0A0A0A] bg-[#FAFAF9] px-3 py-1 border border-[#E8E4DF] tracking-widest">
                                {coupon.code}
                            </span>
                            {!coupon.is_active && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 font-medium uppercase tracking-wide">
                                    Inactive
                                </span>
                            )}
                            {/* Store Name Badge */}
                            <span className="text-[10px] border border-[#0A0A0A] text-[#0A0A0A] px-2 py-0.5 uppercase tracking-wide">
                                {coupon.store_name}
                            </span>
                        </div>
                        {coupon.title && (
                            <p className="text-xs font-medium text-[#4A4A4A] mb-1">{coupon.title}</p>
                        )}
                        <div className="text-[11px] text-[#8A8A8A] space-y-0.5 mt-2">
                            <p>
                                <strong className="text-[#0A0A0A]">
                                    {coupon.discount_type === "percentage" ? `${coupon.discount_value}% OFF` : `$${coupon.discount_value} OFF`}
                                </strong>
                                {coupon.max_discount_value && ` (Up to $${coupon.max_discount_value} max)`}
                                {coupon.min_order_value && ` · Min order: $${coupon.min_order_value}`}
                            </p>
                            <p>
                                {coupon.usage_limit && `Usage: ${coupon.current_uses}/${coupon.usage_limit} · `}
                                Valid: {new Date(coupon.start_date).toLocaleDateString()} - {new Date(coupon.end_date).toLocaleDateString()}
                            </p>
                            {coupon.affiliate_link && (
                                <a href={coupon.affiliate_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline max-w-full truncate inline-block">
                                    Store Link →
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 pl-2">
                        <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="flex-1 md:flex-none py-2 px-4 text-[11px] font-medium tracking-widest uppercase border border-[#E8E4DF] text-[#4A4A4A] hover:bg-[#FAFAF9] hover:text-[#0A0A0A] transition-colors"
                            title="Copy code"
                        >
                            Copy
                        </button>
                        <button
                            onClick={() => toggleMutation.mutate({ id: coupon.id, isActive: !coupon.is_active })}
                            className="py-2 px-3 border border-transparent text-[#8A8A8A] hover:bg-gray-50 hover:text-[#0A0A0A] transition-colors rounded"
                            title={coupon.is_active ? "Deactivate" : "Activate"}
                        >
                            {coupon.is_active ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 2v20M2 12h20" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                if (window.confirm("Are you sure you want to delete this coupon?")) {
                                    deleteMutation.mutate(coupon.id);
                                }
                            }}
                            className="py-2 px-3 border border-transparent text-[#8A8A8A] hover:bg-red-50 hover:text-red-500 transition-colors rounded"
                            title="Delete"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
