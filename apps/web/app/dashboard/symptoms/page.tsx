"use client";
import { useState } from "react";
import useSWR from "swr";
import DashboardShell from "../../components/DashboardShell";

const fetcher = (url:string)=>fetch(url).then(r=>r.json());

const COMMON_SYMPTOMS=["Fatigue","Headache","Brain fog","Digestive upset","Joint pain","Anxiety"];

export default function SymptomPage(){
  const { data, mutate } = useSWR("/api/symptom-log", fetcher);
  const [selected,setSelected]=useState<string|null>(null);
  const [severity,setSeverity]=useState(3);
  const [date,setDate]=useState<string>(()=>new Date().toISOString().substring(0,10));
  const [custom,setCustom]=useState("");

  const submit=async()=>{
    const symptomName = selected || custom.trim();
    if(!symptomName) return;
    await fetch("/api/symptom-log",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name:symptomName,severity,date})
    });
    setSelected(null);
    setCustom("");
    mutate();
  };

  return (
    <DashboardShell>
      <h1 className="text-2xl font-semibold mb-4">Symptom Tracker</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-medium mb-2">Log today's symptom</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {COMMON_SYMPTOMS.map(s=> (
              <button
                key={s}
                aria-pressed={selected===s}
                onClick={()=>setSelected(selected===s?null:s)}
                className={`px-3 py-1.5 rounded-full text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 ${selected===s?"bg-purple-600 text-white border-purple-600":"border-gray-300"}`}
              >{s}</button>
            ))}
          </div>

          {/* Custom symptom */}
          <input
            type="text"
            value={custom}
            onChange={e=>{setCustom(e.target.value);setSelected(null);}}
            placeholder="Other symptom..."
            aria-label="Custom symptom name"
            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />

          {/* Date & severity show only when a symptom entered */}
          {(selected || custom.trim()) && (
            <div className="space-y-3">
              <label className="block text-sm">Date:
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="ml-2 border rounded px-2 py-1" />
              </label>
              <label className="block text-sm" htmlFor="severityRange">Severity: {severity}
                <input id="severityRange" aria-label="Symptom severity 1 to 5" type="range" min={1} max={5} value={severity} onChange={e=>setSeverity(parseInt(e.target.value))} className="w-full" />
              </label>
              <button onClick={submit} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Save</button>
            </div>
          )}
        </div>
        <div className="md:border-l md:pl-6">
          <h2 className="font-medium mb-2">Recent logs</h2>
          <ul className="space-y-2 text-sm">
            {data?.logs?.map((l:any)=>(
              <li key={l.id} className="flex justify-between border-b pb-1"><span>{l.name} ({l.severity}/10)</span><span>{new Date(l.logged_at).toLocaleDateString()}</span></li>
            )) || <p className="text-gray-500">No logs yet.</p>}
          </ul>
        </div>
      </div>
    </DashboardShell>
  );
} 