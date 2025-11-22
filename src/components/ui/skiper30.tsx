"use client";

import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";
import YC26bgu from "../home/unicorn/YC26bgu";
import Hero from "@/components/home/Hero";
import YC26 from "@/components/home/YC26";

const images = [
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80",
  "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80",
  "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&q=80",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80",
  "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?w=800&q=80",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
  "https://images.unsplash.com/photo-1522158637959-30385a09e0da?w=800&q=80",
  "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80",
];

const About = () => {
  // Parallax gallery temporarily disabled
  // const gallery = useRef<HTMLDivElement>(null);
  // const [dimension, setDimension] = useState({ width: 0, height: 0 });

  // const { scrollYProgress } = useScroll({
  //   target: gallery,
  //   offset: ["start end", "end start"],
  // });

  // const { height } = dimension;
  // const isMobile = dimension.width < 768;
  
  // Responsive parallax values based on screen size
  // const y = useTransform(scrollYProgress, [0, 1], [0, isMobile ? height * 1 : height * 2]);
  // const y2 = useTransform(scrollYProgress, [0, 1], [0, isMobile ? height * 1.3 : height * 3.3]);
  // const y3 = useTransform(scrollYProgress, [0, 1], [0, isMobile ? height * 0.8 : height * 1.25]);
  // const y4 = useTransform(scrollYProgress, [0, 1], [0, isMobile ? height * 1.2 : height * 3]);

  // useEffect(() => {
  //   const lenis = new Lenis();

  //   const raf = (time: number) => {
  //     lenis.raf(time);
  //     requestAnimationFrame(raf);
  //   };

  //   const resize = () => {
  //     setDimension({ width: window.innerWidth, height: window.innerHeight });
  //   };

  //   window.addEventListener("resize", resize);
  //   requestAnimationFrame(raf);
  //   resize();

  //   return () => {
  //     window.removeEventListener("resize", resize);
  //     lenis.destroy();
  //   };
  // }, []);

  return (
    <section className="relative w-full text-foreground overflow-x-clip">
      {/* Vibrant gradient background matching poster - red to orange */}
      <div className="absolute inset-0 z-0">


        {/* Electrifying radial glow overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        
        {/* Additional depth with dark vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)]" />
      </div>

      {/* About content - no glass, direct text */}
      <div className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 py-24 text-center z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-[#B8282D] via-[#D84A3F] to-[#F58649]" />
        
        {/* Visible Premium Grid Pattern with electrifying effect */}
        <div className="absolute inset-0 opacity-40">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              maskImage: 'radial-gradient(ellipse at center, transparent 15%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.8) 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 15%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.8) 70%)'
            }}
          />
        </div>
        <div className="relative max-w-5xl mx-auto">
          
            
            <h2 className="relative text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              About YESCA
            </h2>
            <p className="relative text-base md:text-lg lg:text-xl text-white/95 leading-relaxed mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              Since 1994, Youth Evangelistic Soldiers of Christian Assemblies (YESCA)
              has been empowering young people to live out their faith boldly. Through
              annual camps, discipleship programs, and community building, we&apos;ve
              shaped thousands of youth into strong Christian leaders.
            </p>
            <p className="relative text-base md:text-lg lg:text-xl text-white/95 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              For 30 years, we&apos;ve created a space where youth can grow spiritually,
              build lasting friendships, and discover their purpose in Christ. Our mission
              is to equip the next generation with biblical truth, authentic faith, and
              a passion for serving God.
            </p>

            <span className="relative mt-12 inline-block text-xs uppercase tracking-wider text-white/70 after:absolute after:left-1/2 after:-translate-x-1/2 after:top-full after:mt-4 after:h-16 after:w-px after:bg-gradient-to-b after:from-white/50 after:to-transparent after:content-['']">
              scroll to explore
            </span>
        </div>
      </div>

      {/* Parallax Gallery - TEMPORARILY DISABLED */}
      {/* <div
        ref={gallery}
        className="relative box-border flex h-[100vh] md:h-[125vh] lg:h-[175vh] gap-[2vw] overflow-hidden bg-foreground p-[2vw] z-10"
      >
        <Column images={[images[0], images[1], images[2]]} y={y} />
        <Column images={[images[3], images[4], images[5]]} y={y2} />
        <Column images={[images[6], images[7], images[8]]} y={y3} />
        <Column images={[images[6], images[7], images[8]]} y={y4} />
      </div> */}

      {/* YC26 CTA Section */}
        <div className="absolute inset-0 z-0">


            {/* Electrifying radial glow overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_50%)]" />

            {/* Additional depth with dark vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)]" />
        </div>

        {/* About content - no glass, direct text */}
        <div className="relative flex flex-col items-center justify-center min-h-[90vh] text-center z-10">
            {/* Background removed from here to be added in FreedomAnimation */}
            <div className="relative w-screen">

                <YC26/>


            </div>
        </div>
    </section>
  );
};

type ColumnProps = {
  images: string[];
  y: MotionValue<number>;
};

const Column = ({ images, y }: ColumnProps) => {
  return (
    <motion.div
      className="relative flex h-full flex-col gap-[0.5vw]
      first:top-[-45%] md:w-1/4 md:min-w-[250px] w-1/2 min-w-[120px] sm:min-w-[180px]
      nth-2:top-[-95%] md:nth-2:top-[-95%]
      nth-3:top-[-45%] md:nth-3:top-[-45%]
      nth-4:top-[-75%] md:nth-4:top-[-75%]"
      style={{ y }}
    >
      {images.map((src, i) => (
        <div
          key={i}
          className="relative h-full w-full overflow-hidden rounded-lg md:rounded-2xl shadow-md md:shadow-lg"
        >
          <img
            src={src}
            alt={`yesca-youth-${i}`}
            className="pointer-events-none object-cover w-full h-full hover:scale-105 transition-transform duration-700"
          />
        </div>
      ))}
    </motion.div>
  );
};

export { About };
