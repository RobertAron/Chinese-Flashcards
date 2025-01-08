import clsx from "clsx";
export const Button = ({
  className,
  ...restProps
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...restProps}
      className={clsx(
        "border border-black p-1 hocus:bg-black hocus:text-white",
        className,
      )}
    />
  );
};
