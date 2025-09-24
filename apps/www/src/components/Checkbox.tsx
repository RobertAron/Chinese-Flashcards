import { motion } from "motion/react";
import { Checkbox as AriaCheckbox, type CheckboxProps as AriaCheckboxProps } from "react-aria-components";

type CheckboxProps = Omit<AriaCheckboxProps, "children"> & {
  children?: React.ReactNode;
};
export function Checkbox({ children, ...restProps }: CheckboxProps) {
  return (
    <AriaCheckbox className="flex group gap-2" {...restProps} >
      {({ isSelected }) => (
        <>
          <div className="rounded-md border-2 border-black group-data-[focused=true]:bg-slate-100 group-data-[focused=true]:ring group-data-[pressed=true]:bg-slate-200">
            <motion.svg
              role="img"
              aria-label="checkbox"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M3 12L9 18L21 4"
                stroke="#000"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: isSelected ? 1 : 0 }}
                transition={{ duration: 0.075 }}
              />
            </motion.svg>
          </div>
          {children}
        </>
      )}
    </AriaCheckbox>
  );
}
