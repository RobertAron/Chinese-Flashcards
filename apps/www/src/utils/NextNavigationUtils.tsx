"use client";
// https://github.com/vercel/react-transition-progress/blob/main/src/next.tsx

import { LoaderCircle } from "lucide-react";
import type { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { formatUrl } from "next/dist/shared/lib/router/utils/format-url";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useEffect, useOptimistic, useState } from "react";
import { ezCreateContext } from "./createContext";

type ProvidedValue = {
  isLoading: boolean;
  triggerLoading: () => void;
};

const { Provider: LoadingProvider, useContext: useLoadingProvider } = ezCreateContext<ProvidedValue>(
  (Provider) =>
    function PageLoadingContext({ children }) {
      const [isLoading, setIsLoading] = useOptimistic(false);
      console.log(isLoading);
      const triggerLoading = useCallback(() => {
        setIsLoading(true);
      }, [setIsLoading]);
      return <Provider value={{ isLoading, triggerLoading }}>{children}</Provider>;
    },
);
export { LoadingProvider, useLoadingProvider };

function isModifiedEvent(event: React.MouseEvent): boolean {
  const eventTarget = event.currentTarget as HTMLAnchorElement | SVGAElement;
  const target = eventTarget.getAttribute("target");
  return (
    (target && target !== "_self") ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey || // triggers resource download
    (event.nativeEvent && event.nativeEvent.which === 2)
  );
}

type LoadableLink = Omit<React.ComponentProps<typeof NextLink>, "onClick">;
export function Link({ href, children, replace, scroll, ...rest }: LoadableLink) {
  const router = useLoadingRouter();
  const { triggerLoading } = useLoadingProvider();
  return (
    <NextLink
      href={href}
      onClick={(e) => {
        if (isModifiedEvent(e)) return;
        e.preventDefault();
        startTransition(() => {
          triggerLoading();
          const url = typeof href === "string" ? href : formatUrl(href);
          if (replace) {
            router.replace(url, { scroll });
          } else {
            router.push(url, { scroll });
          }
        });
      }}
      {...rest}
    >
      {children}
    </NextLink>
  );
}

export function useLoadingRouter() {
  const { replace, push, ...rest } = useRouter();
  const { triggerLoading } = useLoadingProvider();
  const loadingPush = useCallback(
    (href: string, options?: NavigateOptions) => {
      startTransition(() => {
        triggerLoading();
        push(href, options);
      });
    },
    [triggerLoading, push],
  );
  const loadingReplace = useCallback(
    (href: string, options?: NavigateOptions) => {
      startTransition(() => {
        triggerLoading();
        replace(href, options);
      });
    },
    [triggerLoading, replace],
  );
  return {
    ...rest,
    push: loadingPush,
    replace: loadingReplace,
  };
}

export function LoadingSpinner() {
  const { isLoading } = useLoadingProvider();
  const [showSpinner, setShowSpinner] = useState(false);
  useEffect(() => {
    if (!isLoading) {
      setShowSpinner(false);
      return;
    }
    const timeout = setTimeout(() => {
      setShowSpinner(true);
    }, 150);
    return () => clearTimeout(timeout);
  }, [isLoading]);
  if (!showSpinner) return null;
  return <LoaderCircle className="fixed right-4 bottom-4 h-12 w-12 animate-spin" strokeWidth={3.5} />;
}
