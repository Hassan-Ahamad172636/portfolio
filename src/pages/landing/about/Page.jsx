'use client';
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import profilePic from "../../../assets/profilePic.jpg";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import reactImage from '../../../assets/image.jpg'
import angularImage from '../../../assets/angular.jpg'
import scssImage from '../../../assets/scss.png'
import nodeImage from '../../../assets/node.jpeg'
import htmlImage from '../../../assets/html.jpg'
import cssImage from '../../../assets/css.jpg'
import jsImage from '../../../assets/js.png'
import tailwindImage from '../../../assets/tailwind.jpg'
import bootstrapImage from '../../../assets/bootstrap.jpg'
import uiImage from '../../../assets/ui.jpg'
import performanceImage from '../../../assets/performance.jpg'
import { RadialIntro } from "@/components/animate-ui/components/community/radial-intro";
import PinnedSkillsShowcase from "./PinnedSkillsShowcase";
import { Particles } from "@/components/ui/shadcn-io/particles";

gsap.registerPlugin(ScrollTrigger);

function ElegantShape({ className, delay = 0, width = 400, height = 100, rotate = 0, gradient = "from-white/[0.08]" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2.4, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.2 } }}
      className={`absolute ${className}`}>
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{ width, height }}
        className="relative">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[2px] border-2 border-white/[0.15] shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]`} />
      </motion.div>
    </motion.div>
  );
}


export default function AboutPage() {
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const skills = [
    { name: "React & Next.js", level: 90 },
    { name: "Node.js & Express", level: 85 },
    { name: "MongoDB", level: 80 },
    { name: "Tailwind CSS", level: 95 },
    { name: "REST APIs", level: 88 },
  ];

  const ITEMS = [
    {
      title: 'html',
      src: htmlImage
    },
    {
      title: 'css',
      src: cssImage
    },
    {
      title: 'javascript',
      src: jsImage
    },
    {
      title: 'tailwind',
      src: tailwindImage
    },
    {
      title: 'bootstrap',
      src: bootstrapImage
    },
    {
      title: 'react',
      src: reactImage
    },
    {
      title: 'angular',
      src: angularImage
    },
    {
      title: 'react',
      src: scssImage
    },
  ]

  const achievements = [
    "Built 5+ full-stack web apps",
    "Optimized performance & UX",
    "Reusable component libraries",
    "Agile/SCRUM collaboration",
  ];

  const hobbies = [
    "Reading tech blogs",
    "Gaming & strategy",
    "Learning new frameworks",
    "Open-source contributions",
  ];

  useEffect(() => {
    gsap.from(leftRef.current, {
      scrollTrigger: { trigger: leftRef.current, start: "top 80%" },
      x: -50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      stagger: 0.2,
    });

    gsap.from(rightRef.current, {
      scrollTrigger: { trigger: rightRef.current, start: "top 80%" },
      x: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });
  }, []);

  return (
    <div id="about" className="relative min-h-screen w-full bg-[#030303] overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      <Particles className="absolute inset-0" quantity={100} ease={80} color="#ffffff" refresh />

      {/* Floating shapes */}
      <ElegantShape className="left-[-10%] top-[15%]" width={600} height={140} rotate={12} gradient="from-indigo-500/[0.15]" delay={0.3} />
      <ElegantShape className="right-[-5%] top-[70%]" width={500} height={120} rotate={-15} gradient="from-rose-500/[0.15]" delay={0.5} />
      <ElegantShape className="left-[5%] bottom-[5%]" width={300} height={80} rotate={-8} gradient="from-violet-500/[0.15]" delay={0.4} />
      <ElegantShape className="right-[15%] top-[10%]" width={200} height={60} rotate={20} gradient="from-amber-500/[0.15]" delay={0.6} />
      <ElegantShape className="left-[20%] top-[5%]" width={150} height={40} rotate={-25} gradient="from-cyan-500/[0.15]" delay={0.7} />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-start gap-12 py-12">
        {/* Left Details */}
        <div className="flex-1 space-y-8 text-white" ref={leftRef}>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <span className="text-4xl md:text-5xl font-bold tracking-tight">
              About Me
            </span>
          </motion.h1>

          {/* Skills */}
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">Skills</h2>
            {skills.map((skill, i) => (
              <div key={i} className="mb-3">
                <p className="text-white/70">{skill.name}</p>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    transition={{ duration: 1 + i * 0.2 }}
                    className="bg-indigo-500 h-3 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">Achievements</h2>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              {achievements.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>

          {/* Hobbies */}
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">Hobbies & Interests</h2>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              {hobbies.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </div>

        {/* Right Profile Card */}
        <div className="mt-20 flex justify-center md:w-1/3" ref={rightRef}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Profile Card */}
            <div className="w-64 md:w-72 rounded-3xl bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 backdrop-blur-xl border border-white/20 flex flex-col items-center shadow-2xl shadow-black/50 p-6">
              <img
                src={profilePic}
                alt="Hassan Ahmad"
                className="w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-indigo-500/40 object-cover"
              />

              <p className="mt-3 text-white/70 text-sm text-center">
                Frontend / MERN Stack Developer
              </p>
            </div>

            {/* 🔵 Radial Intro under profile */}
            <div className="relative scale-[0.85] md:scale-100">
              <RadialIntro orbitItems={ITEMS} />
            </div>
          </motion.div>
        </div>

      </div>

      {/* Bottom fade overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />

      {/* 🔹 Horizontal Scroll Text Section */}
      {/* <HorizontalScrollText /> */}
      <PinnedSkillsShowcase />
    </div>
  );
}
