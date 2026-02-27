import React from "react";
import VideoHero from "./VideoHero";
import BrandMarquee from "./BrandMarquee";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import BestSeller from "./BestSeller";
import TrendingSection from "./TrendingSection";
import ThisWeek from "./ThisWeek";
import Newsletter from "../Common/Newsletter";
import LookbookPreview from "./LookbookPreview";
import ThreeDSection from "./ThreeDSection/client";

const Home = () => {
  return (
    <main>
      <VideoHero />
      <BrandMarquee />
      <Hero />
      <Categories />
      <NewArrival />
      <BestSeller />
      <TrendingSection />
      <ThisWeek />
      <ThreeDSection />
      <LookbookPreview />
      <Newsletter />
    </main>
  );
};

export default Home;
