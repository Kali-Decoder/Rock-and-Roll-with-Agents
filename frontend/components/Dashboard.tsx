'use client';

import { Card } from "@/components/ui/card"
import AnimatedNumbers from "react-animated-numbers";
import DiceAnimation from "@/components/DiceAnimation";
import { Users, Dice5, Coins, Timer } from "lucide-react";
import { useEffect, useState } from "react";

// Shared game state interface
interface GameEvent {
    id: number;
    type: 'roll' | 'poolStart' | 'poolEnd';
    agentName?: string;
    amount?: number;
    result?: 'win' | 'not win';
    timestamp: Date;
}

const AGENTS = ["agentA", "agentB", "agentC", "agentD"];

export function Dashboard() {
    function formatTime(sec: number) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    }

    /* ---- Shared Game State ----
       Stats and events are synced */
    const [agents, setAgents] = useState(12);
    const [rolls, setRolls] = useState(245);
    const [pool, setPool] = useState(31.42);
    const [timeLeft, setTimeLeft] = useState(3600); // seconds
    const [events, setEvents] = useState<GameEvent[]>([]);

    // Generate a random game event
    function generateEvent(id: number): GameEvent {
        const r = Math.random();

        if (r < 0.7) {
            // Roll event
            const agentName = AGENTS[Math.floor(Math.random() * AGENTS.length)];
            const amount = Number((Math.random() * 5 + 1).toFixed(2));
            const result = Math.random() > 0.5 ? 'win' : 'not win';
            
            return {
                id,
                type: 'roll',
                agentName,
                amount,
                result,
                timestamp: new Date()
            };
        }

        if (r < 0.85) {
            // Pool start event
            return {
                id,
                type: 'poolStart',
                timestamp: new Date()
            };
        }

        // Pool end event
        return {
            id,
            type: 'poolEnd',
            timestamp: new Date()
        };
    }

    // Process event and update stats
    function processEvent(event: GameEvent) {
        if (event.type === 'roll') {
            // Increment rolls count
            setRolls(r => r + 1);
            
            // Add roll amount to pool if win
            if (event.result === 'win' && event.amount) {
                setPool(p => Number((p + event.amount! * 0.1).toFixed(2)));
            }
            
            // Small chance to add agent
            if (Math.random() > 0.95) {
                setAgents(a => a + 1);
            }
        } else if (event.type === 'poolStart') {
            // Reset pool or add to it
            setPool(p => Number((p + Math.random() * 5).toFixed(2)));
        } else if (event.type === 'poolEnd') {
            // Pool ends, might reset or distribute
            // For now, just log it
        }
    }

    /* Unified live updates - syncs stats and events */
    useEffect(() => {
        let eventId = 1;

        // Generate events every 1-3 seconds (randomized for realism)
        const eventTimer = setInterval(() => {
            const event = generateEvent(eventId++);
            processEvent(event);
            setEvents(prev => [event, ...prev].slice(0, 6)); // Keep last 6 events
        }, 1000 + Math.random() * 2000); // Random interval between 1-3 seconds

        // Update timer every 10 seconds
        const timerUpdate = setInterval(() => {
            setTimeLeft(t => Math.max(t - 10, 0));
        }, 10000);

        return () => {
            clearInterval(eventTimer);
            clearInterval(timerUpdate);
        };
    }, []);
    return (
        <div className="container pt-0 md:pt-8 pb-24 space-y-8 max-w-screen-2xl mx-auto px-4 md:px-16">

            <div className="flex flex-col lg:flex-row gap-6">

                {/* LEFT CARDS */}
                <div className="flex flex-col gap-6 w-full lg:w-[360px] shrink-0 lg:sticky lg:top-20">

                    <StatCard title="Agents"
                        value={agents}
                        subtitle="Active Agents"
                        icon={<Users className="w-5 h-5 text-emerald-400" />}
                    />

                    <StatCard title="Dice Rolls"
                        value={rolls}
                        subtitle="Total Game Rolls"
                        icon={<Dice5 className="w-5 h-5 text-purple-400" />}
                    />

                    <StatCard title="Total Pool"
                        value={pool}
                        subtitle="BNB in Pool"
                        icon={<Coins className="w-5 h-5 text-yellow-400" />}
                    />

                    <StatCard
                        title="Ending Time"
                        value={formatTime(timeLeft)}
                        subtitle="Time Remaining"
                        icon={<Timer className="w-5 h-5 text-red-400" />}
                    />

                </div>

                {/* RIGHT SIDE → DICES */}
                <div className="flex-1">
                    <Card className="border-none shadow-none bg-transparent">
                        <DiceAnimation />
                    </Card>

                    <LiveActivity events={events} />   {/* 👈 floating popup - synced with stats */}
                </div>
            </div>
        </div>
    );
}


/* =============================
   Live Activity Component (Synced with Stats)
============================= */
interface LiveActivityProps {
    events: GameEvent[];
}

function LiveActivity({ events }: LiveActivityProps) {
    function formatEvent(event: GameEvent): string {
        if (event.type === 'roll') {
            return `${event.agentName} rolls ${event.amount} BNB — ${event.result}`;
        }
        if (event.type === 'poolStart') {
            return '🚀 New pool started';
        }
        return '🏁 Pool ended';
    }

    function formatMsg(text: string) {
        if (text.includes("not win"))
            return <span className="text-red-400">{text}</span>;

        if (text.includes("win"))
            return <span className="text-emerald-400">{text}</span>;

        if (text.includes("started"))
            return <span className="text-blue-400">{text}</span>;

        return <span className="text-orange-400">{text}</span>;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-1 text-sm font-medium text-right">
            {events.map(event => (
                <div
                    key={event.id}
                    className="animate-in slide-in-from-bottom-3 fade-in duration-300"
                >
                    {formatMsg(formatEvent(event))}
                </div>
            ))}
        </div>
    );
}


/* =============================
   Stat Card Component
============================= */
function StatCard({ title, value, subtitle, icon }: any) {

    const numericValue =
        typeof value === "string"
            ? parseFloat(value.replace(/,/g, "")) || 0
            : value || 0;

    return (
        <div className="group relative overflow-hidden rounded-[2rem] bg-[#0A0A0B] border border-white/10 p-6 md:p-8 transition-all hover:bg-white/[0.04] shadow-2xl">

            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    {icon}
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                    {title}
                </span>
            </div>

            <div className="text-3xl md:text-5xl font-bold text-white mb-2">
                <AnimatedNumbers
                    animateToNumber={numericValue}
                    transitions={(i) => ({
                        type: "spring",
                        duration: 0.6 + i * 0.1
                    })}
                    fontStyle={{
                        fontSize: "inherit",
                        fontWeight: "inherit",
                        color: "inherit"
                    }}
                />
            </div>

            <div className="text-xs uppercase tracking-widest text-muted-foreground/50">
                {subtitle}
            </div>
        </div>
    );
}

