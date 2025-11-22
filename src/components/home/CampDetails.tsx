"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, BookOpen } from "lucide-react";

export default function CampDetails() {
  return (
    <section className="relative w-full py-20 overflow-hidden">
      {/* Background - Reverse Gradient of About Section (Light/Vibrant) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F58649] via-[#D84A3F] to-[#B8282D]" />
      
      {/* Overlay Pattern for Texture */}
      <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)`,
          }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
        >
            <h2 className="text-4xl md:text-6xl font-black text-white font-[DIN_Pro] uppercase tracking-tight drop-shadow-lg mb-4">
                Camp Details
            </h2>
            <div className="flex items-center justify-center gap-2 opacity-80">
                <div className="h-px w-12 bg-white"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                <div className="h-px w-12 bg-white"></div>
            </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Dates Card */}
            <DetailCard 
                icon={<Calendar className="w-8 h-8 text-[#B8282D]" />}
                title="Dates"
                titleTelugu="తేదీలు"
                content="Jan 12 - 15, 2026"
                subContent="Monday - Thursday"
                delay={0}
            />

            {/* Location Card */}
            <DetailCard 
                icon={<MapPin className="w-8 h-8 text-[#B8282D]" />}
                title="Location"
                titleTelugu="స్థలం"
                content="Raj Pushpa Function Hall"
                subContent="Kurnool, Andhra Pradesh"
                delay={0.1}
            />

            {/* Quiz Card */}
            <DetailCard 
                icon={<BookOpen className="w-8 h-8 text-[#B8282D]" />}
                title="Quiz Topic"
                titleTelugu="క్విజ్ అంశం"
                content="Gospel of John"
                subContent="యోహాను సువార్త"
                delay={0.2}
            />
        </div>
      </div>
    </section>
  );
}

interface DetailCardProps {
    icon: React.ReactNode;
    title: string;
    titleTelugu: string;
    content: string;
    subContent: string;
    delay: number;
}

function DetailCard({ icon, title, titleTelugu, content, subContent, delay }: DetailCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="relative group h-full"
        >
            <div className="h-full flex flex-col items-center text-center p-8 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-white uppercase tracking-widest font-[DIN_Pro]">{title}</h3>
                    <p className="text-sm text-white/70 font-['Anek_Telugu'] font-medium">{titleTelugu}</p>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    <p className="text-2xl md:text-3xl font-black text-white font-[DIN_Pro] leading-tight mb-2">
                        {content}
                    </p>
                    <p className="text-lg text-white/80 font-medium font-['Anek_Telugu']">
                        {subContent}
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
