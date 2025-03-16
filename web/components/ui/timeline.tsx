import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "./button";

interface TimelineProps {
  items: { title: string; description: string }[];
  onSelect: (index: number) => void;
  selectedIndex: number;
}

const barVariants = {
  initial: { width: 0 },
  animate: (width: number) => ({ width: `${width}%` }),
};

const buttonVariants = {
  initial: { scale: 1 },
  animate: (isSelected: boolean) => ({ scale: isSelected ? 1.4 : 1 }),
};

const pulseVariants = {
  hidden: { scale: 0, opacity: 1 },
  animate: { scale: 2, opacity: 0 },
  exit: { scale: 0, opacity: 0 },
};

const transition = { type: "spring", bounce: 0, duration: 0.6 };

export function Timeline({ items, onSelect, selectedIndex }: TimelineProps) {
  const progressWidth = (selectedIndex / (items.length - 1)) * 100;

  return (
    <div className="relative flex items-center justify-between w-full">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary transform -translate-y-1/2"></div>
      <motion.div
        className="absolute top-1/2 left-0 h-1 bg-popover-foreground transform -translate-y-1/2 transition-width duration-300 mt-0"
        variants={barVariants}
        initial="initial"
        animate="animate"
        custom={progressWidth}
        transition={transition}
      ></motion.div>
      {items.map((_item, index) => (
        <motion.div
          key={index}
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          custom={selectedIndex === index}
          transition={transition}
          className="relative"
        >
          {selectedIndex === index && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-accent-foreground"
                variants={pulseVariants}
                initial="hidden"
                animate="animate"
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "loop",
                  repeatDelay: 0.5,
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-foreground"
                variants={pulseVariants}
                initial="hidden"
                animate="animate"
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "loop",
                  repeatDelay: 0.5,
                  delay: 0.5,
                }}
              />
            </>
          )}
          <div
            className={cn(
              "relative z-10 p-4 rounded-full border border-popover-foreground",
              selectedIndex === index
                ? "bg-accent text-foreground"
                : index <= selectedIndex - 1
                ? "bg-popover-foreground text-background"
                : "bg-background text-foreground",
              "w-5 h-5 flex items-center justify-center"
            )}
          >
            {index + 1}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
