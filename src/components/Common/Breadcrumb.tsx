import Link from "next/link";
import React from "react";

const Breadcrumb = ({ title, pages }: { title: string; pages: string[] }) => {
  return (
    <div
      className="overflow-hidden pt-[209px] sm:pt-[155px] lg:pt-[95px] xl:pt-[165px]"
      style={{ background: "#F6F5F2" }}
    >
      <div style={{ borderTop: "1px solid #E8E4DF" }}>
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-5 xl:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1
              className="font-playfair font-normal text-2xl xl:text-3xl text-dark"
              style={{ letterSpacing: "-0.02em" }}
            >
              {title}
            </h1>

            <ul className="flex items-center gap-2 text-xs font-light tracking-[0.1em]">
              <li style={{ color: "#8A8A8A" }}>
                <Link
                  href="/"
                  className="hover:text-dark ease-out duration-200"
                  style={{ color: "#8A8A8A" }}
                >
                  Home
                </Link>
                <span className="mx-2" style={{ color: "#C8C4BF" }}>
                  /
                </span>
              </li>
              {pages.length > 0 &&
                pages.map((page, key) => (
                  <li
                    className="capitalize last:text-dark"
                    key={key}
                    style={{ color: "#8A8A8A" }}
                  >
                    {page}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
