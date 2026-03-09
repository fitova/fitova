"use client";
import React from "react";
import { motion } from "framer-motion";
import VideoHero from "./VideoHero";
import BrandMarquee from "./BrandMarquee";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import BestSeller from "./BestSeller";
import TrendingSection from "./TrendingSection";
import Newsletter from "../Common/Newsletter";
import LookbookPreview from "./LookbookPreview";
import ThreeDSection from "./ThreeDSection/client";

// Reusable animation variants for page sections
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number], // Custom cubic-bezier for a premium, smooth feel
    }
  }
};

const SectionWrapper = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }} // Triggers slightly before coming fully into view
      variants={{
        hidden: fadeInUp.hidden,
        visible: {
          ...fadeInUp.visible,
          transition: { ...fadeInUp.visible.transition, delay }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

const Home = () => {
  return (
    <main className="relative overflow-hidden bg-[#F6F5F2]">
      {/* ── Diagonal background ornament ─────────────────────── */}
      <div className="page-ornament" aria-hidden="true" />

      {/* Hero sections (no scroll animation usually, they appear immediately) */}
      <VideoHero />
      <BrandMarquee />
      <Hero />

      {/* Main Content Sections with consistent spacing and animations */}
      <div className="flex flex-col gap-16 md:gap-24 lg:gap-32 py-16 md:py-24">

        <SectionWrapper>
          <Categories />
        </SectionWrapper>

        <SectionWrapper delay={0.1}>
          <NewArrival />
        </SectionWrapper>

        <SectionWrapper delay={0.1}>
          <BestSeller />
        </SectionWrapper>

        <SectionWrapper delay={0.2}>
          <TrendingSection />
        </SectionWrapper>

        <SectionWrapper>
          <ThreeDSection />
        </SectionWrapper>

        <SectionWrapper delay={0.1}>
          <LookbookPreview />
        </SectionWrapper>

      </div>

      <SectionWrapper delay={0.1} className="pb-16 md:pb-24">
        <Newsletter />
      </SectionWrapper>
    </main>
  );
};

export default Home;
