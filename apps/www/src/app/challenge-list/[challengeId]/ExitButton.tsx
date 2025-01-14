import { Button } from "@/components/Button";
import { Kbd } from "@/components/Kbd";
import { Undo2 } from "lucide-react";
import { useEffect } from "react";

export function ExitButton({ onExit }: { onExit: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onExit();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExit]);
  return (
    <Button
      onClick={onExit}
      className="group flex gap-2 rounded-lg bg-white p-2"
    >
      <Undo2 />
      <div>Exit</div>
      <div className="flex gap-1">
        <Kbd>esc</Kbd>
      </div>
    </Button>
  );
}
