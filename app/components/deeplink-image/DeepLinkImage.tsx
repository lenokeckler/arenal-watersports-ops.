import { BOOLEAN } from "@/app/constants";
import Image from "../image/Image";
import Link from "../link/Link";
import { DeepLinkImageProps } from "./DeepLinkImageProps.interface";

const DeepLinkImage = ({
  alt,
  href,
  linkClassName,
  src,
  size = 30,
  imageClassName,
}: DeepLinkImageProps) => (
  <Link
    href={href}
    className={linkClassName}
  >
    <Image
      aria-hidden={BOOLEAN.FALSE.value}
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={imageClassName}
    />
  </Link>
);
export default DeepLinkImage;
