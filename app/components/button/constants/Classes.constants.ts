import { COLOR } from "@/app/constants/colors/Color.constants";

export const Classes = {
  primary: `bg-[#EC6165] text-white hover:text-[#EC6165] border-3 border-[#EC6165] 
                  hover:bg-white hover:border-[#EC6165]`,
  secondary: "bg-gray-200 hover:bg-gray-300 text-black",
  danger: `bg-[#7f1d1d] text-white hover:text-[#7f1d1d] border-3 border-[#7f1d1d] 
                  hover:bg-white hover:border-[#7f1d1d]`,
  base: "",
  dark_green: `bg-[${COLOR.DARK_GREEN}] text-[${COLOR.WHITE}] border-3 border-[${COLOR.WHITE}] 
                  hover:bg-white hover:text-[${COLOR.DARK_GREEN}] hover:border-[${COLOR.DARK_GREEN}]`,
  orange: `bg-[${COLOR.ORANGE}] text-[${COLOR.WHITE}] border-3 border-[${COLOR.WHITE}] 
                  hover:bg-white hover:text-[${COLOR.DARK_GREEN}] hover:border-[${COLOR.DARK_GREEN}]`,
  lime: `bg-[${COLOR.LIME}] text-[${COLOR.DARK_GREEN}] border-3 border-white
                  hover:bg-white hover:text-[${COLOR.DARK_GREEN}] hover:border-[${COLOR.DARK_GREEN}]`,
  brand_blue: "bg-brand-blue text-white hover:text-brand-blue border-3 border-brand-blue hover:bg-white transition-all disaPbled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-blue disabled:hover:text-white",
  cancel: `bg-red-400 text-white border border-red-400
                  hover:bg-red-300 hover:text-white hover:border-red-300`,
} as const;
