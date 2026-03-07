import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserCoupon } from "@/lib/queries/coupons";
import { useCurrentUser } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

const couponSchema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters").max(20, "Code is too long"),
    title: z.string().optional(),
    store_name: z.string().min(2, "Store name is required"),
    affiliate_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    discount_type: z.enum(["percentage", "fixed"]),
    discount_value: z.number().positive("Must be greater than 0"),
    min_order_value: z.number().nonnegative().optional().or(z.literal("")),
    max_discount_value: z.number().nonnegative().optional().or(z.literal("")),
    usage_limit: z.number().nonnegative().optional().or(z.literal("")),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
});

type CouponFormValues = z.infer<typeof couponSchema>;

export default function CreateCouponForm({ onSuccess }: { onSuccess?: () => void }) {
    const { user } = useCurrentUser();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm<CouponFormValues>({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            discount_type: "percentage",
            start_date: new Date().toISOString().slice(0, 16),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        },
    });

    const discountType = watch("discount_type");

    const generateRandomCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "FIT-";
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setValue("code", code, { shouldValidate: true });
    };

    const createMutation = useMutation({
        mutationFn: async (data: CouponFormValues) => {
            if (!user) throw new Error("Not authenticated");

            const payload = {
                user_id: user.id,
                code: data.code.toUpperCase(),
                title: data.title || null,
                store_name: data.store_name,
                affiliate_link: data.affiliate_link || null,
                discount_type: data.discount_type,
                discount_value: data.discount_value,
                discount_percent: data.discount_type === "percentage" ? data.discount_value : 0, // Legacy fallback
                min_order_value: data.min_order_value === "" ? null : Number(data.min_order_value),
                max_discount_value: data.max_discount_value === "" ? null : Number(data.max_discount_value),
                usage_limit: data.usage_limit === "" ? null : Number(data.usage_limit),
                start_date: new Date(data.start_date).toISOString(),
                end_date: new Date(data.end_date).toISOString(),
                is_active: true,
                image_url: null, // Could add image upload later if needed
            };

            return await createUserCoupon(payload);
        },
        onSuccess: () => {
            toast.success("Coupon created successfully!");
            queryClient.invalidateQueries({ queryKey: ["user_coupons", user?.id] });
            reset();
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create coupon. Code might exist.");
        },
        onSettled: () => setIsSubmitting(false),
    });

    const onSubmit = (data: CouponFormValues) => {
        setIsSubmitting(true);
        createMutation.mutate(data);
    };

    if (!user) return <p className="text-sm text-[#8A8A8A]">Please log in to create coupons.</p>;

    return (
        <div className="bg-white p-6 md:p-8 border border-[#E8E4DF] rounded-sm">
            <h3 className="text-lg font-medium text-[#0A0A0A] mb-6">Create New Coupon</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Code */}
                    <div>
                        <label className="block text-xs font-medium tracking-wide uppercase text-[#8A8A8A] mb-2">
                            Coupon Code *
                        </label>
                        <div className="flex gap-2">
                            <input
                                {...register("code")}
                                placeholder="e.g. SUMMER20"
                                className={`w-full bg-[#FAFAF9] border ${errors.code ? "border-red-500" : "border-[#E8E4DF]"} p-3 text-sm text-[#0A0A0A] outline-none transition-colors focus:border-[#0A0A0A] uppercase`}
                            />
                            <button
                                type="button"
                                onClick={generateRandomCode}
                                className="px-4 bg-[#F0EDE8] hover:bg-[#E8E4DF] text-[#4A4A4A] text-xs font-medium uppercase tracking-wide transition-colors whitespace-nowrap"
                            >
                                Generate
                            </button>
                        </div>
                        {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
                    </div>

                    {/* Store Name */}
                    <div>
                        <label className="block text-xs font-medium tracking-wide uppercase text-[#8A8A8A] mb-2">
                            Store / Brand Name *
                        </label>
                        <input
                            {...register("store_name")}
                            placeholder="e.g. Nike, fitova..."
                            className={`w-full bg-[#FAFAF9] border ${errors.store_name ? "border-red-500" : "border-[#E8E4DF]"} p-3 text-sm text-[#0A0A0A] outline-none transition-colors focus:border-[#0A0A0A]`}
                        />
                        {errors.store_name && <p className="mt-1 text-xs text-red-500">{errors.store_name.message}</p>}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-medium tracking-wide uppercase text-[#8A8A8A] mb-2">
                            Internal Title (Optional)
                        </label>
                        <input
                            {...register("title")}
                            placeholder="e.g. Summer Sale Promo"
                            className="w-full bg-[#FAFAF9] border border-[#E8E4DF] p-3 text-sm text-[#0A0A0A] outline-none transition-colors focus:border-[#0A0A0A]"
                        />
                    </div>

                    {/* Affiliate Link */}
                    <div>
                        <label className="block text-xs font-medium tracking-wide uppercase text-[#8A8A8A] mb-2">
                            Store URL / Affiliate Link
                        </label>
                        <input
                            {...register("affiliate_link")}
                            placeholder="https://..."
                            className={`w-full bg-[#FAFAF9] border ${errors.affiliate_link ? "border-red-500" : "border-[#E8E4DF]"} p-3 text-sm text-[#0A0A0A] outline-none transition-colors focus:border-[#0A0A0A]`}
                        />
                        {errors.affiliate_link && <p className="mt-1 text-xs text-red-500">{errors.affiliate_link.message}</p>}
                    </div>

                    {/* Discount Type */}
                    <div>
                        <label className="block text-xs font-medium tracking-wide uppercase text-[#8A8A8A] mb-2">
                            Discount Type *
                        </label>
                        <select
                            {...register("discount_type")}
                            className="w-full bg-[#FAFAF9] border border-[#E8E4DF] p-3 text-sm text-[#0A0A0A] outline-none transition-colors focus:border-[#0A0A0A]"
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount ($)</option>
                        </select>
                    </div>

                    {/* Discount Value */}
                    <div>
                        <label className="block text-xs font-medium tracking-wide uppercase text-[#8A8A8A] mb-2">
                            Discount Value *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] text-sm">
                                {discountType === "percentage" ? "%" : "$"}
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                {...register("discount_value", { valueAsNumber: true })}
                                placeholder={discountType === "percentage" ? "20" : "15.00"}
                                className={`w-full bg-[#FAFAF9] border ${errors.discount_value ? "border-red-500" : "border-[#E8E4DF]"} p-3 pl-8 text-sm text-[#0A0A0A] outline-none transition-colors focus:border-[#0A0A0A]`}
                            />
                        </div>
                        {errors.discount_value && <p className="mt-1 text-xs text-red-500">{errors.discount_value.message}</p>}
                    </div>

                    {/* Min Order Value */}
                    <div>
                        <label className="block text-xs font-medium tracking-wide uppercase text-[#8A8A8A] mb-2">
                            Min Order Amount ($)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            {...register("min_order_value", {
                                setValueAs: (v) => v === "" ? "" : parseFloat(v)
                            })}
                            placeholder="e.g. 50.00"
                            className="w-full bg-[#FAFAF9] border border-[#E8E4DF] p-3 text-sm text-[#0A0A0A] outline-none transition-colors focus:border-[#0A0A0A]"
                        />
                        {errors.min_order_value && <p className="mt-1 text-xs text-red-500">{errors.min_order_value.message}</p>}
                    </div>

                    {/* Max Discount Value (Applicable mainly for percentage) */}
                    <div>
                        <label className="block text-xs font-medium tracking-wide uppercase text-[#8A8A8A] mb-2">
                            Max Discount Amount ($)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            {...register("max_discount_value", {
                                setValueAs: (v) => v === "" ? "" : parseFloat(v)
                            })}
                            placeholder="e.g. 20.00 (Max off)"
                            className="w-full bg-[#FAFAF9] border border-[#E8E4DF] p-3 text-sm text-[#0A0A0A] outline-none transition-colors focus:border-[#0A0A0A]"
                            disabled={discountType === "fixed"}
                        />
                        {errors.max_discount_value && <p className="mt-1 text-xs text-red-500">{errors.max_discount_value.message}</p>}
                    </div>

                    {/* Usage Limit */}
                    <div>
                        <label className="block text-xs font-medium tracking-wide uppercase text-[#8A8A8A] mb-2">
                            Total Usage Limit
                        </label>
                        <input
                            type="number"
                            {...register("usage_limit", {
                                setValueAs: (v) => v === "" ? "" : parseInt(v, 10)
                            })}
                            placeholder="e.g. 100"
                            className="w-full bg-[#FAFAF9] border border-[#E8E4DF] p-3 text-sm text-[#0A0A0A] outline-none transition-colors focus:border-[#0A0A0A]"
                        />
                        {errors.usage_limit && <p className="mt-1 text-xs text-red-500">{errors.usage_limit.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                        {/* Start Date */}
                        <div>
                            <label className="block text-xs font-medium tracking-wide uppercase text-[#8A8A8A] mb-2">
                                Start Date *
                            </label>
                            <input
                                type="datetime-local"
                                {...register("start_date")}
                                className={`w-full bg-[#FAFAF9] border ${errors.start_date ? "border-red-500" : "border-[#E8E4DF]"} p-3 text-sm text-[#0A0A0A] outline-none transition-colors focus:border-[#0A0A0A]`}
                            />
                            {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date.message}</p>}
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-xs font-medium tracking-wide uppercase text-[#8A8A8A] mb-2">
                                End Date *
                            </label>
                            <input
                                type="datetime-local"
                                {...register("end_date")}
                                className={`w-full bg-[#FAFAF9] border ${errors.end_date ? "border-red-500" : "border-[#E8E4DF]"} p-3 text-sm text-[#0A0A0A] outline-none transition-colors focus:border-[#0A0A0A]`}
                            />
                            {errors.end_date && <p className="mt-1 text-xs text-red-500">{errors.end_date.message}</p>}
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#0A0A0A] text-white py-4 text-xs font-medium tracking-[0.15em] uppercase hover:bg-[#2C2C2C] transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? "Creating..." : "Create Coupon"}
                </button>
            </form>
        </div>
    );
}
