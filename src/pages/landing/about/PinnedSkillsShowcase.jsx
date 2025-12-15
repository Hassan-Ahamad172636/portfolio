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

function ElegantShape({ className, delay = 0, width = 400, height = 120, rotate = 0, gradient = "from-white/[0.08]" }) {
  const shapeRef = useRef(null);

  useEffect(() => {
    gsap.to(shapeRef.current, {
      xPercent: -40,
      ease: "none",
      scrollTrigger: {
        trigger: shapeRef.current,
        scrub: 0.5, // Softer parallax
      },
    });
  }, []);

  return (
    <motion.div
      ref={shapeRef}
      initial={{ opacity: 0, y: -100, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2.5, delay, ease: [0.22, 0.88, 0.38, 0.98] }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{ width, height }}
        className="relative"
      >
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient}
          backdrop-blur-[6px] border border-white/15 shadow-[0_20px_60px_rgba(100,100,255,0.15)]`} />
      </motion.div>
    </motion.div>
  );
}

const SKILLS = [
  { title: "React & Next.js", image: reactImage, duration: "3+ Years", description: "Built scalable dashboards, landing pages & SaaS products.", highlight: "Component-driven & performance optimized" },
  { title: "Node.js & Express", image: nodeImage, duration: "2.5+ Years", description: "REST APIs, authentication systems & integrations.", highlight: "Secure & clean backend architecture" },
  { title: "UI / UX Design", image: uiImage, duration: "2+ Years", description: "Modern layouts, smooth animations & usability focus.", highlight: "Pixel-perfect interfaces" },
  { title: "Performance Optimization", image: performanceImage, duration: "Advanced", description: "Optimized load time, Core Web Vitals & UX flow.", highlight: "Fast, smooth & scalable apps" },
];

export default function PinnedSkillsShowcase() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray(".skill-panel");

      const horizontalTween = gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 0.2, // Super smooth with slight lag (premium feel)
          snap: {
            snapTo: 1 / (panels.length - 1),
            duration: 0.6,
            ease: "power2.inOut",
          },
          start: "top top",
          end: "+=" + (panels.length * 100) + "%",
          invalidateOnRefresh: true,
        },
      });

      panels.forEach((panel) => {
        const text = panel.querySelector(".text-content");
        const img = panel.querySelector(".skill-image");

        gsap.fromTo(text, 
          { opacity: 0, x: -80 },
          {
            opacity: 1,
            x: 0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: horizontalTween,
              start: "left 80%",
              end: "left 20%",
              scrub: 0.5, // Smoother entrance
            },
          }
        );

        gsap.fromTo(img,
          { opacity: 0, scale: 0.9, x: 60 },
          {
            opacity: 1,
            scale: 1,
            x: 0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: horizontalTween,
              start: "left 80%",
              end: "left 20%",
              scrub: 0.6,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden bg-[#030303]">
      {/* Optimized Particles */}
      <Particles
        className="absolute inset-0"
        quantity={100} // Reduced for better performance
        ease={95}
        size={0.7}
        staticity={25}
        color="#ffffff"
        refresh
      />

      {/* Floating Shapes */}
      <ElegantShape className="left-[-15%] top-[10%]" width={700} height={180} rotate={15} gradient="from-indigo-600/[0.25]" delay={0.2} />
      <ElegantShape className="right-[-10%] top-[60%]" width={600} height={160} rotate={-20} gradient="from-rose-600/[0.22]" delay={0.4} />
      <ElegantShape className="left-[10%] bottom-[5%]" width={400} height={120} rotate={-10} gradient="from-violet-600/[0.20]" delay={0.6} />
      <ElegantShape className="right-[20%] top-[8%]" width={300} height={100} rotate={25} gradient="from-cyan-500/[0.18]" delay={0.8} />

      {/* Horizontal Track */}
      <div className="flex h-full items-center">
        {SKILLS.map((skill, index) => (
          <div 
            key={index} 
            className="skill-panel min-w-full flex items-center justify-between px-8 md:px-24 will-change-transform"
          >
            {/* Text Content */}
            <div className="text-content max-w-2xl space-y-8">
              <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                {skill.title}
              </h2>
              <p className="text-white/70 text-lg md:text-xl max-w-lg">
                {skill.description}
              </p>
              <div className="text-indigo-400 text-lg font-medium">
                ⏳ {skill.duration}
              </div>
              <p className="italic text-white/60 text-xl">
                “{skill.highlight}”
              </p>
            </div>

            {/* Image with Glow */}
            <div className="skill-image hidden md:block relative will-change-transform">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-purple-600/20 blur-3xl scale-150 -z-10" />
              <img
                src={skill.image}
                alt={skill.title}
                className="w-[480px] h-[480px] rounded-3xl object-cover shadow-2xl border border-white/20"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Top & Bottom Fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#030303] to-transparent z-20" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#030303] to-transparent z-20" />
    </section>
  );
}