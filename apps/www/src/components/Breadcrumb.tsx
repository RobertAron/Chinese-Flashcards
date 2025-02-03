import { useMergeClasses } from "@/utils/styleResolvers";
import Link from "next/link";
import React from "react";

const baseClasses = "underline hocus:text-gray-700";
export function Breadcrumb({ className, ...props }: React.ComponentProps<typeof Link>) {
  const realClassName = useMergeClasses(baseClasses, className ?? "");
  return <Link className={realClassName} {...props} />;
}

export function BreadcrumbWrapper({ children }: { children?: React.ReactNode }) {
  const childrenItems = React.Children.toArray(children);
  return (
    <div className="flex gap-2">
      {childrenItems.map((child, idx) => (
        <React.Fragment key={idx}>
          {child}
          {idx < childrenItems.length - 1 && <span>/</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
