'use client';
import React from 'react';
import NextLink from 'next/link'; // <-- Rename to avoid name clash
import { Link as ScrollLink } from 'react-scroll';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0f0f0f] px-8 py-24 text-white font-sans md:px-16 lg:px-24">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-neutral-900 via-[#0f0f0f] to-[#0f0f0f]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/3 bg-white/5 rounded-full blur-[120px] opacity-10 -z-5"></div>

      <div className="z-10 grid w-full max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        {/* Text Content */}
        <div className="flex flex-col gap-6">
          <h1 className="text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-neutral-400 md:text-6xl lg:text-7xl">
            Shape Your Ideas Into Reality
          </h1>
          <p className="text-lg text-neutral-400 md:text-xl max-w-lg">
            Where focus flows, creation follows. Build, refine, and launch your
            next project with tools designed for clarity.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            {/* Link as button: Get Started (scrolls!) */}
            <NextLink
              href="/kanban"
              className="inline-block cursor-pointer rounded-full bg-white px-6 py-3 font-medium text-black transition-transform active:scale-95 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
            >
              Get Started
            </NextLink>
            <ScrollLink
              to="features"
              smooth={true}
              duration={500}
              offset={-10}
              className="inline-block cursor-pointer rounded-full border border-neutral-700 bg-transparent px-6 py-3 font-medium text-neutral-300 transition-all hover:border-neutral-600 hover:bg-neutral-800/50 hover:text-white"
            >
              <motion.span
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.13, ease: 'easeOut' }}
                style={{ display: 'inline-block' }}
              >
                Learn More
              </motion.span>
            </ScrollLink>
          </div>
        </div>
        {/* Orb Visual */}
        <div className="relative flex h-80 w-full items-center justify-center lg:h-96">
          <div className="relative flex h-full w-full max-w-md items-center justify-center">
            <div className="absolute h-72 w-72 rounded-full bg-purple-600 opacity-30 blur-3xl mix-blend-lighten"></div>
            <div className="absolute h-60 w-60 rounded-full bg-blue-500 opacity-30 blur-3xl mix-blend-lighten"></div>
            <div className="absolute h-48 w-48 rounded-full bg-pink-500 opacity-30 blur-3xl mix-blend-lighten"></div>
            <div className="absolute h-40 w-40 rounded-full bg-white/20 opacity-70 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
