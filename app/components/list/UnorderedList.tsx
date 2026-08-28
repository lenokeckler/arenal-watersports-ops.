import { UnorderedListProps } from "./UnorderedListProps.interface";
import { STRING } from "@/app/constants";
import { useUnorderedListViewModel } from "./hooks/useUnorderedListViewModel";

const UnorderedList = ({
  validationMessages,
  items = [],
  variant,
  className = STRING.Empty,
  style = {},
}: UnorderedListProps) => {
  const { finalItems, variantStyles, styleClasses } =
    useUnorderedListViewModel({
      validationMessages,
      items,
      variant,
      style,
    });
  return (
    <div
      className={`${className} ${styleClasses} ${variantStyles.containerClass}`.trim()}
      style={style}
    >
      <ul className={variantStyles.listClass}>
        {finalItems.map((item, index) => {
          const text =
            typeof item === "string" ? item : item.text;
          const key =
            typeof item === "string"
              ? index
              : item.id || index;
          return (
            <li
              key={key}
              className={variantStyles.itemClass}
            >
              {text}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export default UnorderedList;
