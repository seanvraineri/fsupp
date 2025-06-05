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
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { BadgeCheck, CalendarDays, PlusCircle, X } from "lucide-react";

const fetcher = (url:string)=>fetch(url).then(r=>r.json());

const PRESETS=["Fatigue","Brain fog","Headache","Digestive upset","Joint pain","Anxiety","Sleep quality","Mood","Focus"] as const;

// Define an interface for a single symptom log entry
interface SymptomLog {
  id: string; 
  logged_at: string; // Changed from 'date' to 'logged_at'
  symptoms: Record<string, number>;
  note?: string; 
}

// Define the expected shape of the API response for useSWR
interface SymptomLogResponse {
  logs: SymptomLog[];
}

export default function SymptomPage(){
  // Provide the explicit type to useSWR
  const { data, mutate } = useSWR<SymptomLogResponse>("/api/symptom-log", fetcher);
  const [logDate,setLogDate]=useState<Date>(new Date());
  const [selected,setSelected]=useState<Record<string,number>>({});
  const [note,setNote]=useState("");
  const [addingCustom,setAddingCustom]=useState(false);
  const [customName,setCustomName]=useState("");

  const disabled = Object.keys(selected).length===0 && !note.trim();
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
    setAddingCustom(false);
    setCustomName("");
    mutate();
  };

  // Logging for the button display
  console.log("[SymptomPage Render] logDate from state:", logDate.toString(), "| ISO:", logDate.toISOString());
  const formattedButtonDate = format(logDate, "PP");
  console.log("[SymptomPage Render] formattedButtonDate for button:", formattedButtonDate);

  return (
    <DashboardShell>
      <div className="container mx-auto lg:grid lg:grid-cols-[1fr_350px] gap-8 py-8">
        {/* left column - Symptom Logging Card */}
        <Card className="flex flex-col">
          <div className="p-6">
            <h2 className="text-2xl font-semibold tracking-tight">Daily Symptom Log</h2>
            <div className="flex items-center pt-2 text-sm text-muted-foreground">
              Logging for:
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2 font-normal h-8">
                    <CalendarDays size={16} className="mr-2" />
                    {formattedButtonDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="start" sideOffset={8}>
                  <Calendar 
                    mode="single" 
                    selected={logDate} 
                    onSelect={(day: Date | undefined) => {
                      if (day) {
                        console.log("[Calendar onSelect] day received:", day.toString(), "| ISO:", day.toISOString());
                        setLogDate(day);
                      }
                    }} 
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="p-6 pt-0 space-y-6 flex-grow">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">Select symptoms:</h3>
              <div className="flex flex-wrap gap-2 items-center">
                {PRESETS.map(label=>{
                  const active=label in selected;
                  return (
                    <button
                      key={label}
                      onClick={()=>{
                        setSelected(prev=>{
                          const copy={...prev};
                          active?delete copy[label]:copy[label]=3;
                          return copy;
                        });
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-500 ${active ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      {label}
                    </button>
                  );
                })}
                {addingCustom ? (
                  <div className="flex items-center gap-2 p-1.5 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <Input
                      type="text"
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
                      className="h-8 text-sm focus-visible:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <Button variant="ghost" size="sm" className="px-3 h-8 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300" onClick={()=>{
                      if(customName.trim()){
                        setSelected(p=>({...p,[customName.trim()]:3}));
                        setCustomName("");
                      }
                      setAddingCustom(false);
                    }}>Add</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={()=>{setAddingCustom(false);setCustomName("");}}>
                      <X size={16} />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={()=>setAddingCustom(true)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-purple-500 hover:text-purple-600 dark:hover:border-purple-400 dark:hover:text-purple-400 transition-colors hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-500"
                  >
                    <PlusCircle size={14} className="mr-1.5 inline-block" /> Custom
                  </button>
                )}
              </div>
            </div>

            {Object.keys(selected).length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Rate severity (1-5):</h3>
                {Object.entries(selected).map(([label,val])=> (
                  <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate pr-2" title={label}>{label}</span>
                     <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 w-4 text-center">{val}</span>
                    <Slider min={1} max={5} step={1} value={[val]} onValueChange={(v:number[])=>setSelected(p=>({...p,[label]:v[0]}))} />
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes:</h3>
              <Textarea placeholder="Any other notes, observations, or potential triggers..." value={note} onChange={e=>setNote(e.target.value)} rows={4} className="dark:bg-gray-800/50 dark:border-gray-700" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <Button disabled={disabled} onClick={save} className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white">
              <BadgeCheck size={18} className="mr-2"/>Save Log
            </Button>
          </div>
        </Card>

        {/* right column - Recent Logs Card */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold tracking-tight">Recent Logs</h2>
          </div>
          <div className="p-6 pt-0">
            {data?.logs && data.logs.length > 0 ? (
              <ul className="space-y-3">
                {data.logs.map((l: SymptomLog)=> {
                  const mainSymptom = l.symptoms && Object.keys(l.symptoms).length > 0 
                    ? Object.entries(l.symptoms).sort(([,a],[,b]) => b - a)[0]
                    : null;
                  
                  // Robust date formatting
                  let logDateFormatted = "Invalid date";
                  if (l.logged_at) {
                    const dateCandidate = new Date(l.logged_at);
                    if (!isNaN(dateCandidate.getTime())) {
                      logDateFormatted = format(dateCandidate, "MMM d, yyyy");
                    }
                  }

                  const currentSymptoms = l.symptoms || {};
                  const otherSymptoms = Object.entries(currentSymptoms).filter(([sKey]) => !mainSymptom || sKey !== mainSymptom[0]);

                  return (
                    <li key={l.id} className="p-3.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/70 dark:bg-gray-800/40 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                          {mainSymptom ? `${mainSymptom[0]} (${mainSymptom[1]}/5)` : (l.note ? "General Note" : "Log Entry")}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{logDateFormatted}</span>
                      </div>
                      {(mainSymptom || !Object.keys(currentSymptoms).length) && l.note && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed break-words" title={l.note}>{l.note.length > 100 ? l.note.substring(0,97) + "..." : l.note}</p>
                      )}
                      {otherSymptoms.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700/50 flex flex-wrap gap-1.5">
                          {otherSymptoms.slice(0,3).map(([key, value]) => (
                            <span key={key} className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{key} ({value}/5)</span>
                          ))}
                          {otherSymptoms.length > 3 && (
                             <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">...</span>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No logs recorded yet.</p>
            )}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
} 
