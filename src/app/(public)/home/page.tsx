// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
'use client';

import React from 'react'
import Hero from '@/components/home/Hero'
import { About } from '@/components/ui/skiper30'
import YC26bgu from '@/components/home/unicorn/YC26bgu';
import YouthCamps from '@/components/home/YouthCamps';

// import Link from 'next/link'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const page = () => {
  return (
    <>
      {/* Hero Section */}
      <YC26bgu />
      <Hero />


      {/* About Section with Parallax Gallery */}
      <About />
      <YouthCamps />

 
    </>
  )
}

export default page

