import { HeroProps } from "./HeroSectionProps.interface";
import HeroMedia from "./hero-media/HeroMedia";
import { useViewModelScroll } from "./hooks/useViewModelScroll";
import {
  Button,
  Section,
  Title,
  InlineText,
} from "@/app/components";
import {
  STRING,
  SIZE,
  SECTION_ID,
  TitleVariant,
} from "@/app/constants";
import { useViewModelDevice } from "./hooks/useViewModelDevice";

const HeroSection = ({ cover }: HeroProps) => {
  const { handleScrollToContact } = useViewModelScroll();
  const { isMobile } = useViewModelDevice();
  return (
    <Section className="relative w-full overflow-hidden">
      <HeroMedia type={cover.media_type} />
      <div
        className="absolute inset-0 z-10 flex flex-col items-center 
           justify-center px-4 sm:px-6 md:px-10 max-w-7xl mx-auto fade-in"
      >
        <div
          className={`mt-[20px] ${isMobile ? "justify-center" : "lg:mt-[120px]"} text-left slide-down`}
          style={{ animationDelay: "0.3s", opacity: 0 }}
        >
          <Title
            variant={TitleVariant.PRIMARY}
            id={SECTION_ID.HERO_SECTION}
            className="text-center font-extrabold leading-tight drop-shadow-md"
          >
            <InlineText
              className="block text-white text-3xl sm:text-4xl md:text-5xl 
                  lg:text-6xl xl:text-7xl mb-3 sm:mb-4 md:mb-5"
            >
              {cover.title[0]}
            </InlineText>

            <InlineText className="block text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl mb-1">
              <InlineText className="text-sky-blue">
                {cover.title[1]}
              </InlineText>{" "}
              {STRING.SPACE}
              <InlineText className="text-white">
                {cover.title[2]}
              </InlineText>
            </InlineText>

            <InlineText className="block text-white text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl">
              {cover.title[3]}
            </InlineText>
          </Title>
          <div
            className="flex mt-36 pl-6 sm:pl-10 lg:pl-100 slide-up"
            style={{ animationDelay: "0.6s", opacity: 0 }}
          >
            <Button
              size={SIZE.XL}
              radius={SIZE.LG}
              onClick={handleScrollToContact}
              className="border-[0.5px] bg-transparent border-white text-white hover:!bg-sky-blue 
                         hover:text-white hover:border-white transition-colors duration-200"
            >
              {cover.cover_button}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default HeroSection;
