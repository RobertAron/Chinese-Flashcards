"use client";
// https://github.com/vercel/react-transition-progress/blob/main/src/next.tsx

import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useIsPresent,
  useMotionValue,
  useTransform,
} from "motion/react";
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

export type LoadableLinkProps = Omit<React.ComponentProps<typeof NextLink>, "onClick">;
export function Link({ href, children, replace, scroll, ...rest }: LoadableLinkProps) {
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

export function LoadingRender() {
  const { isLoading } = useLoadingProvider();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  useEffect(() => {
    if (!isLoading) {
      setLoadingId(null);
      return;
    }
    const timeout = setTimeout(() => {
      setLoadingId(Math.random());
    }, 150);
    return () => clearTimeout(timeout);
  }, [isLoading]);
  // return null;
  return <AnimatePresence>{loadingId !== null && <LoadingBar key={loadingId} />}</AnimatePresence>;
}

export function LoadingBar() {
  const currentlyShownPercent = useMotionValue(0);
  const isPresent = useIsPresent();
  useAnimationFrame((_, delta) => {
    const easingFactor = 0.2; // Adjust this for speed
    const scaledEasingFactor = easingFactor * (delta / 1000); // Scale by delta
    currentlyShownPercent.set(
      currentlyShownPercent.get() + (1 - currentlyShownPercent.get()) * scaledEasingFactor,
    );
  });
  const value = useTransform(currentlyShownPercent, (val) => `${val * 100}%`);
  return (
    <motion.div
      className="fixed top-0 left-0 z-50 h-1 bg-blue-500"
      style={{ width: isPresent ? value : undefined }}
      exit={{
        width: [null, "100%", "100%"],
        opacity: [1, 1, 0],
        transition: { duration: 0.5, times: [0, 0.8, 1] },
      }}
    />
  );
}
