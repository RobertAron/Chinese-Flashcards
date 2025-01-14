import clsx from "clsx";
import NextLink from "next/link";
type Props = Parameters<typeof NextLink>[0];
export const Link = ({ className, ...restProps }: Props) => {
  return (
    <NextLink
      {...restProps}
      className={clsx(
        "border border-black p-1 transition-colors duration-100 hocus:bg-black hocus:text-white",
        className,
      )}
    />
  );
};
