"use client";
import { AnimatePresence, motion } from "motion/react";
import { type Ref, useState } from "react";
import { ezCreateContext } from "@/utils/createContext";

type FillContextProps = {
  children?: React.ReactNode;
};
type FillContextValue = {
  pushFrill: () => void;
  items: { id: number }[];
};

let id = 0;
const { Provider: ExpFrillProvider, useContext: useExpFrills } = ezCreateContext<
  FillContextValue,
  FillContextProps
>((P) => ({ children }) => {
  const [items, setItems] = useState<{ id: number }[]>([]);

  const addItem = () => {
    const newId = id++;
    setItems((prev) => [...prev, { id: newId }]);

    // auto-remove after some time
    setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== newId));
    }, 400); // match your animation length
  };
  return <P value={{ pushFrill: addItem, items }}>{children}</P>;
});
export { ExpFrillProvider, useExpFrills };

export function FrillContainer({ children }: { children?: React.ReactNode }) {
  const { items } = useExpFrills();
  return (
    <div className="relative">
      <div className="-translate-y-1/2 perspective-[200px] absolute top-1/2 left-full h-0 w-0 [transform-style:preserve-3d]">
        <AnimatePresence mode="popLayout">
          {items.map(({ id }) => (
            <ExpFrill key={`${id}`} />
          ))}
        </AnimatePresence>
      </div>
      {children}
    </div>
  );
}

function ExpFrill({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <motion.div
      ref={ref}
      layout
      transition={{ type: "spring", duration: 0.3, bounce: 0.5 }}
      initial={{ opacity: 0, scale: 0, rotateY: 0, rotateX: -5 }}
      animate={{ opacity: 1, scale: 1, rotateY: -40, rotateX: 0 }}
      exit={{ opacity: 0, scale: 1.5, rotateY: -40, rotateX: 5 }}
      className="-translate-y-1/2 absolute flex h-8 w-max items-center justify-center text-nowrap rounded-md border border-black bg-amber-300 px-1 py-5 font-mono text-4xl"
    >
      +1
    </motion.div>
  );
}

// function ExpFrill({ ref }: { ref?: Ref<HTMLDivElement> }) {
//   return (
//     <motion.div
//       ref={ref}
//       layout
//       transition={{ type: "spring", duration: 0.1, bounce: 0.5 }}
//       initial={{ opacity: 0, scale: 0 }}
//       animate={{ opacity: 1, scale: 1 }}
//       exit={{ opacity: 0, scale: 1.2 }}
//       className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[calc(100%+24px)] w-[calc(100%+24px)] bg-yellow-200"
//     />
//   );
// }
