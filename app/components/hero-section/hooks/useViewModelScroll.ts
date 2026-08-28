import { useCallback } from "react";
import { SECTION_ID } from "@/app/constants";
import { HERO } from "@/app/components/hero-section/HeroSection.constants";

export const useViewModelScroll = () => {
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: HERO.SMOOTH });
    }
  };

  const handleScrollToContact = useCallback(() => {
    scrollToSection(SECTION_ID.CONTACT);
  }, []);

  return {
    handleScrollToContact,
  };
};
