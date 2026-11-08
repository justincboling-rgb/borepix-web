"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type Props = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  /** Seconds to wait before the entrance starts. Use for staggered siblings. */
  delay?: number;
  /** Pixels the element travels up as it enters. */
  distance?: number;
  /** Play once (default) or every time it enters the viewport. */
  once?: boolean;
};

/**
 * Entrance animation driven by Framer Motion's viewport observer. Fades and lifts into place.
 * Honors prefers-reduced-motion by rendering in place with no transform.
 */
export function Reveal({ children, delay = 0, distance = 24, once = true, ...rest }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Staggers direct children that are <Reveal> elements by `step` seconds each. */
export function RevealGroup({ children, step = 0.08, className }: { children: ReactNode; step?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: step } } }}
    >
      {children}
    </motion.div>
  );
}

/** A child of <RevealGroup>. */
export function RevealItem({ children, className, distance = 20 }: { children: ReactNode; className?: string; distance?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: distance },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}
