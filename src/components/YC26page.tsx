'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { SparklesCore } from "@/components/ui/sparkles";
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Calendar, MapPin, BookOpen } from 'lucide-react';
import Link from "next/link";

interface TimeLeft {
    days: number
    hours: number
    minutes: number
    seconds: number
}

const YC26Page = () => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    useEffect(() => {
        const calculateTimeLeft = () => {
            const campDate = new Date('2026-01-12T00:00:00')
            const now = new Date()
            const difference = campDate.getTime() - now.getTime()

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                })
            }
        }

        const timer = setInterval(calculateTimeLeft, 1000)
        calculateTimeLeft()

        return () => clearInterval(timer)
    }, [])

    const timeUnits = [
        { label: 'DAYS', value: timeLeft.days },
        { label: 'HOURS', value: timeLeft.hours },
        { label: 'MINUTES', value: timeLeft.minutes },
        { label: 'SECONDS', value: timeLeft.seconds }
    ]
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#C84037] via-[#E67E3A] to-[#F5A623]">
            {/* Triangle Image at top-left (0,0) */}
            <div className="absolute top-0 left-0 w-full lg:-mt-12 max-md:scale-150 max-md:mt-16">
                <Image 
                    src={"/images/yc26_top.png"} 
                    alt="Youth Sakthi 2026" 
                    width={1920}
                    height={1080}
                    className="w-full h-full"
                    priority
                />
                
                {/* Overlayed Text on Image */}
                <div className="absolute top-2 left-0 right-0 text-center z-20 px-4 md:top-16">
                    <h1 className="text-[#d1d1d1] text-[9px] md:text-xl lg:text-2xl font-normal tracking-wide drop-shadow-lg">
                        Youth Evangelistic Soldiers of Christian Assemblies
                    </h1>
                </div>
            </div>

            {/* Content Below Image */}
            <div className="relative z-10 pt-[40vh] md:pt-[70vh] lg:pt-[70vh] flex flex-col items-center px-4 pb-12">
                
                {/* Countdown Timer */}
                <div className="w-full max-w-4xl mx-auto mb-8 ">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="grid grid-cols-4 md:grid-cols-4 gap-4 max-md:gap-2 px-2"
                    >
                        {timeUnits.map((unit, index) => (
                            <motion.div
                                key={unit.label}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                            >
                                <Card className="relative overflow-hidden bg-[#C84037] border-[#FFD700] border-2">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.02, 1],
                                            transition: { duration: 1, repeat: Infinity }
                                        }}
                                        className="p-6 text-center"
                                    >
                                        <span className="block text-4xl md:text-5xl font-bold text-[#FFD700] font-mono tabular-nums">
                                            {unit.value.toString().padStart(2, '0')}
                                        </span>
                                        <span className="text-xs md:text-sm text-[#FFD700]/80 font-semibold tracking-wider">
                                            {unit.label}
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#8B1A1A]/50 to-transparent pointer-events-none" />
                                    </motion.div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Registration Starting Soon - Animated */}
                <div className="mb-12 text-center">
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white animate-pulse">
                        Registration Starting Soon
                    </h2>
                    <p className="text-2xl md:text-4xl font-bold text-[#FFD700] mt-4 animate-pulse">
                        రిజిస్ట్రేషన్ త్వరలో ప్రారంభమవుతుంది
                    </p>
                </div>



                                {/* Theme Section with Sparkles */}
                <div className="w-full bg-transparent -mx-4 px-4">

                          <h2 className="text-3xl md:text-4xl font-bold text-[#FFD700] text-center ">
                            THEME
                        </h2>
                    <div className="max-w-4xl mx-auto">
                        <div className="w-full h-40 relative ">
                            {/* Gradients */}
                            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent h-[2px] w-3/4 blur-sm"/>
                            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent h-px w-3/4"/>
                            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent h-[5px] w-1/4 blur-sm"/>
                            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent h-px w-1/4"/>

                            {/* Core component */}
                            <SparklesCore
                                background="transparent"
                                minSize={0.4}
                                maxSize={1}
                                particleDensity={1200}
                                className="w-full h-full"
                                particleColor="#FFD700"
                            />

                            <div className="absolute inset-0 w-full h-4/5 [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
                        </div>
                        
                  
                        
                        {/* Theme Title Image */}
                        <div className="flex justify-center items-center -mt-44">
                            <Image 
                                src="/images/yc26_title.png"
                                alt="YC26 Theme"
                                width={800}
                                height={400}
                                className="w-full max-w-2xl h-auto"
                            />
                        </div>
                    </div>
                </div>

                {/* Camp Details Section - Glassmorphism Professional Design */}
                <div className="w-full max-w-6xl mt-16 mb-12 px-4">
                    
                    {/* Combined Dates and Place in Grid Layout */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8 max-md:max-w-md max-md:mx-auto">
                        
                        {/* Camp Dates - Glassmorphism Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/15 h-full flex flex-col">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="text-sm font-semibold text-[#FFD700] uppercase tracking-wider mb-1">Camp Dates</p>
                                        <p className="text-xs font-medium text-white/60">తేదీలు</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                
                                <div className="text-center py-6 flex-1 flex flex-col justify-center">
                                    <p className="text-6xl md:text-7xl font-black text-white mb-2 tracking-tight">
                                        12-15
                                    </p>
                                    <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent mx-auto my-4"></div>
                                    <p className="text-2xl md:text-3xl font-bold text-[#FFD700]">
                                        జనవరి 2026
                                    </p>
                                    <p className="text-lg md:text-xl font-medium text-white/80 mt-1">
                                        January 2026
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Camp Place - Glassmorphism Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="relative"
                        >
                            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/15 h-full flex flex-col">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="text-sm font-semibold text-[#FFD700] uppercase tracking-wider mb-1">Venue</p>
                                        <p className="text-xs font-medium text-white/60">స్థలం</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                
                                <div className="space-y-3 flex-1 flex flex-col justify-center">
                                    <p className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                        Raj Pushpa Function Hall
                                    </p>
                                    <div className="h-px w-16 bg-gradient-to-r from-[#FFD700] to-transparent"></div>
                                    <p className="text-xl md:text-2xl font-semibold text-[#FFD700]">
                                        Kurnool
                                    </p>
                                    <p className="text-lg md:text-xl font-medium text-white/80">
                                        రాజ్ పుష్ప ఫంక్షన్ హాల్, కర్నూల్
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Quiz Section - Glassmorphism Full Width Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative max-md:max-w-md max-md:mx-auto"
                    >
                        <div className="backdrop-blur-xl bg-gradient-to-r from-white/15 via-white/10 to-white/15 rounded-3xl p-10 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center">
                                        <BookOpen className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#FFD700] uppercase tracking-wider">Quiz Topic</p>
                                        <p className="text-xs font-medium text-white/60">క్విజ్ అంశం</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center space-y-6">
                                <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
                                    <p className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
                                        యోహాను సువార్త
                                    </p>
                                </div>
                                <div className="flex items-center justify-center gap-4">
                                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#FFD700]"></div>
                                    <p className="text-2xl md:text-4xl font-bold text-[#FFD700]">
                                        Gospel of John
                                    </p>
                                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#FFD700]"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Contact Section */}
                <div className="w-full max-w-4xl mt-12 text-center">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 border-[#FFD700]">
                        <p className="text-xl md:text-2xl text-white mb-3">
                            For more details / వివరములకు:
                        </p>
                        <p className="text-2xl md:text-3xl font-bold text-[#FFD700] mb-2">
                            +91 9177898146
                        </p>
                        <p className="text-xl md:text-2xl text-white">
                            yescateam.com
                        </p>
                    </div>
                </div>

                {/* Registration Pricing Section */}
                <div className="w-full mt-20">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-6xl font-black text-white mb-4 text-center"
                    >
                        Registration Pricing
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-xl md:text-2xl text-white/90 mb-12 text-center"
                    >
                        రిజిస్ట్రేషన్ ధరలు
                    </motion.p>

                    {/* Pricing Cards */}
                    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 mb-12 px-4">
                        {[
                            {
                                name: 'Normal Registration',
                                nameTelugu: 'ఒక్కరి రిజిస్ట్రేషన్ ఫీజ్',
                                price: '300',
                                description: 'Click the button below',
                                descriptionTelugu: 'ఈ క్రింది బటన్ క్లిక్ చేయండి',
                                color: 'from-[#C84037] to-[#E67E3A]',
                                borderColor: 'border-[#FFD700]'
                            },
                            {
                                name: 'Kids Registration',
                                nameTelugu: 'కిడ్స్ రిజిస్ట్రేషన్ ఫీజ్',
                                price: '100',
                                description: 'Click the button below',
                                descriptionTelugu: 'ఈ క్రింది బటన్ క్లిక్ చేయండి',
                                color: 'from-[#E67E3A] to-[#F5A623]',
                                borderColor: 'border-[#FFD700]'
                            },
                            {
                                name: 'Faithbox Registration',
                                nameTelugu: 'ఫెయిత్ బాక్స్ కలిగిన వారి రిజిస్ట్రేషన్ ఫీజ్',
                                price: '50',
                                description: 'Click the button below',
                                descriptionTelugu: 'ఈ క్రింది బటన్ క్లిక్ చేయండి',
                                color: 'from-[#F5A623] to-[#FFA500]',
                                borderColor: 'border-[#FFD700]'
                            }
                        ].map((plan, index) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="relative"
                            >
                                <div className={`backdrop-blur-xl bg-white/10 rounded-3xl p-8 border-2 ${plan.borderColor} shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 h-full flex flex-col`}>
                                    {/* Plan Name */}
                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
                                        {plan.name}
                                    </h3>
                                    <p className="text-lg md:text-xl font-semibold text-white/80 mb-4 text-center">
                                        {plan.nameTelugu}
                                    </p>

                                    {/* Price */}
                                    <div className="text-center mb-6 flex-1 flex flex-col justify-center">
                                        <div className="flex items-center justify-center">
                                            <span className="text-5xl md:text-6xl font-black text-[#FFD700]">
                                                ₹{plan.price}
                                            </span>
                                        </div>
                                        <p className="text-white/70 mt-4">{plan.description}</p>
                                        <p className="text-white/70">{plan.descriptionTelugu}</p>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#FFD700] to-transparent mb-6"></div>

                                    {/* Register Button */}
                                    <div className={`w-full bg-gradient-to-r ${plan.color} text-white font-bold py-4 px-6 rounded-xl text-center text-lg shadow-lg cursor-not-allowed opacity-75`}>
                                        Registration Opens Soon
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Important Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="max-w-4xl mx-auto backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 mb-12"
                    >
                        <h3 className="text-2xl font-bold text-[#FFD700] mb-4 text-center">Important Information</h3>
                        <ul className="space-y-3 text-white text-lg">
                            <li className="flex items-start gap-3">
                                <span className="text-[#FFD700]">•</span>
                                <span>Registration fees are non-refundable</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#FFD700]">•</span>
                                <span>For queries, contact: +91 9177898146</span>
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* Footer with YC26 Theme Colors */}
            <footer className="relative z-10 bg-gradient-to-b from-[#8B1A1A] to-[#C84037] text-white py-10 mt-16">
                <div className="container mx-auto px-16 max-md:px-6">
                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* About Section */}
                        <div>
                            <h4 className="text-xl font-bold mb-4 text-[#FFD700]">About Youth Camp 2026</h4>
                            <p className="text-xl leading-relaxed">
                                Join us for <span className="font-semibold text-[#FFD700]">Youth Camp 2026</span>, a camp filled with worship, activities, and unforgettable memories.
                            </p>
                        </div>

                        {/* Contact Section */}
                        <div className="text-lg">
                            <h4 className="text-xl font-bold mb-4 text-[#FFD700]">Contact Information</h4>
                            <ul className="space-y-3">
                                <li>YOUTH EVANGELICAL SOLDIERS OF CHRISTIAN ASSEMBLIES</li>
                                <li className="text-lg">
                                    <strong>Address:</strong> Nandikotkur, Kurnool District, <br/>Andhra Pradesh - 518401
                                </li>
                                <li className="text-lg">
                                    <strong>Phone:</strong> <a href="tel:+919177898146" className="text-[#FFD700] hover:underline">+91 91778 98146, 89850 32133</a>
                                </li>
                                <li className="text-lg">
                                    <strong>Email:</strong>{" "}
                                    <Link href="mailto:info@yescateam.com" className="text-[#FFD700] hover:underline">
                                        info@yescateam.com
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Quick Links */}
                        <div className="lg:pl-24">
                            <h4 className="text-xl font-bold mb-4 text-[#FFD700]">Quick Links</h4>
                            <ul className="space-y-3 text-lg">
                                <li>
                                    <Link href="/about" className="text-[#FFD700] hover:text-[#FFA500] transition-colors duration-200">
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/pricing" className="text-[#FFD700] hover:text-[#FFA500] transition-colors duration-200">
                                        Registration Pricing
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-[#FFD700] hover:text-[#FFA500] transition-colors duration-200">
                                        Contact Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/privacy-policy" className="text-[#FFD700] hover:text-[#FFA500] transition-colors duration-200">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms-and-conditions" className="text-[#FFD700] hover:text-[#FFA500] transition-colors duration-200">
                                        Terms and Conditions
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Divider and Bottom Section */}
                    <div className="mt-10 border-t border-[#E67E3A] pt-6 text-center">
                        <p className="text-sm">
                            &copy; 2025 Yesca Team. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default YC26Page;
