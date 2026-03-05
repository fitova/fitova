import { Menu } from "@/types/Menu";

export const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    newTab: false,
    path: "/",
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
        title: "New Arrivals",
        newTab: false,
        path: "/this-week/new-arrivals",
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
    id: 5,
    title: "Deals",
    newTab: false,
    path: "/deals",
  },
  {
    id: 6,
    title: "Coupons",
    newTab: false,
    path: "/coupons",
  },
  {
    id: 7,
    title: "AI Styling",
    newTab: false,
    path: "/ai-styling",
  },
];
