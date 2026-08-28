import Image from "@/app/components/image/Image";
import { HERO_IMAGE } from "@/app/components/hero-section/HeroSection.constants";
import { useViewModelDevice } from "@/app/components/hero-section/hooks/useViewModelDevice";

const HeroImage = () => {
  const { isMobile } = useViewModelDevice();
  return (
    <>
      {isMobile ? (
        <div className="relative w-full aspect-[16/9]">
          <Image
            src={HERO_IMAGE.src}
            alt={HERO_IMAGE.alt}
            fill
            quality={100}
            sizes="(max-width: 1024px) 100vw"
            className="object-cover scale-[1.2] -translate-x-4 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="w-full">
          <Image
            src={HERO_IMAGE.src}
            alt={HERO_IMAGE.alt}
            width={1920}
            height={1080}
            quality={100}
            sizes="(max-width: 1920px) 100vw"
            className="w-full h-auto object-contain object-center"
          />
        </div>
      )}
    </>
  );
};

export default HeroImage;
