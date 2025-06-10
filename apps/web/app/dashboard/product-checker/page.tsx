"use client";
import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import DashboardShell from "../../components/DashboardShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Loader2, RefreshCcw, UploadCloud, ScanLine, Search, Archive as ArchiveIcon } from "lucide-react";

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
  summary?: string;
}

// Helper to convert raw verdict from Edge Function to AnalyserResult display shape
function verdictToResult(verdict: any, updatedAt: string): AnalyserResult {
  // If simplified payload
  if (verdict.message && !verdict.product) {
    return {
      personal: {},
      score: 75,
      ingredients: [],
      claims: [],
      fit: [],
      name: verdict.message as string,
      thumb: `https://picsum.photos/seed/${Math.random()}/80`,
      date: new Date(updatedAt).toLocaleDateString(),
    };
  }

  return {
    personal: verdict.personal,
    score: verdict.score ?? 70,
    ingredients: verdict.ingredients ?? [],
    claims: verdict.claims ?? [],
    fit: verdict.personal?.bullets ?? [],
    name: verdict.product?.name ?? "Unknown product",
    thumb: `https://picsum.photos/seed/${verdict.product?.id ?? Math.random()}/80`,
    date: new Date(updatedAt).toLocaleDateString(),
    summary: verdict.personal?.summary,
  };
}

