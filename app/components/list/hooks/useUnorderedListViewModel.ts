import { useMemo } from "react";
import { formatMessages } from "../utils/formatMessages";
import { COLOR, STRING } from "@/app/constants";
import { UNORDERED_LIST } from "../UnorderedList.constants";
import {
  UnorderedListProps,
  UnorderedListItem,
} from "../UnorderedListProps.interface";
import { UnorderedListViewModel } from "../models/UnorderedListViewModel.interface";

const convertStyleToClasses = (
  style: React.CSSProperties = {}
): string => {
  const classes: string[] = [];
  if (style.margin) {
    if (typeof style.margin === "string") {
      const margin = style.margin.trim();
      if (margin === "0") {
        classes.push("m-0");
      } else if (margin === "4px" || margin === "0.25rem") {
        classes.push("m-1");
      } else if (margin === "8px" || margin === "0.5rem") {
        classes.push("m-2");
      } else if (
        margin === "12px" ||
        margin === "0.75rem"
      ) {
        classes.push("m-3");
      } else if (margin === "16px" || margin === "1rem") {
        classes.push("m-4");
      } else if (
        margin === "20px" ||
        margin === "1.25rem"
      ) {
        classes.push("m-5");
      } else if (margin === "24px" || margin === "1.5rem") {
        classes.push("m-6");
      } else if (margin === "32px" || margin === "2rem") {
        classes.push("m-8");
      } else if (margin === "40px" || margin === "2.5rem") {
        classes.push("m-10");
      } else if (margin === "48px" || margin === "3rem") {
        classes.push("m-12");
      }
    }
  }
  if (style.marginTop) {
    if (typeof style.marginTop === "string") {
      const marginTop = style.marginTop.trim();
      if (marginTop === "0") {
        classes.push("mt-0");
      } else if (
        marginTop === "4px" ||
        marginTop === "0.25rem"
      ) {
        classes.push("mt-1");
      } else if (
        marginTop === "8px" ||
        marginTop === "0.5rem"
      ) {
        classes.push("mt-2");
      } else if (
        marginTop === "12px" ||
        marginTop === "0.75rem"
      ) {
        classes.push("mt-3");
      } else if (
        marginTop === "16px" ||
        marginTop === "1rem"
      ) {
        classes.push("mt-4");
      } else if (
        marginTop === "20px" ||
        marginTop === "1.25rem"
      ) {
        classes.push("mt-5");
      } else if (
        marginTop === "24px" ||
        marginTop === "1.5rem"
      ) {
        classes.push("mt-6");
      } else if (
        marginTop === "32px" ||
        marginTop === "2rem"
      ) {
        classes.push("mt-8");
      } else if (
        marginTop === "40px" ||
        marginTop === "2.5rem"
      ) {
        classes.push("mt-10");
      } else if (
        marginTop === "48px" ||
        marginTop === "3rem"
      ) {
        classes.push("mt-12");
      }
    }
  }
  if (style.marginBottom) {
    if (typeof style.marginBottom === "string") {
      const marginBottom = style.marginBottom.trim();
      if (marginBottom === "0") {
        classes.push("mb-0");
      } else if (
        marginBottom === "4px" ||
        marginBottom === "0.25rem"
      ) {
        classes.push("mb-1");
      } else if (
        marginBottom === "8px" ||
        marginBottom === "0.5rem"
      ) {
        classes.push("mb-2");
      } else if (
        marginBottom === "12px" ||
        marginBottom === "0.75rem"
      ) {
        classes.push("mb-3");
      } else if (
        marginBottom === "16px" ||
        marginBottom === "1rem"
      ) {
        classes.push("mb-4");
      } else if (
        marginBottom === "20px" ||
        marginBottom === "1.25rem"
      ) {
        classes.push("mb-5");
      } else if (
        marginBottom === "24px" ||
        marginBottom === "1.5rem"
      ) {
        classes.push("mb-6");
      } else if (
        marginBottom === "32px" ||
        marginBottom === "2rem"
      ) {
        classes.push("mb-8");
      } else if (
        marginBottom === "40px" ||
        marginBottom === "2.5rem"
      ) {
        classes.push("mb-10");
      } else if (
        marginBottom === "48px" ||
        marginBottom === "3rem"
      ) {
        classes.push("mb-12");
      }
    }
  }
  if (style.marginLeft) {
    if (typeof style.marginLeft === "string") {
      const marginLeft = style.marginLeft.trim();
      if (marginLeft === "0") {
        classes.push("ml-0");
      } else if (
        marginLeft === "4px" ||
        marginLeft === "0.25rem"
      ) {
        classes.push("ml-1");
      } else if (
        marginLeft === "8px" ||
        marginLeft === "0.5rem"
      ) {
        classes.push("ml-2");
      } else if (
        marginLeft === "12px" ||
        marginLeft === "0.75rem"
      ) {
        classes.push("ml-3");
      } else if (
        marginLeft === "16px" ||
        marginLeft === "1rem"
      ) {
        classes.push("ml-4");
      } else if (
        marginLeft === "20px" ||
        marginLeft === "1.25rem"
      ) {
        classes.push("ml-5");
      } else if (
        marginLeft === "24px" ||
        marginLeft === "1.5rem"
      ) {
        classes.push("ml-6");
      } else if (
        marginLeft === "32px" ||
        marginLeft === "2rem"
      ) {
        classes.push("ml-8");
      } else if (
        marginLeft === "40px" ||
        marginLeft === "2.5rem"
      ) {
        classes.push("ml-10");
      } else if (
        marginLeft === "48px" ||
        marginLeft === "3rem"
      ) {
        classes.push("ml-12");
      }
    }
  }
  if (style.marginRight) {
    if (typeof style.marginRight === "string") {
      const marginRight = style.marginRight.trim();
      if (marginRight === "0") {
        classes.push("mr-0");
      } else if (
        marginRight === "4px" ||
        marginRight === "0.25rem"
      ) {
        classes.push("mr-1");
      } else if (
        marginRight === "8px" ||
        marginRight === "0.5rem"
      ) {
        classes.push("mr-2");
      } else if (
        marginRight === "12px" ||
        marginRight === "0.75rem"
      ) {
        classes.push("mr-3");
      } else if (
        marginRight === "16px" ||
        marginRight === "1rem"
      ) {
        classes.push("mr-4");
      } else if (
        marginRight === "20px" ||
        marginRight === "1.25rem"
      ) {
        classes.push("mr-5");
      } else if (
        marginRight === "24px" ||
        marginRight === "1.5rem"
      ) {
        classes.push("mr-6");
      } else if (
        marginRight === "32px" ||
        marginRight === "2rem"
      ) {
        classes.push("mr-8");
      } else if (
        marginRight === "40px" ||
        marginRight === "2.5rem"
      ) {
        classes.push("mr-10");
      } else if (
        marginRight === "48px" ||
        marginRight === "3rem"
      ) {
        classes.push("mr-12");
      }
    }
  }
  if (style.padding) {
    if (typeof style.padding === "string") {
      const padding = style.padding.trim();
      if (padding === "0") {
        classes.push("p-0");
      } else if (
        padding === "4px" ||
        padding === "0.25rem"
      ) {
        classes.push("p-1");
      } else if (
        padding === "8px" ||
        padding === "0.5rem"
      ) {
        classes.push("p-2");
      } else if (
        padding === "12px" ||
        padding === "0.75rem"
      ) {
        classes.push("p-3");
      } else if (padding === "16px" || padding === "1rem") {
        classes.push("p-4");
      } else if (
        padding === "20px" ||
        padding === "1.25rem"
      ) {
        classes.push("p-5");
      } else if (
        padding === "24px" ||
        padding === "1.5rem"
      ) {
        classes.push("p-6");
      } else if (padding === "32px" || padding === "2rem") {
        classes.push("p-8");
      } else if (
        padding === "40px" ||
        padding === "2.5rem"
      ) {
        classes.push("p-10");
      } else if (padding === "48px" || padding === "3rem") {
        classes.push("p-12");
      }
    }
  }
  if (style.borderRadius) {
    if (typeof style.borderRadius === "string") {
      const borderRadius = style.borderRadius.trim();
      if (borderRadius === "0") {
        classes.push("rounded-none");
      } else if (
        borderRadius === "4px" ||
        borderRadius === "0.25rem"
      ) {
        classes.push("rounded");
      } else if (
        borderRadius === "8px" ||
        borderRadius === "0.5rem"
      ) {
        classes.push("rounded-lg");
      } else if (
        borderRadius === "12px" ||
        borderRadius === "0.75rem"
      ) {
        classes.push("rounded-xl");
      } else if (
        borderRadius === "16px" ||
        borderRadius === "1rem"
      ) {
        classes.push("rounded-2xl");
      } else if (borderRadius === "50%") {
        classes.push("rounded-full");
      }
    }
  }
  if (style.display) {
    if (style.display === "block") {
      classes.push("block");
    } else if (style.display === "inline") {
      classes.push("inline");
    } else if (style.display === "inline-block") {
      classes.push("inline-block");
    } else if (style.display === "flex") {
      classes.push("flex");
    } else if (style.display === "grid") {
      classes.push("grid");
    } else if (style.display === "none") {
      classes.push("hidden");
    }
  }
  if (style.textAlign) {
    if (style.textAlign === "left") {
      classes.push("text-left");
    } else if (style.textAlign === "center") {
      classes.push("text-center");
    } else if (style.textAlign === "right") {
      classes.push("text-right");
    } else if (style.textAlign === "justify") {
      classes.push("text-justify");
    }
  }
  if (style.fontWeight) {
    if (
      style.fontWeight === "normal" ||
      style.fontWeight === "400"
    ) {
      classes.push("font-normal");
    } else if (
      style.fontWeight === "bold" ||
      style.fontWeight === "700"
    ) {
      classes.push("font-bold");
    } else if (style.fontWeight === "100") {
      classes.push("font-thin");
    } else if (style.fontWeight === "200") {
      classes.push("font-extralight");
    } else if (style.fontWeight === "300") {
      classes.push("font-light");
    } else if (style.fontWeight === "500") {
      classes.push("font-medium");
    } else if (style.fontWeight === "600") {
      classes.push("font-semibold");
    } else if (style.fontWeight === "800") {
      classes.push("font-extrabold");
    } else if (style.fontWeight === "900") {
      classes.push("font-black");
    }
  }

  return classes.join(STRING.SPACE);
};
const getVariantStyles = (variant: string) => {
  switch (variant) {
    case UNORDERED_LIST.VARIANTS.VALIDATION:
      return {
        containerClass: `bg-[${COLOR.LIGHT_CORAL}] text-[${COLOR.DARK_RED}] p-3 rounded-md`,
        listClass:
          "list-disc list-inside space-y-1 text-sm",
        itemClass: STRING.Empty,
      };
    case UNORDERED_LIST.VARIANTS.PLANS:
      return {
        containerClass: STRING.Empty,
        listClass: "list-none space-y-1",
        itemClass: "text-dark-blue text-center",
      };
    case UNORDERED_LIST.VARIANTS.SIDE_MENU:
      return {
        containerClass: STRING.Empty,
        listClass: "list-disc list-inside space-y-2",
        itemClass: "text-dark-blue text-center",
      };
    case UNORDERED_LIST.VARIANTS.DEFAULT:
    default:
      return {
        containerClass: STRING.Empty,
        listClass: "list-disc list-inside space-y-2",
        itemClass: STRING.Empty,
      };
  }
};
export const useUnorderedListViewModel = ({
  validationMessages,
  items = [],
  variant = UNORDERED_LIST.VARIANTS.DEFAULT,
  style = {},
}: UnorderedListProps): UnorderedListViewModel => {
  const viewModel = useMemo(() => {
    const finalVariant = validationMessages
      ? UNORDERED_LIST.VARIANTS.VALIDATION
      : variant;
    let finalItems: (string | UnorderedListItem)[] = [];

    if (
      finalVariant === UNORDERED_LIST.VARIANTS.VALIDATION &&
      validationMessages
    ) {
      if (Array.isArray(validationMessages)) {
        const formattedMessage = formatMessages(
          validationMessages
        );
        if (formattedMessage) {
          finalItems = [formattedMessage];
        }
      }
    } else {
      finalItems = items;
    }
    const shouldRender =
      finalItems && finalItems.length > 0;
    const variantStyles = getVariantStyles(finalVariant);
    const styleClasses = convertStyleToClasses(style);

    return {
      finalVariant,
      finalItems,
      variantStyles,
      styleClasses,
      shouldRender,
    };
  }, [validationMessages, items, variant, style]);
  return viewModel;
};
