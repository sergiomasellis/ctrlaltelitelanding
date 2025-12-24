"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { Card } from "@/components/ui/card";
import { useEffect, useState } from 'react';

export function TelemetryCharts() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        // Initial data
        const initialData = Array.from({ length: 50 }, (_, i) => ({
            time: i,
            speed: 100,
            throttle: 0,
            brake: 0,
            steer: 0
        }));
        setData(initialData);

        const interval = setInterval(() => {
            setData(prev => {
                const lastTime = prev[prev.length - 1].time;
                const newTime = lastTime + 1;

                // Simulate realistic racing patterns
                const phase = newTime / 20; // Slower oscillation
                const isBraking = Math.sin(phase) > 0.8;

                let newSpeed = prev[prev.length - 1].speed;
                let newThrottle = 0;
                let newBrake = 0;

                if (isBraking) {
                    newSpeed *= 0.95; // Decelerate
                    newBrake = 80 + Math.random() * 20;
                    newThrottle = 0;
                } else {
                    newSpeed = Math.min(newSpeed * 1.02, 320); // Accelerate with cap
                    if (newSpeed < 100) newSpeed = 100;
                    newThrottle = 90 + Math.random() * 10;
                    newBrake = 0;
                }

                const newItem = {
                    time: newTime,
                    speed: newSpeed + (Math.random() - 0.5) * 2,
                    throttle: newThrottle,
                    brake: newBrake,
                    steer: Math.sin(newTime / 10) * 45
                };

                return [...prev.slice(1), newItem];
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-1 gap-6 w-full">
            {/* Speed & Comparison - Hero Chart */}
            <Card className="p-6 bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <h3 className="text-sm font-mono text-cyan-500 tracking-widest">REAL-TIME TELEMETRY</h3>
                    </div>
                    <div className="text-xs font-mono text-white/50">LIVE SESSION: P1</div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <YAxis hide domain={[0, 350]} />
                            <Line
                                type="monotone"
                                dataKey="speed"
                                stroke="#06b6d4"
                                strokeWidth={3}
                                dot={false}
                                isAnimationActive={false} // Disable internal animation for smoother 'live' feel
                            />
                            <Area type="monotone" dataKey="speed" stroke="#06b6d4" fillOpacity={1} fill="url(#colorSpeed)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Secondary Inputs */}
            <div className="grid grid-cols-2 gap-6">
                <Card className="p-4 bg-black/40 backdrop-blur-xl border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-20">
                        <div className="text-6xl font-black text-white/10">01</div>
                    </div>
                    <h3 className="text-xs font-mono text-green-500 mb-2">THROTTLE INPUT</h3>
                    <div className="h-[120px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                <YAxis domain={[0, 100]} hide />
                                <Line type="stepAfter" dataKey="throttle" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-4 bg-black/40 backdrop-blur-xl border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-20">
                        <div className="text-6xl font-black text-white/10">02</div>
                    </div>
                    <h3 className="text-xs font-mono text-red-500 mb-2">BRAKE PRESSURE</h3>
                    <div className="h-[120px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                <YAxis domain={[0, 100]} hide />
                                <Line type="stepAfter" dataKey="brake" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}
