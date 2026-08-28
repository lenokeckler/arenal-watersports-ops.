import { HERO_VIDEO } from "@/app/components/hero-section/HeroSection.constants";
import { useViewModelDevice } from "@/app/components/hero-section/hooks/useViewModelDevice";

const HeroVideo = () => {
  const { isMobile } = useViewModelDevice();
  return (
    <div
      className={`relative w-full ${isMobile ? "h-[70vh]" : "aspect-[16/9]"}`}
    >
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source
          src={HERO_VIDEO.src}
          type={HERO_VIDEO.type}
        />
      </video>
    </div>
  );
};

export default HeroVideo;
