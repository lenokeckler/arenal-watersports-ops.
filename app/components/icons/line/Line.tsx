import Image from "../../image/Image";

type LineProps = {
  className: string;
  src: string;
};

const Line = ({
  className,
  src = "/icons/line-green.svg",
}: LineProps) => (
  <div className={className}>
    <Image
      src={src}
      alt=""
      width={2826}
      height={14}
      className="
        w-full h-auto
        transform origin-center
        scale-y-[8]       
        lg:scale-y-[1.8]   
      "
    />
  </div>
);

export default Line;
