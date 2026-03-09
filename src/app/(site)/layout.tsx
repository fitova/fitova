"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";
import { ReactQueryProvider } from "@/lib/react-query";
import { StyleHubProvider } from "../context/StyleHubContext";
import StyleHubModal from "@/components/StyleHub";
import { AuthProvider } from "../context/AuthContext";
import { CartModalProvider as SlideUpCartModalProvider } from "../context/CartModalContext";
import { WishlistModalProvider as SlideUpWishlistModalProvider } from "../context/WishlistModalContext";
import CartModal from "@/components/Cart/CartModal";
import WishlistModal from "@/components/Wishlist/WishlistModal";

import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import { useAuthRehydrate } from "@/hooks/useAuthRehydrate";

/** Invisible component that rehydrates wishlist/cart from DB on login */
function AuthRehydrator() {
  useAuthRehydrate();
  return null;
}

/**
 * Wrapper that adds padding-top on all pages EXCEPT the homepage.
 * The homepage uses a transparent hero that starts at top:0 intentionally.
 * All other pages need clearance for the fixed two-row header (~140px).
 */
function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  return (
    <main className={isHomepage ? "" : "pt-[140px] page-bg min-h-screen"}>
      {children}
    </main>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="overflow-x-hidden">
        {loading ? (
          <PreLoader />
        ) : (
          <>
            <ReactQueryProvider>
              <AuthProvider>
                <ReduxProvider>
                  <AuthRehydrator />
                  <StyleHubProvider>
                    <SlideUpCartModalProvider>
                      <SlideUpWishlistModalProvider>
                        <CartModalProvider>
                          <ModalProvider>
                            <PreviewSliderProvider>
                              <Header />
                              <PageWrapper>{children}</PageWrapper>

                              <QuickViewModal />
                              <CartSidebarModal />
                              <PreviewSliderModal />
                              <StyleHubModal />
                              <CartModal />
                              <WishlistModal />
                            </PreviewSliderProvider>
                          </ModalProvider>
                        </CartModalProvider>
                      </SlideUpWishlistModalProvider>
                    </SlideUpCartModalProvider>
                  </StyleHubProvider>
                </ReduxProvider>
              </AuthProvider>
            </ReactQueryProvider>
            <ScrollToTop />
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}
