import React from "react";
import Link from "next/link";

interface PageCoverHeaderProps {
    title: string;
    preTitle?: string;
    subtitle?: string;
    backgroundImage?: string;
    breadcrumbPages: string[];
    children?: React.ReactNode;
}

const PageCoverHeader = ({ title, preTitle, subtitle, backgroundImage, breadcrumbPages, children }: PageCoverHeaderProps) => {
    return (
        <section
            className="relative flex flex-col items-center justify-center text-center pt-[150px] lg:pt-[200px] pb-24 px-4 overflow-hidden"
            style={{
                background: backgroundImage ? undefined : "#0A0A0A",
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Dark Overlay for text readability */}
            <div className="absolute inset-0" style={{ background: "rgba(10,10,10,0.65)" }} />

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 flex flex-col items-center">
                {/* Top Right Breadcrumb */}
                <div className="absolute top-0 right-4 sm:right-8 xl:right-0 -mt-16 sm:-mt-24 lg:-mt-28 hidden sm:block">
                    <ul className="flex items-center gap-2 text-xs font-light tracking-[0.15em] uppercase" style={{ color: "rgba(246,245,242,0.6)" }}>
                        <li>
                            <Link href="/" className="hover:text-white ease-out duration-200">
                                Home
                            </Link>
                        </li>
                        {breadcrumbPages.map((page, index) => (
                            <React.Fragment key={index}>
                                <span className="mx-1.5" style={{ color: "rgba(246,245,242,0.3)" }}>/</span>
                                <li className={index === breadcrumbPages.length - 1 ? "text-white" : ""}>
                                    {page}
                                </li>
                            </React.Fragment>
                        ))}
                    </ul>
                </div>

                {/* Mobile Breadcrumb (centered above title) */}
                <div className="mb-6 sm:hidden flex justify-center w-full">
                    <ul className="flex flex-wrap justify-center items-center gap-2 text-[10px] font-light tracking-[0.15em] uppercase" style={{ color: "rgba(246,245,242,0.6)" }}>
                        <li>
                            <Link href="/" className="hover:text-white ease-out duration-200">
                                Home
                            </Link>
                        </li>
                        {breadcrumbPages.map((page, index) => (
                            <React.Fragment key={index}>
                                <span className="mx-1" style={{ color: "rgba(246,245,242,0.3)" }}>/</span>
                                <li className={index === breadcrumbPages.length - 1 ? "text-white" : ""}>
                                    {page}
                                </li>
                            </React.Fragment>
                        ))}
                    </ul>
                </div>

                {preTitle && (
                    <span className="block text-xs font-light tracking-[0.35em] uppercase mb-4" style={{ color: "rgba(246,245,242,0.45)" }}>
                        {preTitle}
                    </span>
                )}

                {/* Main Title */}
                <h1
                    className="font-playfair text-5xl md:text-6xl lg:text-7xl font-normal text-white mb-4"
                    style={{ letterSpacing: "-0.02em" }}
                >
                    {title}
                </h1>

                {subtitle && (
                    <p className="font-light text-sm max-w-md leading-relaxed text-center" style={{ color: "rgba(246,245,242,0.5)" }}>
                        {subtitle}
                    </p>
                )}

                {children && <div className="mt-8">{children}</div>}
            </div>
        </section>
    );
};

export default PageCoverHeader;
