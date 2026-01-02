"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download,
  ChevronRight,
  Zap,
  Activity,
  Layers,
  Trophy,
  GitCompare
} from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import Scene3D from "@/components/landing/Scene3D";

interface ReleaseInfo {
  version: string;
  downloadUrl: string;
}

export default function Page() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [release, setRelease] = useState<ReleaseInfo>({
    version: "Latest",
    downloadUrl: "https://github.com/hotlap-ai/releases/releases/latest"
  });

  useEffect(() => {
    fetch("https://api.github.com/repos/hotlap-ai/releases/releases/latest")
      .then(res => res.json())
      .then(data => {
        if (data.tag_name) {
          const exeAsset = data.assets?.find((a: { name: string }) =>
            a.name.endsWith("-setup.exe")
          );
          setRelease({
            version: data.tag_name,
            downloadUrl: exeAsset?.browser_download_url ||
              `https://github.com/hotlap-ai/releases/releases/tag/${data.tag_name}`
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-500">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
        style={{ scaleX }}
      />

      {/* 3D Background - Fixed */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <Scene3D />
      </div>

      <main className="relative z-10">
        <HeroSection release={release} />
        <ShowcaseSection />
        <FeaturesGrid />
        <PerformanceSection />
        <CtaSection downloadUrl={release.downloadUrl} />
        <Footer />
      </main>
    </div>
  );
}

function HeroSection({ release }: { release: ReleaseInfo }) {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-32 pb-20 overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-500 mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Zap className="w-3.5 h-3.5 mr-2 fill-amber-500" />
              PROFESSIONAL iRACING TELEMETRY
            </div>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 text-white"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            DATA DRIVEN <br />
            <span className="text-primary glow-text">
              DOMINATION
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            The modern, open-source telemetry analyzer for iRacing.
            <span className="text-amber-100/90 font-normal"> Completely free.</span>
          </motion.p>

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <a
              href={release.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="h-14 px-8 text-base bg-primary hover:bg-amber-400 text-black font-bold tracking-tight transition-all duration-300 rounded-md shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)]">
                <Download className="mr-2 w-5 h-5" />
                Download {release.version}
              </Button>
            </a>
          </motion.div>
        </div>

        {/* Dashboard Image Hero */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.4, type: "spring", bounce: 0.2 }}
          className="relative max-w-6xl mx-auto perspective-1000"
        >
          <div className="relative rounded-xl overflow-hidden border border-zinc-800 shadow-2xl shadow-amber-900/10 bg-zinc-950">
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 opacity-50" />
            <Image
              src="/app-dashboard.png"
              width={1920}
              height={1080}
              alt="Hotlap.ai Dashboard"
              className="w-full h-auto object-cover"
              priority
            />
          </div>
          {/* Glow beneath */}
          <div className="absolute -inset-10 bg-amber-500/10 blur-[100px] -z-10 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}

function ShowcaseSection() {
  return (
    <section className="py-32 relative bg-zinc-900/20 border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight leading-none">
              Precision <br />
              <span className="text-primary">Engineering</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              Built by sim racers, for sim racers. We focus on clean data visualization
              without the clutter. Compare laps, analyze inputs, and spot consistency
              issues instantly with our high-contrast, dark-mode optimized charts.
            </p>

            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
              {[
                "Real-time Telemetry Processing",
                "Automatic Session Library",
                "Delta Time Analysis",
                "Fuel & Tire Usage Calculator",
                "Sector-by-Sector Breakdown",
                "Input Trace Comparison"
              ].map((item, i) => (
                <div key={i} className="flex items-center text-zinc-300 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-purple-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <div className="relative rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950">
              <Image
                src="/app-telemetry.png"
                width={1920}
                height={1080}
                alt="Telemetry Analysis"
                className="w-full h-auto transform transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesGrid() {
  const features = [
    {
      title: "Smart Comparison",
      desc: "Auto-aligns laps for perfect comparison, even with different start lines.",
      icon: <GitCompare className="w-6 h-6 text-primary" />
    },
    {
      title: "Track Anatomy",
      desc: "Interactive maps with sectors, corners, and racing line overlays.",
      icon: <Layers className="w-6 h-6 text-primary" />
    },
    {
      title: "Consistency",
      desc: "Visualize your lap time spread and identify high-risk corners.",
      icon: <Activity className="w-6 h-6 text-primary" />
    },
    {
      title: "Leaderboards",
      desc: "Track local records per car/track combo automatically.",
      icon: <Trophy className="w-6 h-6 text-primary" />
    }
  ];

  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Complete Toolkit</h2>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Everything you need to go faster, packaged in a beautiful, high-performance desktop application.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-[#0A0A0A] border-zinc-800 hover:border-primary/50 transition-all duration-300 h-full group rounded-xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="mb-6 inline-flex p-3 bg-zinc-900 rounded-lg ring-1 ring-inset ring-zinc-800 group-hover:bg-primary/10 group-hover:ring-primary/20 transition-all duration-300">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-zinc-100 group-hover:text-primary transition-colors">{f.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PerformanceSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-zinc-900/30 border-y border-white/5">
      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-7xl font-bold mb-8 tracking-tight">
          <span className="text-white drop-shadow-2xl">
            LIGHTWEIGHT.
          </span>
          <br />
          <span className="text-zinc-600">FAST.</span>
        </h2>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-16">
          Built with optimized React components and a high-performance backend.
          Zero impact on your sim racing frame rates.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-16 md:gap-32 text-center">
          <div className="relative">
            <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-primary to-amber-900 mb-2">&lt;1%</div>
            <div className="text-sm text-zinc-500 uppercase tracking-widest font-bold">CPU Usage</div>
          </div>
          <div>
            <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-primary to-amber-900 mb-2">0ms</div>
            <div className="text-sm text-zinc-500 uppercase tracking-widest font-bold">Input Lag</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CtaSection({ downloadUrl }: { downloadUrl: string }) {
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="bg-[#0A0A0A] border border-zinc-800 p-12 md:p-24 rounded-3xl relative overflow-hidden text-center group">

          <div className="absolute top-0 right-0 p-40 bg-amber-500/5 blur-[120px] rounded-full group-hover:bg-amber-500/10 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 p-40 bg-amber-500/5 blur-[120px] rounded-full group-hover:bg-amber-500/10 transition-all duration-700" />

          <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10 text-white tracking-tight">
            Ready to <br />
            <span className="text-primary">Hit the Track?</span>
          </h2>

          <p className="text-xl text-zinc-400 mb-12 max-w-xl mx-auto relative z-10">
            Join the community of drivers improving their lap times with Hotlap.ai.
          </p>

          <div className="relative z-10 flex flex-col items-center gap-6">
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
              <Button className="h-16 px-12 text-lg bg-primary hover:bg-amber-400 text-black font-bold rounded-full shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:scale-105 transition-all duration-300">
                <Download className="mr-2 w-5 h-5" />
                Download Now
              </Button>
            </a>
            <p className="text-sm text-zinc-600 font-medium">
              Windows only (macOS & Linux coming soon)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 border-t border-zinc-900 bg-[#050505] text-center text-zinc-600 text-sm">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <p className="font-medium">&copy; {new Date().getFullYear()} Hotlap.ai. Built for Speed.</p>
        <div className="flex gap-8 mt-4 md:mt-0 font-medium">
          <a href="https://github.com/hotlap-ai/releases" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Github</a>
          <a href="#" className="hover:text-primary transition-colors">Discord</a>
          <a href="#" className="hover:text-primary transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  )
}
