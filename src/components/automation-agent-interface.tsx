'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlobeAltIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { AgentLogView, ActionStep } from '@/components/agent-action-view';
import { Automation } from '@/types';
import { MarkdownRenderer } from '@/components/markdown-renderer';


export function AutomationAgentInterface() {
  const [targetUrl, setTargetUrl] = useState('https://news.ycombinator.com/');
  const [goal, setGoal] = useState('Extract the top 10 story headlines and export them to a CSV file named "headlines.csv".');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [runResult, setRunResult] = useState<any>(null);
  const [agentSteps, setAgentSteps] = useState<ActionStep[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);

  const createAutomation = async () => {
    if (!targetUrl.trim() || !goal.trim()) {
      setError('Please provide both a URL and a goal.');
      return;
    }
    setIsLoading(true);
    setAgentSteps([]);
    setError('');
    setRunResult(null);

    try {
      const response = await fetch('/api/automation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, goal }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Failed to create automation: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processBuffer = (chunk: string) => {
        buffer += chunk;
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (!data) continue;
            try {
              const event = JSON.parse(data);
              
              if (event.type === 'result') {
                setRunResult(event.content);
                // Also add a log entry for the result, ensuring it's a string
                setAgentSteps(prev => [...prev, {
                  id: `step-${Date.now()}-${Math.random()}`,
                  type: 'output',
                  status: 'completed',
                  description: `Result received: ${JSON.stringify(event.content, null, 2)}`,
                  timestamp: Date.now(),
                }]);
              } else if (event.type === 'file') {
                // This is a new event type for file generation
                setRunResult(event.content); // Store file info to create download button
                setAgentSteps(prev => [...prev, {
                  id: `step-${Date.now()}-${Math.random()}`,
                  type: 'output',
                  status: 'completed',
                  description: `File ready for download: ${event.content.filename}`,
                  timestamp: Date.now(),
                }]);
              } else if (event.type === 'error') {
                setError(event.error);
                setAgentSteps(prev => [...prev, {
                  id: `step-${Date.now()}-${Math.random()}`,
                  type: 'output',
                  status: 'failed',
                  description: event.error,
                  timestamp: Date.now(),
                  outputType: 'stderr',
                }]);
              } else {
                // For 'thought', 'plan', etc.
                setAgentSteps(prev => [...prev, {
                  id: `step-${Date.now()}-${Math.random()}`,
                  type: event.type,
                  status: 'completed',
                  description: event.content || '',
                  timestamp: Date.now(),
                }]);
              }
            } catch (e) {
              console.error("Failed to parse event:", data, e);
            }
          }
        }
      };
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        processBuffer(chunk);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatResult = (result: any) => {
    if (result === null || result === undefined) return '';
    if (typeof result === 'string') return result;
    return JSON.stringify(result, null, 2);
  };
  
  const handleDownload = (file: { filename: string; mimeType: string; data: string }) => {
    const blob = new Blob([file.data], { type: file.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadAutomation = (automation: Automation) => {
    setTargetUrl(automation.url);
    setGoal(automation.goal);
    setSelectedAutomation(automation);
    setAgentSteps([]);
    setRunResult(null);
    setError('');
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="p-6 border-b bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 Aura - The Advanced Automation Engineer</h1>
          <p className="text-gray-600">Describe a complex task, and Aura will analyze the web application, devise a strategy, and execute the automation.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                    🌐 Target Website URL
                  </label>
                  <input
                    type="url"
                    id="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example.com/login"
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
                    🎯 Automation Goal
                  </label>
                  <textarea
                    id="goal"
                    rows={2}
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="Example: Log in and extract the user's name from the dashboard."
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Button 
                    onClick={createAutomation} 
                    disabled={isLoading || !targetUrl || !goal} 
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Agent is Running...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CpuChipIcon className="w-5 h-5 mr-2" />
                        Run Automation
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {(isLoading || agentSteps.length > 0 || error || runResult) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                  <GlobeAltIcon className="w-6 h-6 text-indigo-500 mr-2" />
                  Agent Activity
                </h3>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-red-800 mb-2">Error</h4>
                    <pre className="whitespace-pre-wrap text-sm text-red-700">{error}</pre>
                  </div>
                )}
                
                <AgentLogView
                  actionSteps={agentSteps}
                  isRunning={isLoading}
                  currentStepId={null}
                />
                
                {runResult && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">✅ Final Result</h4>
                    {runResult.filename && runResult.data ? (
                      <Button onClick={() => handleDownload(runResult)} className="bg-green-600 hover:bg-green-700">
                        Download {runResult.filename}
                      </Button>
                    ) : runResult.report ? (
                      <div className="prose prose-sm max-w-none p-2 rounded border bg-white">
                        <MarkdownRenderer content={runResult.report} />
                      </div>
                    ) : (
                      <div className="bg-green-100 p-3 rounded border">
                        <pre className="whitespace-pre-wrap text-sm text-green-700">{formatResult(runResult)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* These components are now removed from the render path */}
            {/* {selectedAutomation && <AutomationRunHistory automation={selectedAutomation} />} */}
            {/* <SavedAutomations onLoad={loadAutomation} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}