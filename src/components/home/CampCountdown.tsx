"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CampCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Target: Jan 12, 2026, 7:30 PM
    const targetDate = new Date("2026-01-12T19:30:00");

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full py-12 overflow-hidden bg-[#B8282D] text-white hidden md:block">
       {/* Background Grid Pattern - No Gradient, just lines and dots */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        {/* Grid Lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            backgroundAttachment: "fixed",
          }}
        />
        {/* Dots Overlay */}
        <div 
            className="absolute inset-0" 
            style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1.5px, transparent 1.5px)',
                backgroundSize: '25px 25px',
                opacity: 0.5
            }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center">
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-8"
            >
                <h2 className="text-3xl md:text-5xl font-black mb-2 font-[DIN_Pro] capitalize tracking-tight leading-none drop-shadow-md">
                    Camp Starts In
                </h2>
                {/* <p className="text-xl md:text-2xl text-white/90 font-['Pacifico'] drop-shadow-sm">
                    Get ready for the glory!
                </p> */}
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="grid grid-cols-4 gap-3 md:gap-8 mb-10 w-full max-w-4xl"
            >
                <TimeUnit value={timeLeft.days} label="DAYS" />
                <TimeUnit value={timeLeft.hours} label="HOURS" />
                <TimeUnit value={timeLeft.minutes} label="MINS" />
                <TimeUnit value={timeLeft.seconds} label="SECS" />
            </motion.div>

            {/* Dates and Location Row */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 w-full max-w-5xl border-t border-white/30 pt-8"
            >
                {/* Dates */}
                <div className="flex items-center gap-4 text-left">
                    <div className="p-2.5 rounded-full border-2 border-white/40">
                        <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-0.5">Dates</p>
                        <p className="text-xl md:text-3xl font-[DIN_Pro] font-bold leading-none">Jan 12 - 15, 2026</p>
                    </div>
                </div>

                {/* Divider for desktop */}
                <div className="hidden md:block w-px h-12 bg-white/30"></div>

                {/* Location */}
                <div className="flex items-center gap-4 text-left">
                    <div className="p-2.5 rounded-full border-2 border-white/40">
                        <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-0.5">Location</p>
                        <p className="text-xl md:text-3xl font-[DIN_Pro] font-bold leading-none">Raj Pushpa Function Hall</p>
                        <p className="text-xs opacity-90 mt-0.5 font-medium">Kurnool, AP</p>
                    </div>
                </div>
            </motion.div>

        </div>
      </div>
    </section>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full flex items-center justify-center mb-1">
                <span className="text-4xl md:text-6xl lg:text-8xl font-black font-[DIN_Pro] tabular-nums leading-none tracking-tighter drop-shadow-sm">
                    {value.toString().padStart(2, '0')}
                </span>
            </div>
            <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase opacity-80">{label}</span>
        </div>
    )
}
