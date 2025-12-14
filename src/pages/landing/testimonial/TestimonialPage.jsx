'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FlipCard } from '@/components/animate-ui/components/community/flip-card';
import userimage from '../../../assets/placeholderImage.jpg'
import { Particles } from '@/components/ui/shadcn-io/particles';

// Elegant floating shapes
function ElegantShape({ className, width = 400, height = 100, rotate = 0, gradient = "from-white/[0.08]", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2.4, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.2 } }}
      className={`absolute ${className}`}
    >

      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{ width, height }}
        className="relative"
      >
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[3px] border border-white/10 shadow-lg`} />
      </motion.div>
    </motion.div>
  );
}

// Testimonial data
const testimonials = [
  { name: "Alice Johnson", title: "CEO", testimonial: "This team transformed our project!", avatar: userimage, socialLinks: { linkedin: "#", github: "#", twitter: "#" } },
  { name: "Mark Williams", title: "Founder", testimonial: "Highly professional & creative!", avatar: userimage, socialLinks: { linkedin: "#", github: "#", twitter: "#" } },
  { name: "Sara Khan", title: "CTO", testimonial: "Outstanding service and communication.", avatar: userimage, socialLinks: { linkedin: "#", github: "#", twitter: "#" } },
  { name: "David Lee", title: "Product Manager", testimonial: "Top-notch quality and delivery.", avatar: userimage, socialLinks: { linkedin: "#", github: "#", twitter: "#" } },
];

export default function TestimonialsPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#030303] flex flex-col items-center justify-center overflow-hidden px-6 py-12">
      {/* Floating Elegant Shapes */}
      <ElegantShape className="left-[-10%] top-[10%]" width={600} height={140} rotate={12} gradient="from-indigo-500/[0.15]" delay={0.2} />
      <ElegantShape className="right-[0%] top-[60%]" width={500} height={120} rotate={-15} gradient="from-rose-500/[0.15]" delay={0.4} />
      <ElegantShape className="left-[5%] bottom-[5%]" width={300} height={80} rotate={-8} gradient="from-violet-500/[0.15]" delay={0.3} />
      <ElegantShape className="right-[10%] bottom-[20%]" width={200} height={60} rotate={20} gradient="from-amber-500/[0.15]" delay={0.5} />

      <Particles className="absolute inset-0" quantity={100} ease={80} color="#ffffff" refresh />


      {/* Page Heading */}
      {/* Page Heading */}
      <div className="relative z-10 mb-16 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white">
          What Our Clients Say
        </h1>
        <p className="mt-3 text-white/50 max-w-xl mx-auto text-sm md:text-base">
          Trusted by founders, startups & teams for building high-quality digital products
        </p>

        {/* Glow */}
        <div className="absolute left-1/2 top-full mt-6 -translate-x-1/2 w-72 h-20 bg-indigo-500/20 blur-3xl rounded-full" />
      </div>

      {/* FlipCards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-6xl z-10 relative">
        {testimonials.map((t, idx) => (
          <FlipCard key={idx} data={t} />
        ))}
      </div>
    </div>
  );
}
