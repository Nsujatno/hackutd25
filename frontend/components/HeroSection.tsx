'use client';

import React from 'react';
import NextLink from 'next/link';
import { Link as ScrollLink } from 'react-scroll';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-linear-to-b from-gray-50 to-white px-8 py-24 text-gray-900 font-sans md:px-16 lg:px-24">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(147,197,253,0.08),transparent_50%)]"></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px]"></div>

      <div className="z-10 grid w-full max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full w-fit mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">AI-Powered Data Center Operations</span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
            Work Smarter in the{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-blue-400">
              Data Center
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 md:text-xl max-w-lg leading-relaxed">
            Revolutionizing data center operations with intelligent ticketing, 
            real-time guidance, and seamless workflow management for technicians worldwide.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <NextLink
              href="/kanban"
              className="inline-flex items-center gap-2 cursor-pointer rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition-transform active:scale-95 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/30"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </NextLink>
            
            <ScrollLink
              to="features"
              smooth={true}
              duration={500}
              offset={-10}
              className="inline-flex items-center cursor-pointer rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-95"
            >
              Learn More
            </ScrollLink>
          </div>
        </motion.div>

        {/* Visual Element */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex h-80 w-full items-center justify-center lg:h-96"
        >
          <div className="relative flex h-full w-full max-w-md items-center justify-center">
            {/* Animated Gradient Orbs */}
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 90, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute h-64 w-64 rounded-full bg-linear-to-br from-blue-400 to-blue-600 opacity-20 blur-3xl"
            ></motion.div>
            
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -90, 0]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute h-56 w-56 rounded-full bg-linear-to-br from-cyan-400 to-blue-500 opacity-20 blur-3xl"
            ></motion.div>
            
            <motion.div 
              animate={{ 
                scale: [1, 1.15, 1],
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute h-48 w-48 rounded-full bg-linear-to-br from-blue-300 to-indigo-400 opacity-30 blur-2xl"
            ></motion.div>

            {/* Center Highlight */}
            <div className="absolute h-32 w-32 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}