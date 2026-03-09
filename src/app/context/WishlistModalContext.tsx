"use client";
import React, { createContext, useContext, useState } from "react";

type WishlistModalContextType = {
    isWishlistOpen: boolean;
    openWishlistModal: () => void;
    closeWishlistModal: () => void;
};

const WishlistModalContext = createContext<WishlistModalContextType | undefined>(undefined);

export const WishlistModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);

    const openWishlistModal = () => setIsWishlistOpen(true);
    const closeWishlistModal = () => setIsWishlistOpen(false);

    return (
        <WishlistModalContext.Provider value={{ isWishlistOpen, openWishlistModal, closeWishlistModal }}>
            {children}
        </WishlistModalContext.Provider>
    );
};

export const useWishlistModal = () => {
    const ctx = useContext(WishlistModalContext);
    if (!ctx) throw new Error("useWishlistModal must be used within WishlistModalProvider");
    return ctx;
};
