'use client';
import { motion } from 'framer-motion';
import { Element } from "react-scroll";
import { useState } from 'react';

const accentGradient = 'bg-gradient-to-r from-[#a259ff] via-[#7f55fa] to-[#f162ff]';

const features = [
  { title: 'Lightning Fast', description: 'Experience ultra-smooth performance on every device.' },
  { title: 'Next-level Security', description: 'Your data is encrypted using state-of-the-art protocols.' },
  { title: 'Seamless Integrations', description: 'Connect instantly with popular apps and services.' }
];

export default function FeaturesSection() {
  return (
    <Element name="features">
      <section className="bg-[#0f0f0f] py-20 w-full flex flex-col items-center">
        <motion.h1 
          initial={{ scale: 0.5, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ 
            duration: 1.2, 
            ease: "easeOut" 
          }}
          className="text-[170px] font-bold mb-12 text-transparent bg-clip-text bg-linear-to-b from-white to-neutral-400 text-center select-none relative z-0"
          style={{
            textShadow: '0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.2), 0 0 60px rgba(255, 255, 255, 0.1)'
          }}
        >
          FEATURES
        </motion.h1>

        <div className="flex flex-col md:flex-row gap-5 w-full max-w-6xl justify-center items-center -mt-33 relative z-10">
          {features.map((feature, idx) => (
            <FeatureCard key={feature.title} feature={feature} idx={idx} />
          ))}
        </div>
      </section>
    </Element>
  );
}

function FeatureCard({ feature, idx }: { feature: typeof features[0], idx: number }) {
  const [animationDelay, setAnimationDelay] = useState(idx * 0.4);

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: animationDelay, 
        type: "spring" 
      }}
      onAnimationComplete={() => setAnimationDelay(0)}

      whileHover={{ 
        scale: 1.05,
        borderColor: 'rgba(162, 89, 255, 0.5)',
        boxShadow: '0 0 30px 5px rgba(162, 89, 255, 0.1), 0 0 60px 20px rgba(162, 89, 255, 0.3)',
        transition: { duration: 0.2, delay: 0 }
      }}
      style={{
        boxShadow: '0 0 30px 5px rgba(162, 89, 255, 0.1), 0 0 60px 15px rgba(162, 89, 255, 0.08)'
      }}
      className="rounded-2xl w-[400px] h-[400px] p-8 border border-white/20
                bg-black/1 backdrop-blur-md"
    >
      <h2 className={`text-2xl font-bold bg-clip-text text-transparent ${accentGradient} mb-2`}>
        {feature.title}
      </h2>
      <p className="text-neutral-200 text-md">{feature.description}</p>
    </motion.div>
  );
}
