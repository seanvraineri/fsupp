"use client";
import { useState } from 'react';
import useSWR from 'swr';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DashboardLayout } from "@/app/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { AlertTriangle, Info, Loader2 } from 'lucide-react';
import AdherenceRing from '@/app/components/AdherenceRing';
import RecommendationModal from '@/app/components/RecommendationModal';

// Dummy fetcher for now
const fetcher = async () => ({ recs: [], warnings: [], markers_count: 0, labs_count: 0 });

export default function RecommendationsPreviewPage() {
  const [filter, setFilter] = useState('all');
  const [selectedRec, setSelectedRec] = useState<any>(null);

  const { data, isLoading } = useSWR('recommendations', fetcher);

  const filteredRecs = data?.recs.filter((rec: any) => {
    if (filter === 'all') return true;
    // Add other filter logic here
    return true;
  }) || [];

  if (isLoading) {
    return <DashboardLayout><div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <AdherenceRing percent={75} size={56} />
                 <div>
                    <h1 className="text-2xl font-bold tracking-tight">Your Supplement Plan</h1>
                    <p className="text-muted-foreground">Based on your latest health assessment.</p>
                </div>
            </div>
            <Button variant="outline">Refresh Plan</Button>
        </div>

        <Tabs defaultValue="all">
            <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="core">Core</TabsTrigger>
                <TabsTrigger value="optional">Optional</TabsTrigger>
                <TabsTrigger value="experimental">Experimental</TabsTrigger>
            </TabsList>
        </Tabs>

        <div className="space-y-6 mt-6">
            {data && data.warnings.length > 0 && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Interaction Warnings</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-5">
                            {data.warnings.map((w: string) => <li key={w}>{w}</li>)}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            {data && data.markers_count === 0 && (
                 <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Upgrade Your Accuracy</AlertTitle>
                    <AlertDescription>
                        Upload genetics or lab results for more personalized recommendations. <Button variant="link" className="p-0 h-auto">Upload Now</Button>
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* {filteredRecs.map((rec: any) => (
                    <RecommendationCard key={rec.id} rec={rec} onDetails={() => setSelectedRec(rec)} />
                ))} */}
                <Card>
                    <CardHeader><CardTitle>Vitamin D3</CardTitle><CardDescription>5000 IU, once daily</CardDescription></CardHeader>
                    <CardContent><p>Reason: Based on your location and lack of sun exposure...</p><Button className="mt-4 w-full" onClick={()=>setSelectedRec({name: 'Vitamin D3'})}>View Details</Button></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Omega-3</CardTitle><CardDescription>2g, once daily</CardDescription></CardHeader>
                    <CardContent><p>Reason: To support cognitive function and reduce inflammation...</p><Button className="mt-4 w-full" onClick={()=>setSelectedRec({name: 'Omega-3'})}>View Details</Button></CardContent>
                </Card>
            </div>
        </div>

        {selectedRec && (
            <RecommendationModal rec={selectedRec} open={!!selectedRec} onOpenChange={() => setSelectedRec(null)} />
        )}
    </DashboardLayout>
  );
} 