import { Menu } from "@/types/Menu";

export const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    title: "Shop",
    newTab: false,
    path: "/shop-with-sidebar",
    submenu: [
      {
        id: 21,
        title: "All Categories",
        newTab: false,
        path: "/shop-with-sidebar",
      },
      {
        id: 22,
        title: "T-Shirts",
        newTab: false,
        path: "/shop-with-sidebar?category=t-shirts",
      },
      {
        id: 23,
        title: "Shirts",
        newTab: false,
        path: "/shop-with-sidebar?category=shirts",
      },
      {
        id: 24,
        title: "Pants",
        newTab: false,
        path: "/shop-with-sidebar?category=pants",
      },
      {
        id: 25,
        title: "Jackets",
        newTab: false,
        path: "/shop-with-sidebar?category=jackets",
      },
      {
        id: 26,
        title: "Shoes",
        newTab: false,
        path: "/shop-with-sidebar?category=shoes",
      },
      {
        id: 27,
        title: "Accessories",
        newTab: false,
        path: "/shop-with-sidebar?category=accessories",
      },
      {
        id: 28,
        title: "Bags",
        newTab: false,
        path: "/shop-with-sidebar?category=bags",
      },
      {
        id: 29,
        title: "Activewear",
        newTab: false,
        path: "/shop-with-sidebar?category=activewear",
      },
    ],
  },
  {
    id: 3,
    title: "This Week",
    newTab: false,
    path: "/this-week",
    submenu: [
      {
        id: 31,
        title: "Trending",
        newTab: false,
        path: "/this-week/trending",
      },
      {
        id: 32,
        title: "Best Sellers",
        newTab: false,
        path: "/this-week/best-sellers",
      },
      {
        id: 33,
        title: "Recently Viewed",
        newTab: false,
        path: "/this-week/recently-viewed",
      },
    ],
  },
  {
    id: 4,
    title: "Lookbook",
    newTab: false,
    path: "/lookbook",
  },
  {
    id: 4,
    title: "Deals",
    newTab: false,
    path: "/deals",
  },
  {
    id: 5,
    title: "Coupons",
    newTab: false,
    path: "/coupons",
  },
  {
    id: 6,
    title: "AI Styling",
    newTab: false,
    path: "/ai-styling",
  },
];
