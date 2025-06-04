"use client";
import { useState } from "react";
import useSWR from "swr";
import DashboardShell from "../../components/DashboardShell";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/Calendar";
import { Slider } from "@/components/ui/Slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { BadgeCheck } from "lucide-react";

const fetcher = (url:string)=>fetch(url).then(r=>r.json());

const PRESETS=["Fatigue","Brain fog","Headache","Digestive upset","Joint pain","Anxiety","Sleep quality","Mood","Focus"] as const;

export default function SymptomPage(){
  const { data, mutate } = useSWR("/api/symptom-log", fetcher);
  const [logDate,setLogDate]=useState<Date>(new Date());
  const [selected,setSelected]=useState<Record<string,number>>({});
  const [note,setNote]=useState("");
  const [addingCustom,setAddingCustom]=useState(false);
  const [customName,setCustomName]=useState("");

  const disabled = Object.keys(selected).length===0;
  const save = async()=>{
    if(disabled) return;
    await fetch("/api/symptom-log",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        date: logDate.toISOString(),
        symptoms: selected,
        note
      })
    });
    setSelected({});
    setNote("");
    mutate();
  };

  return (
    <DashboardShell>
      <div className="container mx-auto lg:grid lg:grid-cols-[1fr_320px] gap-10 pb-16">
        {/* left */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-6 mt-8">
          <h1 className="text-2xl font-semibold">Symptom Tracker</h1>
          <div className="flex items-center gap-4 mb-4">
            {/* date popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">{format(logDate,"PP")} ▾</Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Calendar mode="single" selected={logDate} onSelect={(d:Date)=>d&&setLogDate(d)} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* custom add */}
            {addingCustom ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={customName}
                  onChange={e=>setCustomName(e.target.value)}
                  onKeyDown={e=>{
                    if(e.key==="Enter" && customName.trim()){
                      setSelected(p=>({...p,[customName.trim()]:3}));
                      setCustomName("");
                      setAddingCustom(false);
                    } else if(e.key==="Escape"){setAddingCustom(false);setCustomName("");}
                  }}
                  placeholder="Symptom name"
                  className="px-3 py-1 rounded-full text-sm border focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <button onClick={()=>{
                  if(customName.trim()){
                    setSelected(p=>({...p,[customName.trim()]:3}));
                    setCustomName("");
                  }
                  setAddingCustom(false);
                }} className="text-purple-600 hover:text-purple-800 text-sm font-medium">Add</button>
                <button onClick={()=>{setAddingCustom(false);setCustomName("");}} className="text-gray-400 hover:text-gray-600 text-sm">Cancel</button>
              </div>
            ) : (
              <button
                onClick={()=>setAddingCustom(true)}
                className="px-3 py-1 rounded-full text-sm border border-dashed hover:border-purple-500 hover:text-purple-600 transition-colors"
              >+ Custom</button>
            )}
            {/* preset chips */}
            {PRESETS.map(label=>{
              const active=label in selected;
              return <button key={label} aria-pressed={active} onClick={()=>{
                setSelected(prev=>{
                  const copy={...prev};
                  active?delete copy[label]:copy[label]=3;
                  return copy;
                });
              }} className={`px-3 py-1 rounded-full text-sm border transition ${active?"bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent shadow":"hover:bg-gray-100"}`}>{label}</button>
            })}
          </div>

          {Object.entries(selected).map(([label,val])=> (
            <div key={label} className="flex items-center gap-4">
              <span className="w-32 text-sm text-gray-500">{label}</span>
              <Slider min={1} max={5} step={1} value={[val]} onValueChange={(v:number[])=>setSelected(p=>({...p,[label]:v[0]}))} />
              <span className="w-5 text-xs">{val}</span>
            </div>
          ))}

          <Textarea placeholder="Other notes…" value={note} onChange={e=>setNote(e.target.value)} />

          <Button disabled={disabled} onClick={save} className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"><BadgeCheck size={16} className="mr-2"/>Save log</Button>
        </div>

        {/* right */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm mt-8 lg:mt-8 lg:ml-0">
          <h2 className="text-lg font-semibold mb-4">Recent logs</h2>
          <ul className="space-y-2 text-sm">
            {data?.logs?.map((l:any)=> (
              <li key={l.id} className="flex justify-between border-b pb-1"><span className={`${l.positive?"text-green-600":"text-red-600"}`}>{l.name} {l.severity&&`(${l.severity}/5)`}</span><span className="text-xs">{new Date(l.logged_at).toLocaleDateString()}</span></li>
            )) || <p className="text-gray-500 text-xs">No logs yet.</p>}
          </ul>
        </div>
      </div>
    </DashboardShell>
  );
} 