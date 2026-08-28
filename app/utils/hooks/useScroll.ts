"use client";
import { useEffect, useState } from "react";
import { EVENT } from "@/app/constants";

export const useScroll = (offset: number): boolean => {
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > offset);
    };

    window.addEventListener(EVENT.SCROLL, handleScroll);
    return () =>
      window.removeEventListener(
        EVENT.SCROLL,
        handleScroll
      );
  }, [offset]);

  return scrolled;
};
