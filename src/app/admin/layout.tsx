import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminHeader from "@/components/Admin/AdminHeader";
import { ReactQueryProvider } from "@/lib/react-query";
import "@/app/css/euclid-circular-a-font.css";
import "@/app/css/style.css";

// ⚠ DATABASE CONFIGURATION REQUIRED HERE
// يجب وضع بيانات قاعدة البيانات الجديدة هنا

export const metadata = {
    title: "Fitova Admin",
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect("/signin");
    }

    // Optional: verify is_admin in profiles table
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();

    if (!profile?.is_admin) {
        redirect("/"); // Not an admin
    }

    const user = { email: session.user.email || "admin@fitova.com", id: session.user.id };

    return (
        <html lang="en">
            <body>
                <ReactQueryProvider>
                    <div className="flex h-screen bg-[#F6F5F2] overflow-hidden">
                        <AdminSidebar />
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <AdminHeader user={user} />
                            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                                {children}
                            </main>
                        </div>
                    </div>
                </ReactQueryProvider>
            </body>
        </html>
    );
}
