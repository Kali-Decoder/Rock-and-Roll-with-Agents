'use client';

import React, { useEffect, useState } from 'react';
import AnimatedNumbers from "react-animated-numbers";
import {
    Users,
    Dices,
    Coins,
    Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';


/* =============================
   Animated Number Component
============================= */
function AnimatedStat({ value, prefix = "", suffix = "", decimals = 0 }: any) {
    const num =
        typeof value === "string"
            ? parseFloat(value.replace(/,/g, "")) || 0
            : value || 0;

    const formattedValue = Number(num.toFixed(decimals));

    return (
        <span>
            {prefix}
            <AnimatedNumbers
                animateToNumber={formattedValue}
                transitions={(i) => ({
                    type: "spring",
                    duration: 0.5 + i * 0.1,
                })}
                fontStyle={{
                    fontSize: "inherit",
                    fontWeight: "inherit",
                    color: "inherit",
                }}
            />
            {suffix}
        </span>
    );
}


/* =============================
   Dummy Events
============================= */
const agents = ["agentA", "agentB", "agentC", "agentD"];

function randomEvent(id:number){
    const r = Math.random();

    if(r < 0.6){
        return {
            id,
            type:"roll",
            agentName: agents[Math.floor(Math.random()*agents.length)],
            amount:(Math.random()*5+1).toFixed(2),
            result: Math.random()>0.5 ? "win" : "not win",
            timestamp:new Date()
        };
    }

    if(r < 0.8){
        return { id, type:"poolStart", timestamp:new Date() };
    }

    return { id, type:"poolEnd", timestamp:new Date() };
}


/* =============================
   Main Component
============================= */
export function AgentStats() {

    const [events,setEvents] = useState<any[]>([]);
    const [summary,setSummary] = useState({
        totalPools:5,
        totalAgents:4,
        totalRewarded:120,
        totalDiceRolls:40
    });

    useEffect(()=>{
        let id=1;

        const timer=setInterval(()=>{
            const ev=randomEvent(id++);
            setEvents(e=>[ev,...e].slice(0,100));

            setSummary(s=>({
                ...s,
                totalDiceRolls:s.totalDiceRolls+1,
                totalRewarded:s.totalRewarded + Math.random()*2,
                totalAgents:s.totalAgents + (Math.random()>0.9?1:0)
            }));

        },3000);

        return ()=>clearInterval(timer);
    },[]);


    return (
        <div className="container pt-0 md:pt-8 pb-24 max-w-screen-2xl mx-auto px-4 md:px-16">

            <div className="flex flex-col lg:flex-row gap-6 min-h-screen">

                {/* LEFT SIDE → STATS (2 COLUMNS) */}
                <div className="w-full lg:w-[650px] shrink-0">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                        <StatCard
                            icon={<Layers className="w-5 h-5 text-blue-400" />}
                            title="Total Pools"
                            value={<AnimatedStat value={summary.totalPools} />}
                            subtitle="Pools Created"
                            color="text-blue-400"
                        />

                        <StatCard
                            icon={<Users className="w-5 h-5 text-emerald-400" />}
                            title="Total Agents"
                            value={<AnimatedStat value={summary.totalAgents} />}
                            subtitle="Active Bots"
                            color="text-emerald-400"
                        />

                        <StatCard
                            icon={<Coins className="w-5 h-5 text-yellow-400" />}
                            title="Total Rewarded"
                            value={<AnimatedStat value={summary.totalRewarded} prefix="$" />}
                            subtitle="BNB Paid Out"
                            color="text-yellow-400"
                        />

                        <StatCard
                            icon={<Dices className="w-5 h-5 text-purple-400" />}
                            title="Total Dice Rolls"
                            value={<AnimatedStat value={summary.totalDiceRolls} />}
                            subtitle="All Time Rolls"
                            color="text-purple-400"
                        />

                    </div>

                </div>


                {/* RIGHT SIDE → LIVE FEED */}
                <div className="flex-1 h-screen overflow-y-auto pr-4 space-y-2 text-sm font-medium">

                    {events.map(e=>(
                        <HistoryMessage key={e.id} event={e}/>
                    ))}

                </div>

            </div>
        </div>
    );
}


/* =============================
   History Message
============================= */
function HistoryMessage({ event }: any) {

    let content;

    if (event.type === "roll") {
        content = (
            <>
                <span className="text-white">{event.agentName}</span>{" "}
                rolls for{" "}
                <span className="text-yellow-400">{event.amount} BNB</span>{" "}
                —{" "}
                <span className={event.result === "win"
                    ? "text-emerald-400"
                    : "text-red-400"}>
                    {event.result}
                </span>
            </>
        );
    }
    else if (event.type === "poolStart") {
        content = <span className="text-blue-400">🚀 New pool started</span>;
    }
    else {
        content = <span className="text-orange-400">🏁 Pool ended</span>;
    }

    return (
        <div className="flex justify-end">
            <div className="text-right max-w-[80%]">

                <div className="font-medium">
                    {content}
                </div>

                <div className="text-xs text-muted-foreground">
                    {event.timestamp.toLocaleTimeString()}
                </div>

            </div>
        </div>
    );
}



/* =============================
   Stat Card (UNCHANGED UI)
============================= */
function StatCard({ icon, title, value, subtitle, color }: any) {
    return (
        <div className="group relative overflow-hidden rounded-[2rem] bg-[#0A0A0B] border border-white/10 p-6 md:p-8 hover:bg-white/[0.04] shadow-2xl">

            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    {icon}
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                    {title}
                </span>
            </div>

            <div className={cn("text-3xl md:text-5xl font-bold mb-2", color)}>
                {value}
            </div>

            <div className="text-xs uppercase tracking-widest text-muted-foreground/50">
                {subtitle}
            </div>
        </div>
    );
}
