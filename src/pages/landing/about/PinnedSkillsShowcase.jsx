'use client';
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { motion } from "framer-motion";

import reactImage from '../../../assets/image.jpg';
import nodeImage from '../../../assets/node.jpeg';
import uiImage from '../../../assets/ui.jpg';
import performanceImage from '../../../assets/performance.jpg';
import { Particles } from "@/components/ui/shadcn-io/particles";

gsap.registerPlugin(ScrollTrigger);

/* =======================
   ELEGANT FLOATING SHAPE
======================= */
function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 120,
  rotate = 0,
  gradient = "from-white/[0.08]",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -120, rotate: rotate - 10 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.2,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
      }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient}
          backdrop-blur-[3px] border border-white/10 shadow-[0_8px_40px_rgba(255,255,255,0.08)]`}
        />
      </motion.div>
    </motion.div>
  );
}

/* =======================
   SKILLS DATA
======================= */
const SKILLS = [
  {
    title: "React & Next.js",
    image: reactImage,
    duration: "3+ Years",
    description: "Built scalable dashboards, landing pages & SaaS products.",
    highlight: "Component-driven & performance optimized",
  },
  {
    title: "Node.js & Express",
    image: nodeImage,
    duration: "2.5+ Years",
    description: "REST APIs, authentication systems & integrations.",
    highlight: "Secure & clean backend architecture",
  },
  {
    title: "UI / UX Design",
    image: uiImage,
    duration: "2+ Years",
    description: "Modern layouts, smooth animations & usability focus.",
    highlight: "Pixel-perfect interfaces",
  },
  {
    title: "Performance Optimization",
    image: performanceImage,
    duration: "Advanced",
    description: "Optimized load time, Core Web Vitals & UX flow.",
    highlight: "Fast, smooth & scalable apps",
  },
];

export default function PinnedSkillsShowcase() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(trackRef.current, {
        yPercent: -100 * (SKILLS.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${SKILLS.length * 100}%`,
          scrub: true,
          pin: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-[#030303]"
    >
      {/* 🔮 FLOATING SHAPES */}
      <Particles className="absolute inset-0" quantity={100} ease={80} color="#ffffff" refresh />


      <ElegantShape
        className="left-[-10%] top-[15%]"
        width={600}
        height={160}
        rotate={12}
        gradient="from-indigo-500/[0.18]"
        delay={0.3}
      />
      <ElegantShape
        className="right-[-8%] top-[55%]"
        width={520}
        height={140}
        rotate={-14}
        gradient="from-rose-500/[0.16]"
        delay={0.5}
      />
      <ElegantShape
        className="left-[15%] bottom-[8%]"
        width={300}
        height={90}
        rotate={-8}
        gradient="from-violet-500/[0.16]"
        delay={0.6}
      />
      <ElegantShape
        className="right-[18%] top-[12%]"
        width={220}
        height={70}
        rotate={22}
        gradient="from-cyan-500/[0.16]"
        delay={0.7}
      />

      {/* SLIDES */}
      <div ref={trackRef} className="relative z-10 h-full">
        {SKILLS.map((skill, index) => (
          <div
            key={index}
            className="h-screen w-full flex items-center justify-between px-8 md:px-20"
          >
            {/* LEFT TEXT */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-xl space-y-6"
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white">
                {skill.title}
              </h2>

              <p className="text-white/70 text-base md:text-lg">
                {skill.description}
              </p>

              <div className="text-sm text-indigo-400">
                ⏳ {skill.duration}
              </div>

              <p className="italic text-white/50">
                “{skill.highlight}”
              </p>
            </motion.div>

            {/* RIGHT IMAGE */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="hidden md:block"
            >
              <img
                src={skill.image}
                alt={skill.title}
                className="w-[420px] h-[420px] rounded-3xl object-cover
                shadow-2xl border border-white/10"
              />
            </motion.div>
          </div>
        ))}
      </div>

      {/* FADE */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80" />
    </section>
  );
}
