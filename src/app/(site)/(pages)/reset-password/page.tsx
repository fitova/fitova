import ResetPassword from "@/components/Auth/ResetPassword";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Set New Password | Fitova",
    description: "Set a new password for your Fitova account",
};

const ResetPasswordPage = () => {
    return (
        <main>
            <ResetPassword />
        </main>
    );
};

export default ResetPasswordPage;
