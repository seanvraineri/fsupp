"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import DashboardShell from "../../components/DashboardShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Loader2, RefreshCcw } from "lucide-react";

// Types
interface AnalyserResult {
  personal: any;
  score: number; // 0-100
  ingredients: { name: string; amount?: string; quality: "good" | "questionable" }[];
  claims: { claim: string; verdict: string; blurb?: string }[];
  fit: string[];
  name: string;
  thumb: string;
  date: string;
}

// Helper to convert raw verdict from Edge Function to AnalyserResult display shape
function verdictToResult(verdict: any, updatedAt: string): AnalyserResult {
  return {
    personal: verdict.personal,
    score: verdict.score,
    ingredients: verdict.ingredients,
    claims: verdict.claims,
    fit: verdict.personal?.bullets ?? [],
    name: verdict.product?.name ?? "Unknown product",
    thumb: `https://picsum.photos/seed/${verdict.product?.id ?? Math.random()}/80`,
    date: new Date(updatedAt).toLocaleDateString()
  };
}

export default function ProductCheckerPage(){
  const supabase = createClientComponentClient();
  const [userId,setUserId] = useState<string|null>(null);
  const [query,setQuery] = useState("");
  const [loading,setLoading] = useState(false);
  const [result,setResult] = useState<AnalyserResult|null>(null);
  const [archive,setArchive] = useState<AnalyserResult[]>([]);

  // Fetch logged-in user and their history on mount
  useEffect(()=>{
    (async()=>{
      const { data: { user } } = await supabase.auth.getUser();
      if(!user) return;
      setUserId(user.id);
      const { data, error } = await supabase
        .from("product_verdict_cache")
        .select("verdict,updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending:false });
      if(error){ console.error(error); return; }
      const mapped = data.map(d=> verdictToResult(d.verdict, d.updated_at));
      setArchive(mapped);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  async function runCheck(q:string){
    if(!userId) return; // no user
    setLoading(true);
    try{
      const { data, error } = await supabase.functions.invoke("product_checker", {
        body: { user_id: userId, text: q }
      });
      if(error){ throw error; }
      const uiRes = verdictToResult(data, new Date().toISOString());
      setResult(uiRes);
      setArchive(prev=>[uiRes, ...prev.filter(p=>p.name!==uiRes.name || p.date!==uiRes.date)]);
    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }
  }

  const color=(s:number)=>s>=80?"green":s>=60?"yellow":s>=40?"orange":"red";

  const submit = ()=>{
    if(!query.trim()) return;
    runCheck(query.trim());
  };

  return (
    <DashboardShell>
      <div className="container mx-auto pb-16 lg:grid lg:grid-cols-[1fr_360px] gap-10">
        {/* main */}
        <div className="max-w-2xl mx-auto pt-16 min-h-[70vh] flex flex-col justify-center">
          <div className="space-y-8">
            {/* input / drop zone */}
            <div
              onDragOver={e=>{e.preventDefault();}}
              onDrop={e=>{
                e.preventDefault();
                const file=e.dataTransfer.files?.[0];
                if(file){
                  setQuery(file.name);
                  // TODO: upload & call analyser with image
                } else {
                  const text=e.dataTransfer.getData("text");
                  if(text) setQuery(text);
                }
              }}
              className="flex gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 transition-colors bg-gray-50/50"
            >
              <Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Paste link, type product, or drop image…" className="flex-1 border-none focus:ring-0 bg-transparent" onKeyDown={(e:React.KeyboardEvent<HTMLInputElement>)=>e.key==="Enter"&&submit()} />
              <input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f){setQuery(f.name);/* TODO upload */}}} className="hidden" id="fileUpload" />
              <label htmlFor="fileUpload" className="cursor-pointer px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50 transition">Browse</label>
              <Button onClick={submit} disabled={loading} className="px-6">{loading?<Loader2 className="animate-spin"/>:"Check"}</Button>
            </div>

            {loading && !result && (
              <Card className="p-12 flex items-center justify-center animate-pulse">
                <div className="text-center space-y-2">
                  <Loader2 className="animate-spin mx-auto" size={24} />
                  <p>Thinking…</p>
                </div>
              </Card>
            )}

            {!loading && !result && (
              <Card className="p-12 text-center text-muted-foreground space-y-2">
                <p className="text-lg">Drop a link or photo above to get started.</p>
                <p className="text-sm">We'll analyze ingredients, claims, and how it fits your health profile</p>
              </Card>
            )}

            {result && (
              <Tabs defaultValue="overall" className="space-y-6 animate-fadeIn">
                <TabsList>
                  <TabsTrigger value="overall">Overall</TabsTrigger>
                  <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                  <TabsTrigger value="claims">Claims vs Science</TabsTrigger>
                  <TabsTrigger value="fit">Fit for You</TabsTrigger>
                </TabsList>
                {/* overall */}
                <TabsContent value="overall" asChild>
                  <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-semibold bg-${color(result.score)}-100 text-${color(result.score)}-800`}>{result.score}</div>
                      <span className="text-4xl">{result.score>=80?"😊":result.score>=60?"😐":"😟"}</span>
                    </div>
                  </Card>
                </TabsContent>

                {/* ingredients */}
                <TabsContent value="ingredients" asChild>
                  <Card className="p-6 overflow-x-auto">
                    <table className="text-sm w-full">
                      <thead><tr><th className="text-left">Ingredient</th><th>Amount</th><th>Quality</th></tr></thead>
                      <tbody>
                        {result.ingredients.map(ing=> (
                          <tr key={ing.name} className="border-t"><td>{ing.name}</td><td className="text-center">{ing.amount}</td><td className={ing.quality==="good"?"text-green-600":"text-red-600"}>{ing.quality}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                </TabsContent>
                {/* claims */}
                <TabsContent value="claims" asChild>
                  <Card className="p-6 space-y-4">
                    {result.claims.map(c=> (
                      <div key={c.claim} className="flex items-start gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs capitalize bg-${c.verdict==="supported"?"green":c.verdict==="weak"?"yellow":"red"}-100 text-${c.verdict==="supported"?"green":c.verdict==="weak"?"yellow":"red"}-800`}>{c.verdict}</span>
                        <div>
                          <p className="font-medium">{c.claim}</p>
                          <p className="text-muted-foreground text-sm">{c.blurb}</p>
                        </div>
                      </div>
                    ))}
                  </Card>
                </TabsContent>
                {/* fit */}
                <TabsContent value="fit" asChild>
                  <Card className="p-6 space-y-2 list-disc list-inside">
                    {result.personal?.bullets?.map((f:string)=>(<li key={f}>{f}</li>))}
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>

        {/* archive */}
        <div className="mt-10 lg:mt-0 lg:border-l lg:pl-6">
          <h2 className="font-medium mb-4">Archive</h2>
          {archive.length===0 && <p className="text-sm text-muted-foreground italic">No scans yet — they'll appear here after your first check.</p>}
          <div className="grid gap-3">
            {archive.map((a,i)=> (
              <Card key={i} className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted" onClick={()=>setResult(a)}>
                <img src={a.thumb} alt="thumb" className="w-10 h-10 rounded"/>
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-1">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.date}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold bg-${color(a.score)}-100 text-${color(a.score)}-800`}>{a.score}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
} 