export default function ProductCheckerPage(){
  const supabase = createClientComponentClient({
    supabaseUrl: "https://tcptynohlpggtufqanqg.supabase.co",
    supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTgyMDUsImV4cCI6MjA2Mzc3NDIwNX0.q9MsmKQAoIUUtyFNE86U9mBupzBboDJO6T1oChtV2E0"
  });
  const [userId,setUserId] = useState<string|null>(null);
  const [query,setQuery] = useState("");
  const [loading,setLoading] = useState(false);
  const [result,setResult] = useState<AnalyserResult|null>(null);
  const [archive,setArchive] = useState<AnalyserResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearHistory = async () => {
    if (!userId) {
      console.error("Cannot clear history: no user ID");
      return;
    }
    console.log("Clearing history for user:", userId);
    try {
      const { data, error } = await supabase.functions.invoke("clear-history", {
        body: { userId },
      });
      if (error) {
        console.error("Clear history error:", error);
        throw error;
      }
      console.log("Clear history success:", data);
      setArchive([]); // Clear UI instantly
    } catch (err) {
      console.error("Failed to clear history:", err);
      // Show user feedback
      alert("Failed to clear history. Please try again.");
    }
  };

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
        .order("updated_at", { ascending:false })
        .limit(20);
      if(error){ console.error(error); return; }
      const mapped = data.map(d=> verdictToResult(d.verdict, d.updated_at));
      setArchive(mapped);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  async function runCheck(q:string){
    if(!userId) return; // no user
    setLoading(true);
    setResult(null);
    try{
                      // product_checker function removed for simplicity
        const error = "Product checker feature temporarily disabled for maintenance";
        const data = null;
        // Disabled: const { data, error } = await supabase.functions.invoke("product_checker", { body: { user_id: userId, text: q } });
      if(error){ throw error; }
      const uiRes = verdictToResult(data, new Date().toISOString());
      setResult(uiRes);
      setArchive(prev=>[uiRes, ...prev.filter(item => item.name !== uiRes.name)]);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setQuery(`Analyzing image: ${file.name}`);
      console.log("File selected:", file.name);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setQuery(`Analyzing image: ${file.name}`);
      console.log("File dropped:", file.name);
    } else {
      const text = event.dataTransfer.getData("text");
      if (text) {
        setQuery(text);
        runCheck(text);
      }
    }
  };

  return (
    <DashboardShell>
      <div className="container mx-auto py-8 md:py-12 lg:grid lg:grid-cols-[1fr_380px] gap-12 items-start">
        {/* main */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Product Checker</h1>
            <p className="text-muted-foreground text-lg">
              Paste a product link, type its name, or upload an image to analyze its ingredients, claims, and personalized fit.
            </p>
          </div>

          {/* Unified Input / Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative flex flex-col items-center justify-center w-full p-8 py-12 border-2 border-dashed border-muted-foreground/30 rounded-xl hover:border-primary/70 transition-all duration-300 ease-in-out cursor-pointer bg-muted/20 hover:bg-muted/40 group"
          >
            <UploadCloud className="w-14 h-14 text-muted-foreground/50 group-hover:text-primary/80 transition-colors mb-4" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && submit()}
              placeholder="Type product name or paste link here..."
              className="w-full max-w-lg text-center bg-transparent border-none focus:ring-0 text-base group-hover:placeholder:text-foreground/70"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-sm text-muted-foreground mt-3">
              Or <span className="font-semibold text-primary group-hover:underline">click to browse</span> and upload an image (PNG, JPG).
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
              className="hidden"
              id="fileUpload"
            />
          </div>

          <Button onClick={submit} disabled={loading || !query.trim()} className="w-full sm:w-auto sm:px-12 py-3 text-base flex items-center gap-2 mx-auto" size="lg">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <ScanLine className="w-5 h-5" />}
            Analyze Product
          </Button>

          {/* Results or Loading State */}
          <div className="mt-8">
            {loading && (
              <Card className="p-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="animate-spin mx-auto text-primary" size={32} />
                <p className="mt-4 text-lg font-medium">Analyzing product...</p>
                <p className="text-muted-foreground">This may take a moment.</p>
              </Card>
            )}

            {!loading && result && (
              <Tabs defaultValue="overall">
                <div className="space-y-6 animate-fadeIn">
                  <TabsList>
                    <TabsTrigger value="overall">Overall Score</TabsTrigger>
                    <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                    <TabsTrigger value="claims">Claims</TabsTrigger>
                    <TabsTrigger value="fit">Personal Fit</TabsTrigger>
                  </TabsList>
                  {/* overall */}
                  <TabsContent value="overall" asChild>
                    <Card className="p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-${color(result.score)}-500 bg-${color(result.score)}-100 text-${color(result.score)}-700`}>{result.score}</div>
                        <div>
                          <h3 className="text-2xl font-semibold">{result.name}</h3>
                          <p className={`text-xl font-medium text-${color(result.score)}-600`}>
                            {result.score >= 80 ? "Excellent Choice! 😊" : result.score >= 60 ? "Good Option 👍" : result.score >= 40 ? "Consider Alternatives 🤔" : "Not Recommended 😟"}
                          </p>
                          {result.summary && <p className="mt-2 text-muted-foreground text-sm max-w-prose">{result.summary}</p>}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{result.fit.join(' ')}</p>
                    </Card>
                  </TabsContent>

                  {/* ingredients */}
                  <TabsContent value="ingredients" asChild>
                    <Card className="p-6 overflow-x-auto">
                      <table className="text-sm w-full">
                        <thead><tr><th className="text-left py-2 pr-2 font-semibold">Ingredient</th><th className="text-center py-2 px-2 font-semibold">Amount</th><th className="text-center py-2 pl-2 font-semibold">Quality</th></tr></thead>
                        <tbody>
                          {result.ingredients.map(ing=> (
                            <tr key={ing.name} className="border-t border-muted/50 hover:bg-muted/30 transition-colors">
                              <td className="py-2 pr-2">{ing.name}</td>
                              <td className="text-center py-2 px-2">{ing.amount ?? '-'}</td>
                              <td className={`text-center py-2 pl-2 font-medium ${ing.quality==="good"?"text-green-600":ing.quality==="questionable"?"text-orange-500":"text-red-600"}`}>{ing.quality}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Card>
                  </TabsContent>
                  {/* claims */}
                  <TabsContent value="claims" asChild>
                    <Card className="p-6 space-y-4">
                      {result.claims.map(c=> (
                        <div key={c.claim} className="border-b border-muted/50 pb-3 last:border-b-0 last:pb-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-${c.verdict==="supported"?"green":c.verdict==="weak"?"yellow":"red"}-100 text-${c.verdict==="supported"?"green":c.verdict==="weak"?"yellow":"red"}-800`}>{c.verdict}</span>
                            <p className="font-semibold text-base">{c.claim}</p>
                          </div>
                          <p className="text-muted-foreground text-sm ml-[calc(0.625rem+0.75rem)]">{c.blurb}</p>
                        </div>
                      ))}
                      {result.claims.length === 0 && <p className="text-muted-foreground">No specific claims identified or analyzed for this product.</p>}
                    </Card>
                  </TabsContent>
                  {/* fit */}
                  <TabsContent value="fit" asChild>
                    <Card className="p-6">
                      <h3 className="font-semibold text-lg mb-3">Personalized Fit Analysis:</h3>
                      {result.personal?.summary && <p className="mb-3 text-muted-foreground">{result.personal.summary}</p>}
                      <ul className="space-y-2">
                        {result.fit.map((f:string)=>(<li key={f} className="flex items-start gap-2"><Search className="w-4 h-4 mt-1 text-primary flex-shrink-0"/><span>{f}</span></li>))}
                      </ul>
                      {result.fit.length === 0 && <p className="text-muted-foreground">No specific personalization notes for you with this product. This may update as we learn more about your profile.</p>}
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>
        </div>

        {/* archive */}
        <div className="mt-10 lg:mt-0 lg:sticky lg:top-24 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Scan History</h2>
            <Button variant="ghost" size="icon" onClick={clearHistory}>
              <RefreshCcw className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
          <div className="grid gap-3 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1 simple-scrollbar">
            {archive.map((item, index) => (
              <div key={`${item.name}-${item.date}-${index}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setResult(item)}>
                <div style={{backgroundColor: color(item.score)}} className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold text-white shadow-md">
                  {item.score}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1 truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
} 
