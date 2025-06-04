"use client";
import { useState } from "react";
import useSWR from "swr";
import DashboardShell from "../../components/DashboardShell";

const fetcher = (url:string)=>fetch(url).then(r=>r.json());

const COMMON_SYMPTOMS=["Fatigue","Headache","Brain fog","Digestive upset","Joint pain","Anxiety"];

export default function SymptomPage(){
  const { data, mutate } = useSWR("/api/symptom-log", fetcher);
  const [selected,setSelected]=useState<string|null>(null);
  const [severity,setSeverity]=useState(5);

  const submit=async()=>{
    if(!selected) return;
    await fetch("/api/symptom-log",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name:selected,severity})
    });
    setSelected(null);
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
              <button key={s} onClick={()=>setSelected(s)} className={`px-3 py-1.5 rounded-full text-sm border ${selected===s?"bg-purple-600 text-white border-purple-600":"border-gray-300"}`}>{s}</button>
            ))}
          </div>
          {selected && (
            <div className="space-y-2">
              <p className="text-sm">Severity: {severity}</p>
              <input type="range" min={0} max={10} value={severity} onChange={e=>setSeverity(parseInt(e.target.value))} className="w-full" />
              <button onClick={submit} className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg">Save</button>
            </div>
          )}
        </div>
        <div>
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