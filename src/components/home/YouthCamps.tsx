// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function YouthCamps() {
  const [active, setActive] = useState(2); // 0..3

  const prev = () => setActive((i) => (i - 1 + 4) % 4);
  const next = () => setActive((i) => (i + 1) % 4);

  return (
    <section className="relative w-full py-16 md:py-24 bg-gradient-to-b from-[#FAF7F5] via-[#FFF1E1] to-white">
      <div className="mx-auto max-w-[1400px] px-4">
        <header className="text-center mb-10 md:mb-14">
          <h2 className="font-geist text-4xl md:text-5xl lg:text-6xl font-bold text-[#6B2429]">
            YESCA Youth Camps
          </h2>
          <p className="mt-3 text-[#8A1B1B]/70">Building Faith Year After Year</p>
        </header>

        {/* NEW: viewport padding 15% = equal 15% peeks on both sides */}
        <div className="relative overflow-hidden px-[15%]">
          {/* equal edge fades (also 15%) */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[15%] bg-gradient-to-l from-white to-transparent" />

          {/* Track: each card = 70% of viewport; gap accounted in transform */}
          <div
            className="flex items-stretch gap-6 will-change-transform transition-transform duration-500 ease-out"
            style={
              {
                ['--shift' as any]: String(-active),
                ['--card' as any]: '70%',   // <— changed from 80%
                ['--gap' as any]: '1.5rem',
                transform: 'translateX(calc(var(--shift) * (var(--card) + var(--gap))))',
              } as React.CSSProperties
            }
          >
            <YC23 active={active === 0} />
            <YC24 active={active === 1} />
            <YC25 active={active === 2} />
            <YC26 active={active === 3} />
          </div>

          {/* controls */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setActive((i) => (i - 1 + 4) % 4)}
              aria-label="Previous"
              className="h-11 w-11 rounded-full bg-[#6B2429] text-white grid place-items-center shadow-lg hover:bg-[#8A1B1B] transition"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Go to ${i + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    active === i
                      ? 'bg-[#6B2429] scale-125'
                      : 'bg-[#6B2429]/30 hover:bg-[#6B2429]/60'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setActive((i) => (i + 1) % 4)}
              aria-label="Next"
              className="h-11 w-11 rounded-full bg-[#6B2429] text-white grid place-items-center shadow-lg hover:bg-[#8A1B1B] transition"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Shared card shell (unchanged except scale on inactive = 0.95) ---------- */
function Shell({
  active,
  bg,
  logo,
  title,
  sub,
  actions,
}: {
  active: boolean;
  bg: string;
  logo: string;
  title: string;
  sub: string;
  actions: React.ReactNode;
}) {
  return (
    <article
      className={[
        'relative shrink-0 basis-[70%] rounded-3xl overflow-hidden', // <— card width 70%
        'ring-1 ring-white/15 shadow-xl transition-all duration-300',
        active ? 'scale-100 opacity-100' : 'scale-[0.95] opacity-80', // <— 95% scale for non-active
      ].join(' ')}
    >
      <div className={`absolute inset-0 ${bg}`} />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-white/10" />
      <div className="relative z-[1] flex h-full flex-col p-6 md:p-8 lg:p-10">
        {/* logo on top */}
        <div className="mb-5 md:mb-6">
          <div className="relative h-20 md:h-24 lg:h-28 w-64 max-w-full">
            <Image
              src={logo}
              alt="camp logo"
              fill
              className="object-contain drop-shadow-2xl"
              sizes="(max-width:768px) 16rem, 20rem"
              priority={active}
            />
          </div>
        </div>

        <div className="text-white">
          <h3 className={active ? 'text-3xl md:text-4xl lg:text-5xl font-geist font-bold leading-tight drop-shadow-md' : 'text-2xl md:text-3xl font-geist font-bold leading-tight drop-shadow-md'}>
            {title}
          </h3>
          <p className={active ? 'mt-1 md:mt-2 text-white/90' : 'mt-0.5 text-white/80'}>{sub}</p>
        </div>

        <div className="mt-auto pt-5">{actions}</div>
      </div>
    </article>
  );
}

/* ---------- Individual cards (still hand-coded) ---------- */
function YC23({ active }: { active: boolean }) {
  return (
    <Shell
      active={active}
      bg="bg-[#FFD84B]"
      logo="/camps/YC23_titleE.png"
      title="Faith in Action"
      sub="నమ్మకముతో జీవితం"
      actions={
        <div className="flex gap-3">
          <a href="/camps/yc23/messages" className="px-5 py-2.5 rounded-xl font-semibold bg-white text-[#6B2429] hover:bg-white/90 shadow-md hover:shadow-lg transition">Listen Messages</a>
          <a href="/camps/yc23/gallery" className="px-5 py-2.5 rounded-xl font-semibold border-2 border-white/90 text-white hover:bg-white/10 shadow-md hover:shadow-lg transition">View Gallery</a>
        </div>
      }
    />
  );
}
function YC24({ active }: { active: boolean }) {
  return (
    <Shell
      active={active}
      bg="bg-[#FF9A3C]"
      logo="/camps/YC24_titleE.png"
      title="Live and Serve for Christ"
      sub="క్రీస్తుకై జీవితం"
      actions={
        <div className="flex gap-3">
          <a href="/camps/yc24/messages" className="px-5 py-2.5 rounded-xl font-semibold bg-white text-[#6B2429] hover:bg-white/90 shadow-md hover:shadow-lg transition">Listen Messages</a>
          <a href="/camps/yc24/gallery" className="px-5 py-2.5 rounded-xl font-semibold border-2 border-white/90 text-white hover:bg-white/10 shadow-md hover:shadow-lg transition">View Gallery</a>
        </div>
      }
    />
  );
}
function YC25({ active }: { active: boolean }) {
  return (
    <Shell
      active={active}
      bg="bg-[#4B1D4A]"
      logo="/camps/YC25_titleE.png"
      title="Excellence"
      sub="శ్రేష్టమైన జీవితం"
      actions={
        <div className="flex gap-3">
          <a href="/camps/yc25/messages" className="px-5 py-2.5 rounded-xl font-semibold bg-white text-[#6B2429] hover:bg-white/90 shadow-md hover:shadow-lg transition">See Messages</a>
          <a href="/camps/yc25/gallery" className="px-5 py-2.5 rounded-xl font-semibold border-2 border-white/90 text-white hover:bg-white/10 shadow-md hover:shadow-lg transition">Gallery</a>
        </div>
      }
    />
  );
}
function YC26({ active }: { active: boolean }) {
  return (
    <Shell
      active={active}
      bg="bg-gradient-to-br from-[#B43222] to-[#FF5C33]"
      logo="/camps/YC26_titleE.png"
      title="Freedom"
      sub="సత్యము స్వేచ్చ"
      actions={
        <div className="flex gap-3">
          <a href="/register" className="px-5 py-2.5 rounded-xl font-semibold bg-white text-[#6B2429] hover:bg-white/90 shadow-md hover:shadow-lg transition">Register</a>
          <a href="/donate" className="px-5 py-2.5 rounded-xl font-semibold border-2 border-white/90 text-white hover:bg-white/10 shadow-md hover:shadow-lg transition">Contribute</a>
        </div>
      }
    />
  );
}
