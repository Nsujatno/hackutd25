'use client';

import { motion } from 'framer-motion';
import { Element } from "react-scroll";
import { Zap, Shield, Puzzle } from 'lucide-react';

const features = [
  { 
    title: 'Lightning Fast', 
    description: 'Experience ultra-smooth performance with optimized workflows and real-time updates.',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    title: 'Next-level Security', 
    description: 'Your data is encrypted using state-of-the-art protocols and industry best practices.',
    icon: Shield,
    color: 'from-blue-600 to-indigo-600'
  },
  { 
    title: 'Seamless Integrations', 
    description: 'Connect instantly with popular apps and services through our unified API.',
    icon: Puzzle,
    color: 'from-cyan-500 to-blue-500'
  }
];

export default function FeaturesSection() {
  return (
    <Element name="features">
      <section className="bg-gradient-to-b from-white to-gray-50 py-16 w-full flex flex-col items-center border-t border-gray-100 relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-3xl -z-0"></div>
        
        {/* Features heading matching hero style */}
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.16, 1, 0.3, 1]
          }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 text-center select-none relative z-0"
        >
          Powerful Features
        </motion.h2>
        
        {/* Subtitle for context */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.8, 
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="text-lg md:text-xl text-gray-600 text-center mb-16 max-w-2xl px-6"
        >
          Everything you need to bring your vision to life
        </motion.p>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-6 relative z-10">
          {features.map((feature, idx) => (
            <FeatureCard key={feature.title} feature={feature} idx={idx} />
          ))}
        </div>
      </section>
    </Element>
  );
}

function FeatureCard({ feature, idx }: { feature: typeof features[0], idx: number }) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5, 
        delay: idx * 0.15,
        ease: "easeOut"
      }}
      className="group relative rounded-2xl p-8 bg-white backdrop-blur-sm border border-gray-200 cursor-pointer"
      style={{
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.backgroundColor = 'rgb(239 246 255)'; // blue-50
        e.currentTarget.style.borderColor = 'rgb(147 197 253)'; // blue-300
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgb(59 130 246 / 0.1), 0 8px 10px -6px rgb(59 130 246 / 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.backgroundColor = 'rgb(255 255 255)'; // white
        e.currentTarget.style.borderColor = 'rgb(229 231 235)'; // gray-200
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Icon with Gradient Background */}
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>

      {/* Content */}
      <h3 className="text-2xl font-semibold text-gray-900 mb-3">
        {feature.title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  );
}