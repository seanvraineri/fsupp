"use client";
import { useState } from 'react';

export default function TestCorsPage() {
  const [results, setResults] = useState<string[]>([]);
  
  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAPICalls = async () => {
    setResults([]);
    addResult("Starting CORS tests...");
    
    // Test 1: GET intake with fake ID
    try {
      const response1 = await fetch('/api/intake?recommendation_id=test-id');
      const data1 = await response1.json();
      addResult(`✅ GET /api/intake: ${response1.status} - ${JSON.stringify(data1)}`);
    } catch (error) {
      addResult(`❌ GET /api/intake failed: ${error}`);
    }
    
    // Test 2: GET summary
    try {
      const response2 = await fetch('/api/intake/summary');
      const data2 = await response2.json();
      addResult(`✅ GET /api/intake/summary: ${response2.status} - ${JSON.stringify(data2)}`);
    } catch (error) {
      addResult(`❌ GET /api/intake/summary failed: ${error}`);
    }
    
    // Test 3: POST intake
    try {
      const response3 = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendation_id: 'test' })
      });
      const data3 = await response3.json();
      addResult(`✅ POST /api/intake: ${response3.status} - ${JSON.stringify(data3)}`);
    } catch (error) {
      addResult(`❌ POST /api/intake failed: ${error}`);
    }
    
    // Test 4: OPTIONS preflight
    try {
      const response4 = await fetch('/api/intake/summary', { method: 'OPTIONS' });
      addResult(`✅ OPTIONS /api/intake/summary: ${response4.status}`);
    } catch (error) {
      addResult(`❌ OPTIONS failed: ${error}`);
    }
    
    addResult("CORS tests completed!");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">CORS Testing Page</h1>
      
      <button 
        onClick={testAPICalls}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
      >
        Test API Calls (Check for CORS Errors)
      </button>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Test Results:</h2>
        {results.length === 0 ? (
          <p className="text-gray-500">Click button to run tests</p>
        ) : (
          <div className="space-y-1">
            {results.map((result, i) => (
              <div key={i} className="font-mono text-sm">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-6 text-sm text-gray-600">
        <p><strong>What to check:</strong></p>
        <ul className="list-disc ml-6">
          <li>No CORS errors in browser console</li>
          <li>All API calls return 200 status (even if unauth)</li>
          <li>OPTIONS requests work</li>
          <li>Data is returned (even error responses are good)</li>
        </ul>
      </div>
    </div>
  );
} 