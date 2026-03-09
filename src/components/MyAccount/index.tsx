"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import AddressModal from "./AddressModal";
import Orders from "../Orders";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import CreateCouponForm from "../Coupons/CreateCouponForm";
import MyCouponsList from "../Coupons/MyCouponsList";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [addressModal, setAddressModal] = useState(false);
  const { user, signOut } = useAuth();
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, lookbooks: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const wishlistItems = useSelector((state: RootState) => state.wishlistReducer.items.filter(i => i.item_type === "product"));
  const [userLookbooks, setUserLookbooks] = useState<any[]>([]);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [savedWorlds, setSavedWorlds] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  // Profile forms state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [genderPreference, setGenderPreference] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest";
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";

  const openAddressModal = () => setAddressModal(true);
  const closeAddressModal = () => setAddressModal(false);

  useEffect(() => {
    if (!user) return;
    // Always check email first (instant, no DB needed) - case-insensitive
    if (user.email?.toLowerCase() === 'fitova.style@gmail.com') {
      setIsAdmin(true);
    }
    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, country, phone, gender_preference, is_admin")
        .eq("id", user?.id)
        .single();

      if (!error && data) {
        if (data.full_name) {
          const parts = data.full_name.split(" ");
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
        }
        if (data.country) {
          setCountry(data.country);
        }
        if (data.phone) {
          setPhone(data.phone);
        }
        if (data.gender_preference) {
          setGenderPreference(data.gender_preference);
        }
        if (user.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
        }
        if (data.is_admin === true) {
          setIsAdmin(true);
        }
      }
    }
    loadProfile();
  }, [user, supabase]);

  useEffect(() => {
    if (!user) { setStatsLoading(false); return; }
    async function loadStats() {
      const [ordersRes, wishlistRes, lookbooksRes] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("wishlist").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("item_type", "product"),
        supabase.from("lookbooks").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);
      setStats({
        orders: ordersRes.count ?? 0,
        wishlist: wishlistRes.count ?? 0,
        lookbooks: lookbooksRes.count ?? 0,
      });
      setStatsLoading(false);
    }
    loadStats();
  }, [user, supabase]);

  // Load wishlist items and lookbooks when their tabs are activated
  useEffect(() => {
    if (!user) return;
    if (activeTab === "lookbooks-tab") {
      setSectionLoading(true);
      supabase
        .from("lookbooks")
        .select("id, title, slug, cover_image, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
        .then(({ data }) => { setUserLookbooks(data ?? []); setSectionLoading(false); });
    } else if (activeTab === "worlds-tab") {
      setSectionLoading(true);
      supabase
        .from("saved_style_worlds")
        .select("id, name, filters, image_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
        .then(({ data }) => { setSavedWorlds(data ?? []); setSectionLoading(false); });
    } else if (activeTab === "recent-tab") {
      setSectionLoading(true);
      supabase
        .from("product_views")
        .select("product_id, viewed_at, products(id, name, slug, price, discounted_price, imgs)")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(12)
        .then(({ data }) => { setRecentlyViewed(data ?? []); setSectionLoading(false); });
    }
  }, [activeTab, user, supabase]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileLoading(true);

    const fullName = `${firstName} ${lastName}`.trim();

    // Update profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: fullName, country, phone, gender_preference: genderPreference })
      .eq("id", user.id);

    // Update user auth metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    setProfileLoading(false);

    if (profileError || authError) {
      toast.error("Failed to update profile.");
    } else {
      toast.success("Profile updated successfully!");
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setPasswordLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <>
      <Breadcrumb title={"My Account"} pages={["my account"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* <!--== user dashboard menu start ==--> */}
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="flex xl:flex-col">
                <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-r xl:border-r-0 xl:border-b border-gray-3">
                  <div className="max-w-[64px] w-full h-16 rounded-full overflow-hidden bg-gray-1 border border-gray-3 flex items-center justify-center">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="user"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-xl font-medium text-dark uppercase">
                        {displayName.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-dark mb-0.5">
                      {displayName}
                    </p>
                    <p className="text-custom-xs">{memberSince ? `Member Since ${memberSince}` : ""}</p>
                  </div>
                </div>

                <div className="p-4 sm:p-7.5 xl:p-9">
                  <div className="flex overflow-x-auto no-scrollbar xl:flex-col gap-4 pb-2 xl:pb-0">
                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className={`flex-shrink-0 whitespace-nowrap flex items-center gap-3 py-3 px-5 ease-out duration-300 uppercase tracking-[0.15em] text-[10px] sm:text-xs ${activeTab === "dashboard"
                        ? "text-white bg-[#0A0A0A]"
                        : "text-[#8A8A8A] hover:text-[#0A0A0A] bg-transparent hover:bg-[#F6F5F2]"
                        }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.91002 1.60413C5.08642 1.6041 4.39962 1.60408 3.85441 1.67738C3.27893 1.75475 2.75937 1.92495 2.34185 2.34246C1.92434 2.75998 1.75414 3.27954 1.67677 3.85502C1.60347 4.40023 1.60349 5.08701 1.60352 5.9106V6.00596C1.60349 6.82956 1.60347 7.51636 1.67677 8.06157C1.75414 8.63705 1.92434 9.15661 2.34185 9.57413C2.75937 9.99164 3.27893 10.1618 3.85441 10.2392C4.39962 10.3125 5.0864 10.3125 5.90999 10.3125H6.00535C6.82894 10.3125 7.51575 10.3125 8.06096 10.2392C8.63644 10.1618 9.156 9.99164 9.57352 9.57413C9.99103 9.15661 10.1612 8.63705 10.2386 8.06157C10.3119 7.51636 10.3119 6.82958 10.3119 6.00599V5.91063C10.3119 5.08704 10.3119 4.40023 10.2386 3.85502C10.1612 3.27954 9.99103 2.75998 9.57352 2.34246C9.156 1.92495 8.63644 1.75475 8.06096 1.67738C7.51575 1.60408 6.82897 1.6041 6.00538 1.60413H5.91002ZM3.31413 3.31474C3.43358 3.19528 3.61462 3.09699 4.03763 3.04012C4.48041 2.98059 5.07401 2.97913 5.95768 2.97913C6.84136 2.97913 7.43496 2.98059 7.87774 3.04012C8.30075 3.09699 8.48179 3.19528 8.60124 3.31474C8.7207 3.43419 8.81899 3.61523 8.87586 4.03824C8.93539 4.48102 8.93685 5.07462 8.93685 5.9583C8.93685 6.84197 8.93539 7.43557 8.87586 7.87835C8.81899 8.30136 8.7207 8.4824 8.60124 8.60186C8.48179 8.72131 8.30075 8.8196 7.87774 8.87647C7.43496 8.936 6.84136 8.93746 5.95768 8.93746C5.07401 8.93746 4.48041 8.936 4.03763 8.87647C3.61462 8.8196 3.43358 8.72131 3.31413 8.60186C3.19467 8.4824 3.09638 8.30136 3.03951 7.87835C2.97998 7.43557 2.97852 6.84197 2.97852 5.9583C2.97852 5.07462 2.97998 4.48102 3.03951 4.03824C3.09638 3.61523 3.19467 3.43419 3.31413 3.31474Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M15.9934 11.6875C15.1697 11.6874 14.483 11.6874 13.9377 11.7607C13.3623 11.8381 12.8427 12.0083 12.4252 12.4258C12.0077 12.8433 11.8375 13.3629 11.7601 13.9384C11.6868 14.4836 11.6868 15.1704 11.6869 15.994V16.0893C11.6868 16.9129 11.6868 17.5997 11.7601 18.1449C11.8375 18.7204 12.0077 19.2399 12.4252 19.6575C12.8427 20.075 13.3623 20.2452 13.9377 20.3225C14.4829 20.3958 15.1697 20.3958 15.9933 20.3958H16.0887C16.9123 20.3958 17.5991 20.3958 18.1443 20.3225C18.7198 20.2452 19.2393 20.075 19.6569 19.6575C20.0744 19.2399 20.2446 18.7204 20.3219 18.1449C20.3952 17.5997 20.3952 16.913 20.3952 16.0894V15.994C20.3952 15.1704 20.3952 14.4836 20.3219 13.9384C20.2446 13.3629 20.0744 12.8433 19.6569 12.4258C19.2393 12.0083 18.7198 11.8381 18.1443 11.7607C17.5991 11.6874 16.9123 11.6874 16.0887 11.6875H15.9934ZM13.3975 13.3981C13.5169 13.2786 13.698 13.1803 14.121 13.1235C14.5637 13.0639 15.1573 13.0625 16.041 13.0625C16.9247 13.0625 17.5183 13.0639 17.9611 13.1235C18.3841 13.1803 18.5651 13.2786 18.6846 13.3981C18.804 13.5175 18.9023 13.6986 18.9592 14.1216C19.0187 14.5644 19.0202 15.158 19.0202 16.0416C19.0202 16.9253 19.0187 17.5189 18.9592 17.9617C18.9023 18.3847 18.804 18.5657 18.6846 18.6852C18.5651 18.8046 18.3841 18.9029 17.9611 18.9598C17.5183 19.0193 16.9247 19.0208 16.041 19.0208C15.1573 19.0208 14.5637 19.0193 14.121 18.9598C13.698 18.9029 13.5169 18.8046 13.3975 18.6852C13.278 18.5657 13.1797 18.3847 13.1228 17.9617C13.0633 17.5189 13.0619 16.9253 13.0619 16.0416C13.0619 15.158 13.0633 14.5644 13.1228 14.1216C13.1797 13.6986 13.278 13.5175 13.3975 13.3981Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.91002 11.6875H6.00535C6.82896 11.6874 7.51574 11.6874 8.06096 11.7607C8.63644 11.8381 9.156 12.0083 9.57352 12.4258C9.99103 12.8433 10.1612 13.3629 10.2386 13.9384C10.3119 14.4836 10.3119 15.1703 10.3119 15.9939V16.0893C10.3119 16.9129 10.3119 17.5997 10.2386 18.1449C10.1612 18.7204 9.99103 19.2399 9.57352 19.6575C9.156 20.075 8.63644 20.2452 8.06096 20.3225C7.51575 20.3958 6.82899 20.3958 6.0054 20.3958H5.91002C5.08644 20.3958 4.39962 20.3958 3.85441 20.3225C3.27893 20.2452 2.75937 20.075 2.34185 19.6575C1.92434 19.2399 1.75414 18.7204 1.67677 18.1449C1.60347 17.5997 1.60349 16.9129 1.60352 16.0893V15.994C1.60349 15.1704 1.60347 14.4836 1.67677 13.9384C1.75414 13.3629 1.92434 12.8433 2.34185 12.4258C2.75937 12.0083 3.27893 11.8381 3.85441 11.7607C4.39963 11.6874 5.08641 11.6874 5.91002 11.6875ZM4.03763 13.1235C3.61462 13.1803 3.43358 13.2786 3.31413 13.3981C3.19467 13.5175 3.09638 13.6986 3.03951 14.1216C2.97998 14.5644 2.97852 15.158 2.97852 16.0416C2.97852 16.9253 2.97998 17.5189 3.03951 17.9617C3.09638 18.3847 3.19467 18.5657 3.31413 18.6852C3.43358 18.8046 3.61462 18.9029 4.03763 18.9598C4.48041 19.0193 5.07401 19.0208 5.95768 19.0208C6.84136 19.0208 7.43496 19.0193 7.87774 18.9598C8.30075 18.9029 8.48179 18.8046 8.60124 18.6852C8.7207 18.5657 8.81899 18.3847 8.87586 17.9617C8.93539 17.5189 8.93685 16.9253 8.93685 16.0416C8.93685 15.158 8.93539 14.5644 8.87586 14.1216C8.81899 13.6986 8.7207 13.5175 8.60124 13.3981C8.48179 13.2786 8.30075 13.1803 7.87774 13.1235C7.43496 13.0639 6.84136 13.0625 5.95768 13.0625C5.07401 13.0625 4.48041 13.0639 4.03763 13.1235Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M15.9934 1.60413C15.1698 1.6041 14.483 1.60408 13.9377 1.67738C13.3623 1.75475 12.8427 1.92495 12.4252 2.34246C12.0077 2.75998 11.8375 3.27954 11.7601 3.85502C11.6868 4.40024 11.6868 5.08702 11.6869 5.91063V6.00596C11.6868 6.82957 11.6868 7.51635 11.7601 8.06157C11.8375 8.63705 12.0077 9.15661 12.4252 9.57413C12.8427 9.99164 13.3623 10.1618 13.9377 10.2392C14.483 10.3125 15.1697 10.3125 15.9933 10.3125H16.0887C16.9123 10.3125 17.5991 10.3125 18.1443 10.2392C18.7198 10.1618 19.2393 9.99164 19.6569 9.57413C20.0744 9.15661 20.2446 8.63705 20.3219 8.06157C20.3952 7.51636 20.3952 6.82958 20.3952 6.00599V5.91063C20.3952 5.08704 20.3952 4.40023 20.3219 3.85502C20.2446 3.27954 20.0744 2.75998 19.6569 2.34246C19.2393 1.92495 18.7198 1.75475 18.1443 1.67738C17.5991 1.60408 16.9123 1.6041 16.0887 1.60413H15.9934ZM13.3975 3.31474C13.5169 3.19528 13.698 3.09699 14.121 3.04012C14.5637 2.98059 15.1573 2.97913 16.041 2.97913C16.9247 2.97913 17.5183 2.98059 17.9611 3.04012C18.3841 3.09699 18.5651 3.19528 18.6846 3.31474C18.804 3.43419 18.9023 3.61523 18.9592 4.03824C19.0187 4.48102 19.0202 5.07462 19.0202 5.9583C19.0202 6.84197 19.0187 7.43557 18.9592 7.87835C18.9023 8.30136 18.804 8.4824 18.6846 8.60186C18.5651 8.72131 18.3841 8.8196 17.9611 8.87647C17.5183 8.936 16.9247 8.93746 16.041 8.93746C15.1573 8.93746 14.5637 8.936 14.121 8.87647C13.698 8.8196 13.5169 8.72131 13.3975 8.60186C13.278 8.4824 13.1797 8.30136 13.1228 7.87835C13.0633 7.43557 13.0619 6.84197 13.0619 5.9583C13.0619 5.07462 13.0633 4.48102 13.1228 4.03824C13.1797 3.61523 13.278 3.43419 13.3975 3.31474Z"
                          fill=""
                        />
                      </svg>
                      Dashboard
                    </button>
                    <button
                      onClick={() => setActiveTab("recent-tab")}
                      className={`flex-shrink-0 whitespace-nowrap flex items-center gap-3 py-3 px-5 ease-out duration-300 uppercase tracking-[0.15em] text-[10px] sm:text-xs ${activeTab === "recent-tab"
                        ? "text-white bg-[#0A0A0A]"
                        : "text-[#8A8A8A] hover:text-[#0A0A0A] bg-transparent hover:bg-[#F6F5F2]"
                        }`}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Recently Viewed
                    </button>




                    <button
                      onClick={() => setActiveTab("downloads")}
                      className={`flex-shrink-0 whitespace-nowrap flex items-center gap-3 py-3 px-5 ease-out duration-300 uppercase tracking-[0.15em] text-[10px] sm:text-xs ${activeTab === "downloads"
                        ? "text-white bg-[#0A0A0A]"
                        : "text-[#8A8A8A] hover:text-[#0A0A0A] bg-transparent hover:bg-[#F6F5F2]"
                        }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.5074 15.1306C11.3772 15.273 11.193 15.3542 11 15.3542C10.807 15.3542 10.6229 15.273 10.4926 15.1306L6.82594 11.1202C6.56973 10.8399 6.5892 10.4051 6.86943 10.1489C7.14966 9.89265 7.58452 9.91212 7.84073 10.1923L10.3125 12.8958V2.75C10.3125 2.3703 10.6203 2.0625 11 2.0625C11.3797 2.0625 11.6875 2.3703 11.6875 2.75V12.8958L14.1593 10.1923C14.4155 9.91212 14.8503 9.89265 15.1306 10.1489C15.4108 10.4051 15.4303 10.8399 15.1741 11.1202L11.5074 15.1306Z"
                          fill=""
                        />
                        <path
                          d="M3.4375 13.75C3.4375 13.3703 3.1297 13.0625 2.75 13.0625C2.37031 13.0625 2.0625 13.3703 2.0625 13.75V13.8003C2.06248 15.0539 2.06247 16.0644 2.16931 16.8591C2.28025 17.6842 2.51756 18.3789 3.06932 18.9307C3.62108 19.4824 4.3158 19.7198 5.1409 19.8307C5.93562 19.9375 6.94608 19.9375 8.1997 19.9375H13.8003C15.0539 19.9375 16.0644 19.9375 16.8591 19.8307C17.6842 19.7198 18.3789 19.4824 18.9307 18.9307C19.4824 18.3789 19.7198 17.6842 19.8307 16.8591C19.9375 16.0644 19.9375 15.0539 19.9375 13.8003V13.75C19.9375 13.3703 19.6297 13.0625 19.25 13.0625C18.8703 13.0625 18.5625 13.3703 18.5625 13.75C18.5625 15.0658 18.561 15.9835 18.468 16.6759C18.3775 17.3485 18.2121 17.7047 17.9584 17.9584C17.7047 18.2121 17.3485 18.3775 16.6759 18.4679C15.9835 18.561 15.0658 18.5625 13.75 18.5625H8.25C6.9342 18.5625 6.01652 18.561 5.32411 18.4679C4.65148 18.3775 4.29529 18.2121 4.04159 17.9584C3.78789 17.7047 3.62249 17.3485 3.53205 16.6759C3.43896 15.9835 3.4375 15.0658 3.4375 13.75Z"
                          fill=""
                        />
                      </svg>
                      Downloads
                    </button>

                    <button
                      onClick={() => setActiveTab("account-details")}
                      className={`flex-shrink-0 whitespace-nowrap flex items-center gap-3 py-3 px-5 ease-out duration-300 uppercase tracking-[0.15em] text-[10px] sm:text-xs ${activeTab === "account-details"
                        ? "text-white bg-[#0A0A0A]"
                        : "text-[#8A8A8A] hover:text-[#0A0A0A] bg-transparent hover:bg-[#F6F5F2]"
                        }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.9995 1.14581C8.59473 1.14581 6.64531 3.09524 6.64531 5.49998C6.64531 7.90472 8.59473 9.85415 10.9995 9.85415C13.4042 9.85415 15.3536 7.90472 15.3536 5.49998C15.3536 3.09524 13.4042 1.14581 10.9995 1.14581ZM8.02031 5.49998C8.02031 3.85463 9.35412 2.52081 10.9995 2.52081C12.6448 2.52081 13.9786 3.85463 13.9786 5.49998C13.9786 7.14533 12.6448 8.47915 10.9995 8.47915C9.35412 8.47915 8.02031 7.14533 8.02031 5.49998Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.9995 11.2291C8.87872 11.2291 6.92482 11.7112 5.47697 12.5256C4.05066 13.3279 2.97864 14.5439 2.97864 16.0416L2.97858 16.1351C2.97754 17.2001 2.97624 18.5368 4.14868 19.4916C4.7257 19.9614 5.53291 20.2956 6.6235 20.5163C7.71713 20.7377 9.14251 20.8541 10.9995 20.8541C12.8564 20.8541 14.2818 20.7377 15.3754 20.5163C16.466 20.2956 17.2732 19.9614 17.8503 19.4916C19.0227 18.5368 19.0214 17.2001 19.0204 16.1351L19.0203 16.0416C19.0203 14.5439 17.9483 13.3279 16.522 12.5256C15.0741 11.7112 13.1202 11.2291 10.9995 11.2291ZM4.35364 16.0416C4.35364 15.2612 4.92324 14.4147 6.15108 13.724C7.35737 13.0455 9.07014 12.6041 10.9995 12.6041C12.9288 12.6041 14.6416 13.0455 15.8479 13.724C17.0757 14.4147 17.6453 15.2612 17.6453 16.0416C17.6453 17.2405 17.6084 17.9153 16.982 18.4254C16.6424 18.702 16.0746 18.9719 15.1027 19.1686C14.1338 19.3648 12.8092 19.4791 10.9995 19.4791C9.18977 19.4791 7.86515 19.3648 6.89628 19.1686C5.92437 18.9719 5.35658 18.702 5.01693 18.4254C4.39059 17.9153 4.35364 17.2405 4.35364 16.0416Z"
                          fill=""
                        />
                      </svg>
                      Account Details
                    </button>

                    {/* Wishlist Tab */}
                    <button
                      onClick={() => setActiveTab("wishlist-tab")}
                      className={`flex-shrink-0 whitespace-nowrap flex items-center gap-3 py-3 px-5 ease-out duration-300 uppercase tracking-[0.15em] text-[10px] sm:text-xs ${activeTab === "wishlist-tab"
                        ? "text-white bg-[#0A0A0A]"
                        : "text-[#8A8A8A] hover:text-[#0A0A0A] bg-transparent hover:bg-[#F6F5F2]"
                        }`}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                      Wishlist
                    </button>

                    {/* My Lookbooks Tab */}
                    <button
                      onClick={() => setActiveTab("lookbooks-tab")}
                      className={`flex-shrink-0 whitespace-nowrap flex items-center gap-3 py-3 px-5 ease-out duration-300 uppercase tracking-[0.15em] text-[10px] sm:text-xs ${activeTab === "lookbooks-tab"
                        ? "text-white bg-[#0A0A0A]"
                        : "text-[#8A8A8A] hover:text-[#0A0A0A] bg-transparent hover:bg-[#F6F5F2]"
                        }`}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      My Lookbooks
                    </button>

                    {/* Saved Worlds Tab */}
                    <button
                      onClick={() => setActiveTab("worlds-tab")}
                      className={`flex-shrink-0 whitespace-nowrap flex items-center gap-3 py-3 px-5 ease-out duration-300 uppercase tracking-[0.15em] text-[10px] sm:text-xs ${activeTab === "worlds-tab"
                        ? "text-white bg-[#0A0A0A]"
                        : "text-[#8A8A8A] hover:text-[#0A0A0A] bg-transparent hover:bg-[#F6F5F2]"
                        }`}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M3.6 9h16.8M3.6 15h16.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M12 3c-2.5 2.5-3 5.5-3 9s.5 6.5 3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M12 3c2.5 2.5 3 5.5 3 9s-.5 6.5-3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Saved Worlds
                    </button>

                    {/* My Coupons Tab */}
                    <button
                      onClick={() => setActiveTab("coupons-tab")}
                      className={`flex-shrink-0 whitespace-nowrap flex items-center gap-3 py-3 px-5 ease-out duration-300 uppercase tracking-[0.15em] text-[10px] sm:text-xs ${activeTab === "coupons-tab"
                        ? "text-white bg-[#0A0A0A]"
                        : "text-[#8A8A8A] hover:text-[#0A0A0A] bg-transparent hover:bg-[#F6F5F2]"
                        }`}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="8" width="18" height="12" rx="2" strokeLinecap="round" />
                        <path d="M7 8V6a4 4 0 1 1 8 0v2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      My Coupons
                    </button>



                    {/* Admin Dashboard — only for is_admin users — shown BEFORE logout */}
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-3 my-1" />
                        <a
                          href="/admin"
                          className="flex-shrink-0 whitespace-nowrap flex items-center gap-3 py-3 px-5 ease-out duration-300 uppercase tracking-[0.15em] text-[10px] sm:text-xs text-white"
                          style={{ background: "#0A0A0A" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                          </svg>
                          Admin Dashboard
                        </a>
                      </>
                    )}

                    <button
                      onClick={signOut}
                      className="flex-shrink-0 whitespace-nowrap flex items-center gap-3 py-3 px-5 ease-out duration-300 uppercase tracking-[0.15em] text-[10px] sm:text-xs text-red-500 hover:text-white hover:bg-red-600 bg-transparent transition-colors"
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.7005 1.14581C12.4469 1.14579 11.4365 1.14578 10.6417 1.25263C9.81664 1.36356 9.12193 1.60088 8.57017 2.15263C8.08898 2.63382 7.84585 3.22514 7.71822 3.91997C7.59419 4.59515 7.57047 5.42142 7.56495 6.41282C7.56284 6.79251 7.86892 7.10202 8.24861 7.10414C8.6283 7.10625 8.93782 6.80016 8.93993 6.42047C8.94551 5.4181 8.97154 4.70761 9.07059 4.16838C9.16603 3.64881 9.31927 3.34807 9.54244 3.12491C9.79614 2.87121 10.1523 2.7058 10.825 2.61537C11.5174 2.52227 12.435 2.52081 13.7508 2.52081H14.6675C15.9833 2.52081 16.901 2.52227 17.5934 2.61537C18.266 2.7058 18.6222 2.87121 18.8759 3.12491C19.1296 3.37861 19.295 3.7348 19.3855 4.40742C19.4786 5.09983 19.48 6.01752 19.48 7.33331V14.6666C19.48 15.9824 19.4786 16.9001 19.3855 17.5925C19.295 18.2652 19.1296 18.6214 18.8759 18.8751C18.6222 19.1288 18.266 19.2942 17.5934 19.3846C16.901 19.4777 15.9833 19.4791 14.6675 19.4791H13.7508C12.435 19.4791 11.5174 19.4777 10.825 19.3846C10.1523 19.2942 9.79614 19.1288 9.54244 18.8751C9.31927 18.6519 9.16603 18.3512 9.07059 17.8316C8.97154 17.2924 8.94551 16.5819 8.93993 15.5795C8.93782 15.1998 8.6283 14.8937 8.24861 14.8958C7.86892 14.8979 7.56284 15.2075 7.56495 15.5871C7.57047 16.5785 7.59419 17.4048 7.71822 18.08C7.84585 18.7748 8.08898 19.3661 8.57017 19.8473C9.12193 20.3991 9.81664 20.6364 10.6417 20.7473C11.4365 20.8542 12.4469 20.8542 13.7006 20.8541H14.7178C15.9714 20.8542 16.9819 20.8542 17.7766 20.7473C18.6017 20.6364 19.2964 20.3991 19.8482 19.8473C20.4 19.2956 20.6373 18.6009 20.7482 17.7758C20.855 16.981 20.855 15.9706 20.855 14.7169V7.28302C20.855 6.02939 20.855 5.01893 20.7482 4.22421C20.6373 3.39911 20.4 2.70439 19.8482 2.15263C19.2964 1.60088 18.6017 1.36356 17.7766 1.25263C16.9819 1.14578 15.9714 1.14579 14.7178 1.14581H13.7005Z"
                          fill=""
                        />
                        <path
                          d="M13.7507 10.3125C14.1303 10.3125 14.4382 10.6203 14.4382 11C14.4382 11.3797 14.1303 11.6875 13.7507 11.6875H3.69247L5.48974 13.228C5.77802 13.4751 5.81141 13.9091 5.56431 14.1974C5.3172 14.4857 4.88318 14.5191 4.5949 14.272L1.38657 11.522C1.23418 11.3914 1.14648 11.2007 1.14648 11C1.14648 10.7993 1.23418 10.6086 1.38657 10.478L4.5949 7.72799C4.88318 7.48089 5.3172 7.51428 5.56431 7.80256C5.81141 8.09085 5.77802 8.52487 5.48974 8.77197L3.69247 10.3125H13.7507Z"
                          fill=""
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* <!--== user dashboard menu end ==-->

            
          <!--== user dashboard content start ==--> */}
            {/* <!-- dashboard tab content start --> */}

            <div
              className={`xl:max-w-[770px] w-full ${activeTab === "dashboard" ? "block" : "hidden"}`}
            >
              {/* Welcome card */}
              <div className="bg-white rounded-xl shadow-1 px-7 py-7 mb-5">
                <p className="font-medium text-dark text-lg">
                  Welcome back, {displayName}{" "}
                  <span className="text-custom-sm font-normal text-[#8A8A8A]">
                    (<button onClick={signOut} className="text-red-500 hover:text-red-600 transition-colors uppercase tracking-[0.1em] text-[10px]">Log Out</button>)
                  </span>
                </p>
                {memberSince && (
                  <p className="text-custom-xs text-dark-5 mt-1">Member since {memberSince}</p>
                )}
                <p className="text-custom-sm mt-3 text-dark-4">
                  From your account dashboard you can view your recent orders,
                  manage your shipping and billing addresses, and edit your password and account details.
                </p>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                {([
                  {
                    label: "Recently Viewed", value: recentlyViewed.length, tab: "recent-tab", icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )
                  },
                  {
                    label: "Wishlist", value: stats.wishlist, tab: "dashboard", icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M12 21C12 21 3 14 3 8a5 5 0 0110 0 5 5 0 0110 0c0 6-9 13-9 13z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    )
                  },
                  {
                    label: "Lookbooks", value: stats.lookbooks, tab: "dashboard", icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )
                  },
                ] as const).map(({ label, value, tab, icon }) => (
                  <button
                    key={label}
                    onClick={() => setActiveTab(tab as any)}
                    className="bg-white rounded-xl shadow-1 p-5 flex flex-col items-start gap-2 ease-out duration-200 hover:shadow-md text-left"
                  >
                    <span className="text-dark-4">{icon}</span>
                    <span className="text-2xl font-semibold text-dark">
                      {statsLoading ? "—" : value}
                    </span>
                    <span className="text-custom-xs text-dark-5 uppercase tracking-wide">{label}</span>
                  </button>
                ))}
              </div>

              {/* Quick links */}
              <div className="bg-white rounded-xl shadow-1 px-7 py-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8A8A8A] mb-4">Quick Actions</p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setActiveTab("recent-tab")} className="text-xs font-light tracking-[0.1em] uppercase border border-[#E8E4DF] px-4 py-2 text-dark hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all duration-300">Recently Viewed</button>
                  <button onClick={() => setActiveTab("account-details")} className="text-xs font-light tracking-[0.1em] uppercase border border-[#E8E4DF] px-4 py-2 text-dark hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all duration-300">Edit Profile</button>
                  <a href="/wishlist" className="text-xs font-light tracking-[0.1em] uppercase border border-[#E8E4DF] px-4 py-2 text-dark hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all duration-300">My Wishlist</a>
                  <a href="/lookbook/create" className="text-xs font-light tracking-[0.1em] uppercase border border-dark bg-dark px-4 py-2 text-white hover:bg-black transition-all duration-300">+ New Lookbook</a>
                </div>
              </div>
            </div>
            {/* <!-- dashboard tab content end -->

 */}

            {/* <!-- wishlist tab --> */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${activeTab === "wishlist-tab" ? "block" : "hidden"}`}
            >
              <h3 className="font-playfair text-xl text-dark mb-6">My Wishlist</h3>
              {wishlistItems.length === 0 ? (
                <div className="text-center py-10">
                  <p className="font-playfair text-xl text-dark mb-4">Your wishlist is empty</p>
                  <a href="/shop-with-sidebar" className="text-xs font-light tracking-[0.2em] uppercase border border-dark text-dark px-8 py-3 hover:bg-dark hover:text-white transition-colors duration-300 inline-block">Browse Products</a>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistItems.map((item: any) => {
                    const pTitle = item.title;
                    const pSlug = item.itemSlug ?? item.item_id;
                    const price = item.discountedPrice ?? item.price;
                    const thumb = item.imageUrl;
                    return (
                      <a key={item.item_id} href={`/products/${pSlug}`} className="flex items-center gap-4 p-3 border border-[#E8E4DF] rounded-lg hover:border-[#0A0A0A] ease-out duration-300">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt={pTitle} className="w-16 h-16 object-cover rounded-md border border-[#E8E4DF]" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-16 h-16 bg-[#F6F5F2] flex items-center justify-center"><span className="text-[#8A8A8A] text-[10px] uppercase">No img</span></div>
                        )}
                        <div>
                          <p className="text-sm font-light text-dark line-clamp-1">{pTitle}</p>
                          <p className="text-sm text-[#8A8A8A]">{price != null ? `$${price.toFixed(2)}` : ''}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
              <div className="mt-6 text-center">
                <a href="/wishlist" className="text-[10px] uppercase tracking-[0.2em] text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors">View Full Wishlist →</a>
              </div>
            </div>

            {/* <!-- lookbooks tab --> */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${activeTab === "lookbooks-tab" ? "block" : "hidden"}`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-xl text-dark">My Lookbooks</h3>
                <a href="/lookbook/create" className="text-xs text-dark border border-gray-3 px-4 py-2 rounded-md hover:border-dark ease-out duration-200">+ Create New</a>
              </div>
              {sectionLoading ? (
                <div className="flex justify-center py-10"><div className="h-8 w-8 rounded-full border-4 border-t-dark border-gray-200 animate-spin" /></div>
              ) : userLookbooks.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-dark-4 font-light mb-4">You haven’t created any lookbooks yet</p>
                  <a href="/lookbook/create" className="text-sm text-dark border border-gray-3 px-5 py-2 rounded-md hover:border-dark ease-out duration-200 inline-block">Create Your First Lookbook</a>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userLookbooks.map((lb: any) => (
                    <a key={lb.id} href={`/lookbook/${lb.slug}`} className="flex items-center gap-4 p-3 border border-gray-3 rounded-lg hover:border-dark ease-out duration-200">
                      {lb.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={lb.cover_image} alt={lb.title} className="w-16 h-16 object-cover rounded-md border border-gray-3" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-1 flex items-center justify-center">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke="#BCBCBC" strokeWidth="1.5" /><rect x="14" y="3" width="7" height="7" stroke="#BCBCBC" strokeWidth="1.5" /><rect x="3" y="14" width="7" height="7" stroke="#BCBCBC" strokeWidth="1.5" /><rect x="14" y="14" width="7" height="7" stroke="#BCBCBC" strokeWidth="1.5" /></svg>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-dark line-clamp-1">{lb.title}</p>
                        <p className="text-xs text-dark-4">{new Date(lb.created_at).toLocaleDateString()}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* <!-- Saved Worlds tab --> */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${activeTab === "worlds-tab" ? "block" : "hidden"}`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-xl text-dark">Saved Worlds</h3>
              </div>
              {sectionLoading ? (
                <div className="flex justify-center py-10"><div className="h-8 w-8 rounded-full border-4 border-t-dark border-gray-200 animate-spin" /></div>
              ) : savedWorlds.length === 0 ? (
                <div className="text-center py-10">
                  <svg className="mx-auto mb-3" width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#BCBCBC" strokeWidth="1.5" />
                    <path d="M3.6 9h16.8M3.6 15h16.8" stroke="#BCBCBC" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M12 3c-2.5 2.5-3 5.5-3 9s.5 6.5 3 9" stroke="#BCBCBC" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p className="text-dark-4 font-light mb-2">No saved worlds yet</p>
                  <p className="text-xs text-dark-5">Save a world from the Style Hub to see it here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedWorlds.map((world: any) => {
                    const filterEntries = Object.entries(world.filters || {}).filter(([, v]) => v && (typeof v === "string" || (Array.isArray(v) && (v as string[]).length > 0)));
                    return (
                      <div key={world.id} className="p-4 border border-gray-3 rounded-lg">
                        {world.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={world.image_url} alt={world.name} className="w-full h-28 object-cover rounded-md mb-3" referrerPolicy="no-referrer" />
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-dark">{world.name}</p>
                          <p className="text-[10px] text-dark-5">{new Date(world.created_at).toLocaleDateString()}</p>
                        </div>
                        {filterEntries.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {filterEntries.slice(0, 6).map(([key, val]) => {
                              const vals = Array.isArray(val) ? (val as string[]) : [val as string];
                              return vals.map((v) => (
                                <span key={`${key}-${v}`} className="text-[10px] font-light px-2 py-0.5 rounded border border-gray-3 text-dark-4 capitalize">
                                  {key === "color" && v.startsWith("#") ? (
                                    <span className="inline-flex items-center gap-1">
                                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: v }} />
                                      {v}
                                    </span>
                                  ) : v}
                                </span>
                              ));
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* <!-- My Coupons tab --> */}
            <div
              className={`xl:max-w-[770px] w-full ${activeTab === "coupons-tab" ? "block" : "hidden"}`}
            >
              <div className="mb-6">
                <CreateCouponForm onSuccess={() => setActiveTab("coupons-tab")} />
              </div>
              <div>
                <h3 className="font-medium text-xl text-dark mb-4">Generated Coupons</h3>
                <MyCouponsList />
              </div>
            </div>

            {/* <!-- downloads tab content start --> */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${activeTab === "downloads" ? "block" : "hidden"
                }`}
            >
              <p>You don&apos;t have any download</p>
            </div>
            {/* <!-- downloads tab content end --> */}

            {/* <!-- recently viewed tab content start --> */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${activeTab === "recent-tab" ? "block" : "hidden"
                }`}
            >
              {sectionLoading ? (
                <div className="flex justify-center p-10">
                  <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : recentlyViewed.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 py-16 text-center">
                  <svg className="mx-auto mb-3" width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#BCBCBC" strokeWidth="1.5" />
                    <path d="M12 7v5l3 3" stroke="#BCBCBC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-dark-4 font-light mb-2">No recently viewed items</p>
                  <p className="text-xs text-dark-5">Products you view will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {recentlyViewed.map((item: any) => {
                    const product = item.products;
                    if (!product) return null;
                    const priceMatches = product.price?.match(/[\d.]+/g);
                    const numericPrice = priceMatches && priceMatches.length > 0 ? parseFloat(priceMatches[0]) : null;
                    const discountMatches = product.discounted_price?.match(/[\d.]+/g);
                    const numericDiscountType = discountMatches && discountMatches.length > 0 ? parseFloat(discountMatches[0]) : null;

                    return (
                      <div key={item.product_id} className="relative group overflow-hidden rounded-lg hover:shadow-2 ease-out duration-200">
                        <a href={`/products/${product.slug}`} className="block relative aspect-[3/4] bg-[#F3F4F6] overflow-hidden">
                          {product.imgs && product.imgs.length > 0 && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.imgs[0]}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              alt={product.name || 'Product'}
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </a>
                        <div className="p-3">
                          <a href={`/products/${product.slug}`} className="text-sm text-dark font-medium leading-tight line-clamp-2 mb-1 hover:text-[#0A0A0A]">{product.name}</a>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-dark">
                              {numericDiscountType ? (
                                <>
                                  <span className="mr-2 text-red">${numericDiscountType}</span>
                                  <span className="text-xs text-dark-5 line-through font-normal">${numericPrice}</span>
                                </>
                              ) : (
                                <>${numericPrice}</>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* <!-- recently viewed tab content end --> */}

            <div
              className={`xl:max-w-[770px] w-full ${activeTab === "account-details" ? "block" : "hidden"
                }`}
            >
              <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5 mb-5">
                <h3 className="font-medium text-xl text-dark mb-5 border-b border-gray-3 pb-3">Avatar Image</h3>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-3 bg-gray-1 flex items-center justify-center flex-shrink-0">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-light text-dark uppercase">
                        {displayName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !user) return;
                        if (file.size > 2 * 1024 * 1024) { toast.error("Image must be smaller than 2MB."); return; }

                        setUploadingAvatar(true);
                        const ext = file.name.split('.').pop();
                        const filename = `${user.id}-${Date.now()}.${ext}`;

                        const { error: uploadError } = await supabase.storage
                          .from('user-avatars')
                          .upload(filename, file, { upsert: true });

                        if (uploadError) {
                          toast.error("Failed to upload image.");
                          setUploadingAvatar(false);
                          return;
                        }

                        const { data: urlData } = supabase.storage.from("user-avatars").getPublicUrl(filename);

                        await supabase.auth.updateUser({
                          data: { avatar_url: urlData.publicUrl }
                        });

                        setAvatarUrl(urlData.publicUrl);
                        toast.success("Avatar updated!");
                        setUploadingAvatar(false);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="text-xs font-light tracking-[0.1em] uppercase px-5 py-2.5 transition-all duration-300 border border-dark text-dark hover:bg-dark hover:text-white disabled:opacity-50"
                    >
                      {uploadingAvatar ? "Uploading..." : "Change Avatar"}
                    </button>
                    <p className="text-xs text-dark-5 mt-2 font-light">JPG, GIF or PNG. 2MB max.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate}>
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                    <div className="w-full">
                      <label htmlFor="firstName" className="block mb-2.5">
                        First Name <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        required
                        className="border border-[#E8E4DF] bg-transparent placeholder:text-[#8A8A8A] w-full py-3.5 px-5 outline-none duration-300 focus:border-[#0A0A0A] text-sm text-[#0A0A0A]"
                      />
                    </div>

                    <div className="w-full">
                      <label htmlFor="lastName" className="block mb-2.5">
                        Last Name <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        required
                        className="border border-[#E8E4DF] bg-transparent placeholder:text-[#8A8A8A] w-full py-3.5 px-5 outline-none duration-300 focus:border-[#0A0A0A] text-sm text-[#0A0A0A]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                    <div className="w-full">
                      <label htmlFor="countryName" className="block mb-2.5 text-sm">
                        Country / Region
                      </label>
                      <div className="relative">
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full bg-transparent border border-[#E8E4DF] text-dark-4 py-3.5 pl-5 pr-9 duration-300 outline-none focus:border-[#0A0A0A] text-sm"
                        >
                          <option value="">Select a country</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                          <option value="Saudi Arabia">Saudi Arabia</option>
                          <option value="United Arab Emirates">United Arab Emirates</option>
                        </select>
                      </div>
                    </div>

                    <div className="w-full">
                      <label htmlFor="phoneNumber" className="block mb-2.5 text-sm">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        id="phoneNumber"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 234 567 890"
                        className="border border-[#E8E4DF] bg-transparent placeholder:text-[#8A8A8A] w-full py-3.5 px-5 outline-none duration-300 focus:border-[#0A0A0A] text-sm text-[#0A0A0A]"
                      />
                    </div>
                  </div>

                  <div className="mb-5 lg:w-[calc(50%-1rem)]">
                    <label htmlFor="genderPreference" className="block mb-2.5 text-sm">
                      Shopping Preference
                    </label>
                    <div className="relative">
                      <select
                        value={genderPreference}
                        onChange={(e) => setGenderPreference(e.target.value)}
                        className="w-full bg-transparent border border-[#E8E4DF] text-dark-4 py-3.5 pl-5 pr-9 duration-300 outline-none focus:border-[#0A0A0A] text-sm"
                      >
                        <option value="">No Preference</option>
                        <option value="men">Men's Fashion</option>
                        <option value="women">Women's Fashion</option>
                        <option value="kids">Kids</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="inline-flex items-center justify-center text-xs font-light tracking-[0.2em] uppercase bg-[#0A0A0A] text-white px-8 py-3.5 hover:bg-black transition-all duration-300 disabled:opacity-50 mt-2"
                  >
                    {profileLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>

                <p className="text-custom-sm mt-5 mb-9">
                  This will be how your name will be displayed in the account
                  section and in reviews.
                </p>
              </form>

              <form onSubmit={handlePasswordUpdate}>
                <p className="font-medium text-xl sm:text-2xl text-dark mb-7">
                  Password Change
                </p>

                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <div className="mb-5">
                    <label htmlFor="newPassword" className="block mb-2.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="border border-[#E8E4DF] bg-transparent placeholder:text-[#8A8A8A] w-full py-3.5 px-5 outline-none duration-300 focus:border-[#0A0A0A] text-sm text-[#0A0A0A]"
                    />
                  </div>

                  <div className="mb-5">
                    <label
                      htmlFor="confirmNewPassword"
                      className="block mb-2.5"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmNewPassword"
                      id="confirmNewPassword"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="border border-[#E8E4DF] bg-transparent placeholder:text-[#8A8A8A] w-full py-3.5 px-5 outline-none duration-300 focus:border-[#0A0A0A] text-sm text-[#0A0A0A]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="inline-flex items-center justify-center text-xs font-light tracking-[0.2em] uppercase bg-[#0A0A0A] text-white px-8 py-3.5 hover:bg-black transition-all duration-300 disabled:opacity-50"
                  >
                    {passwordLoading ? "Updating..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
            {/* <!-- details tab content end -->
          <!--== user dashboard content end ==--> */}
          </div>
        </div>
      </section>

      <AddressModal isOpen={addressModal} closeModal={closeAddressModal} />
    </>
  );
};

export default MyAccount;

