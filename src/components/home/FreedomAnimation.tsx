"use client";

import React, { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import Image from "next/image";
import styles from "./FreedomAnimation.module.css";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function FreedomAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Move from right to left as we scroll down
  const x = useTransform(scrollYProgress, [0, 1], ["50%", "-50%"]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
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
    <div ref={containerRef} className={styles.horizontalWords}>
        
      <div className={styles.stickyContainer}>
        {/* Fixed Background inside Sticky Container */}
        <div className={styles.gradientOverlay} />
        <div className={styles.gridPattern} />
        
        <div className={styles.imageContainer}>
          <Image
            src={"/images/yc26t.png"}
            alt="Youth Sakthi 2026"
            width={1920}
            height={1080}
            className={styles.image}
            priority
          />
        </div>
        <motion.div style={{ x }} className={styles.horizontalRelative}>
          <span className={styles.teluguText}>స్వేచ్ఛ</span>
          <span className={styles.separator}>•</span>
          <h2 className={styles.h2}>FREEDOM</h2>
          <span className={styles.separator}>•</span>
          <span className={styles.teluguText}>సత్యం</span>
        </motion.div>

        <div className={styles.mobileCountdown}>
            <div className={styles.countdownItem}>
                <span className={styles.countdownValue}>{timeLeft.days.toString().padStart(2, '0')}</span>
                <span className={styles.countdownLabel}>DAYS</span>
            </div>
            <div className={styles.countdownSeparator}>:</div>
            <div className={styles.countdownItem}>
                <span className={styles.countdownValue}>{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className={styles.countdownLabel}>HRS</span>
            </div>
            <div className={styles.countdownSeparator}>:</div>
            <div className={styles.countdownItem}>
                <span className={styles.countdownValue}>{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className={styles.countdownLabel}>MIN</span>
            </div>
            <div className={styles.countdownSeparator}>:</div>
            <div className={styles.countdownItem}>
                <span className={styles.countdownValue}>{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <span className={styles.countdownLabel}>SEC</span>
            </div>
        </div>
      </div>
    </div>
  );
}
