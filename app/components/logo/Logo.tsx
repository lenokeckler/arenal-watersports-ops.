"use client";
import Link from "../link/Link";
import Image from "../image/Image";
import { LogoProps } from "./LogoProps.interface";
import { BOOLEAN, PATHS, LOGO } from "@/app/constants";

const Logo = ({ src, alt, onClick }: LogoProps) => (
  <Link
    href={PATHS.COMMON.ROOT}
    className="relative flex items-center h-[80px] sm:h-[100px]"
    onClick={onClick}
  >
    <div className="relative w-[70px] h-[70px] sm:w-[100px] sm:h-[100px]">
      <Image
        src={src}
        alt={alt}
        fill
        aria-hidden={BOOLEAN.FALSE.value}
        className="object-contain"
      />
    </div>
    <span className="absolute left-[60px] sm:left-[80px] top-1/2 -translate-y-1/2 text-lg sm:text-2xl font-bold text-on-surface flex items-center gap-2">
      {LOGO.ARENAL}
    </span>
  </Link>
);
export default Logo;
