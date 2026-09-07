"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function ThankYouScreen({
  title,
  message,
  accent = "#FF6B45",
}: {
  title: string;
  message: string;
  accent?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: `${accent}22` }}
      >
        <Check className="h-7 w-7" style={{ color: accent }} />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mt-6 font-display text-3xl text-paper sm:text-4xl"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="mt-3 max-w-sm text-muted"
      >
        {message}
      </motion.p>
    </div>
  );
}
