"use client";
import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DashboardLayout } from "@/app/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Loader2, UploadCloud, ScanLine, Search, Archive as ArchiveIcon } from "lucide-react";

// Types need to be defined or imported
interface AnalyserResult {
  personal: any;
  score: number;
  ingredients: { name: string; amount?: string; quality: "good" | "questionable" | "bad" }[];
  claims: { claim: string; verdict: "supported" | "weak" | "unsupported"; blurb?: string }[];
  fit: string[];
  name: string;
  thumb: string;
  date: string;
}

function verdictToResult(verdict: any, updatedAt: string): AnalyserResult {
  // This function would need to be adapted based on the actual verdict structure
  return {
    personal: verdict.personal || {},
    score: verdict.score || 0,
    ingredients: verdict.ingredients || [],
    claims: verdict.claims || [],
    fit: verdict.personal?.bullets ?? [],
    name: verdict.product?.name ?? "Unknown Product",
    thumb: `https://picsum.photos/seed/${verdict.product?.id ?? Math.random()}/80`,
    date: new Date(updatedAt).toLocaleDateString(),
  };
}

export default function ProductCheckerPreviewPage() {
  const supabase = createClientComponentClient({
    supabaseUrl: "https://tcptynohlpggtufqanqg.supabase.co",
    supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTgyMDUsImV4cCI6MjA2Mzc3NDIwNX0.q9MsmKQAoIUUtyFNE86U9mBupzBboDJO6T1oChtV2E0"
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyserResult | null>(null);
  const [archive, setArchive] = useState<AnalyserResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data, error } = await supabase
        .from("product_verdict_cache")
        .select("verdict,updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(20);
      if (error) { console.error(error); return; }
      const mapped = data.map(d => verdictToResult(d.verdict, d.updated_at));
      setArchive(mapped);
    })();
  }, []);

  async function runCheck(q: string) {
    if (!userId) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("product_checker", {
        body: { user_id: userId, text: q },
      });
      if (error) { throw error; }
      const uiRes = verdictToResult(data, new Date().toISOString());
      setResult(uiRes);
      setArchive(prev => [uiRes, ...prev.filter(item => item.name !== uiRes.name)]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const color = (s: number) => s >= 80 ? "green" : s >= 60 ? "yellow" : s >= 40 ? "orange" : "red";
  const colorClasses = (s: number) => {
      if (s >= 80) return "border-green-500 bg-green-100 text-green-700 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300";
      if (s >= 60) return "border-yellow-500 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:border-yellow-700 dark:text-yellow-300";
      if (s >= 40) return "border-orange-500 bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:border-orange-700 dark:text-orange-300";
      return "border-red-500 bg-red-100 text-red-700 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300";
  };
  const claimColorClasses = (verdict: "supported" | "weak" | "unsupported") => {
      if(verdict === 'supported') return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      if(verdict === 'weak') return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  }


  const submit = () => {
    if (!query.trim()) return;
    runCheck(query.trim());
  };

  return (
    <DashboardLayout>
      <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <Card
                className="flex flex-col items-center justify-center p-8 py-12 border-2 border-dashed"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                // onDrop={handleDrop}
            >
                <UploadCloud className="w-14 h-14 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Scan or Search a Product</h3>
                <p className="text-muted-foreground text-center mb-4">Drop an image, paste a URL, or type a product name below.</p>
                <div className="w-full max-w-lg flex gap-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submit()}
                        placeholder="e.g., 'Optimum Nutrition Gold Standard Whey' or paste link..."
                        className="text-base"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <Button onClick={submit} disabled={loading || !query.trim()}>
                        {loading ? <Loader2 className="animate-spin" /> : <Search />}
                    </Button>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    // onChange={handleFileChange}
                    className="hidden"
                />
            </Card>

            {loading && (
              <Card className="p-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="animate-spin mx-auto text-primary" size={32} />
                <p className="mt-4 text-lg font-medium">Analyzing product...</p>
                <p className="text-muted-foreground">This may take a moment.</p>
              </Card>
            )}

            {!loading && result && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold border-4 ${colorClasses(result.score)}`}>{result.score}</div>
                            <div>
                                <CardTitle className="text-2xl">{result.name}</CardTitle>
                                <CardDescription className="text-lg">
                                {result.score >= 80 ? "Excellent Choice! 😊" : result.score >= 60 ? "Good Option 👍" : result.score >= 40 ? "Consider Alternatives 🤔" : "Not Recommended 😟"}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                    <Tabs defaultValue="fit" className="mt-4">
                        <TabsList>
                            <TabsTrigger value="fit">Personal Fit</TabsTrigger>
                            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                            <TabsTrigger value="claims">Claims</TabsTrigger>
                        </TabsList>
                        <TabsContent value="fit">
                            <div className="pt-4">
                                <p className="mb-3 text-muted-foreground">{result.personal?.summary || "No specific personalization notes available."}</p>
                                <ul className="space-y-2">
                                    {result.fit.map((f:string)=>(<li key={f} className="flex items-start gap-2 text-sm"><Search className="w-4 h-4 mt-0.5 text-primary flex-shrink-0"/><span>{f}</span></li>))}
                                </ul>
                            </div>
                        </TabsContent>
                        <TabsContent value="ingredients">
                            <div className="pt-4">
                                <table className="text-sm w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 font-semibold">Ingredient</th>
                                            <th className="text-center py-2 px-2 font-semibold">Amount</th>
                                            <th className="text-center py-2 pl-2 font-semibold">Quality</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.ingredients.map(ing=> (
                                        <tr key={ing.name} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                            <td className="py-2 pr-2">{ing.name}</td>
                                            <td className="text-center py-2 px-2">{ing.amount ?? '-'}</td>
                                            <td className={`text-center py-2 pl-2 font-medium capitalize ${ing.quality==="good"?"text-green-600":ing.quality==="questionable"?"text-orange-500":"text-red-600"}`}>{ing.quality}</td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>
                         <TabsContent value="claims">
                            <div className="pt-4 space-y-4">
                                {result.claims.map(c=> (
                                <div key={c.claim} className="border-b last:border-b-0 pb-3">
                                    <div className="flex items-center gap-3 mb-1">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${claimColorClasses(c.verdict)}`}>{c.verdict}</span>
                                    <p className="font-semibold text-base">{c.claim}</p>
                                    </div>
                                    <p className="text-muted-foreground text-sm ml-2">{c.blurb}</p>
                                </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                    </CardContent>
                </Card>
            )}
        </div>
        <div className="grid auto-rows-max items-start gap-4 md:gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Scan History</CardTitle>
                    <CardDescription>View your past product analyses.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
                    {archive.length === 0 && (
                        <div className="p-6 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                            <ArchiveIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                            <p className="font-medium">No Scans Yet</p>
                        </div>
                    )}
                    {archive.map((a,i)=> (
                        <Card key={i} className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted" onClick={()=>setResult(a)}>
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-semibold ${colorClasses(a.score)}`}>{a.score}</div>
                            <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1 truncate">{a.name}</p>
                            <p className="text-xs text-muted-foreground">{a.date}</p>
                            </div>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 