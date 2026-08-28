import Title from "@/app/components/title/Title";
import SectionTitleProps from "./SectionTitleProps.interface";
import { STRING, TitleVariant } from "@/app/constants";

const SectionTitle = ({
  className = STRING.Empty,
  text,
}: SectionTitleProps) => (
  <Title
    variant={TitleVariant.SECONDARY}
    className={`mt-6 text-center text-2xl lg:text-4xl font-bold text-[var(--color-dark-blue)] mb-6 rounded-lg ${className}`}
    text={text}
  />
);

export default SectionTitle;
