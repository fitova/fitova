"use client";
import React, { createContext, useContext, useState } from "react";

type CartModalContextType = {
    isCartOpen: boolean;
    openCartModal: () => void;
    closeCartModal: () => void;
};

const CartModalContext = createContext<CartModalContextType | undefined>(undefined);

export const CartModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isCartOpen, setIsCartOpen] = useState(false);

    const openCartModal = () => setIsCartOpen(true);
    const closeCartModal = () => setIsCartOpen(false);

    return (
        <CartModalContext.Provider value={{ isCartOpen, openCartModal, closeCartModal }}>
            {children}
        </CartModalContext.Provider>
    );
};

export const useCartModal = () => {
    const ctx = useContext(CartModalContext);
    if (!ctx) throw new Error("useCartModal must be used within CartModalProvider");
    return ctx;
};
