"use client";
import { useMergeClasses } from "@/utils/styleResolvers";
import Link from "next/link";
import React, { useCallback } from "react";
import { useKeyTrigger } from "@/utils/hooks";
import { useRouter } from "next/navigation";
import { Kbd } from "./Kbd";

const baseClasses = "underline hocus:text-gray-600";
export function Breadcrumb({ className, ...props }: React.ComponentProps<typeof Link>) {
  const realClassName = useMergeClasses(baseClasses, className ?? "");
  return <Link className={realClassName} {...props} />;
}

export function BreadcrumbContainer({ children }: { children?: React.ReactNode }) {
  const childrenItems = React.Children.toArray(children);
  return (
    <nav className="flex gap-2 py-1">
      {childrenItems.map((child, idx) => (
        <React.Fragment key={idx}>
          {child}
          {idx < childrenItems.length - 1 && <span>/</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function BreadcrumbEscape({
  children,
  ...props
}: Omit<React.ComponentProps<typeof Breadcrumb>, "className" | "href"> & { href: string }) {
  const router = useRouter();
  const navigate = useCallback(() => {
    router.push(props.href);
  }, [props.href, router]);
  useKeyTrigger("Escape", navigate);

  return (
    <Breadcrumb className="flex gap-1 no-underline" {...props}>
      <div className="underline">{children}</div>
      <Kbd>esc</Kbd>
    </Breadcrumb>
  );
}
