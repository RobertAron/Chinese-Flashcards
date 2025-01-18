"use client";
import Link from "next/link";
import React from "react";
import { motion } from "motion/react";
type NextLinkProps = Omit<
  React.ComponentProps<typeof Link>,
  "legacyBehavior" | "passHref"
>;
type MotionAnchorProps = React.ComponentProps<typeof motion.a>;

type MotionLinkProps = NextLinkProps & MotionAnchorProps;

export const MotionLink = ({ href, ref, ...rest }: MotionLinkProps) => {
  return (
    <Link href={href} legacyBehavior passHref ref={ref}>
      <motion.a {...rest} />
    </Link>
  );
};
