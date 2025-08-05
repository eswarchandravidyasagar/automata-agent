'use client';

import { ArrowPathIcon, CheckCircleIcon, XCircleIcon, PhotoIcon, LightBulbIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

export interface ActionStep {
  id: string;
  type: 'snapshot' | 'action' | 'thought' | 'output' | 'plan';
  status: 'running' | 'completed' | 'failed';
  description: string;
  timestamp: number;
  screenshot?: string;
  error?: string;
  outputType?: 'stdout' | 'stderr';
}

interface AgentActionViewProps {
  actionSteps: ActionStep[];
  currentStepId: string | null;
  isRunning: boolean;
}

export function AgentLogView({ actionSteps, currentStepId, isRunning }: AgentActionViewProps) {
  if (actionSteps.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
        <p className="text-gray-500">Waiting for agent to start...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-white rounded-lg border border-gray-300 overflow-hidden flex flex-col">
      <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-800">Agent Automation Progress</h3>
        {isRunning && (
          <div className="flex items-center text-blue-600">
            <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
            <span className="text-xs font-medium">Running</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="relative">
          {actionSteps.map((step, i) => (
            <div 
              key={step.id}
              className={`flex mb-4 ${currentStepId === step.id ? 'bg-blue-50 -mx-2 px-2 py-1 rounded-md' : ''}`}>
              <div className="mr-3 relative">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full z-10 relative
                  ${step.status === 'running' ? 'bg-blue-100 text-blue-600' : 
                    step.status === 'completed' ? 'bg-green-100 text-green-600' :
                    step.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}
                `}>
                  {step.type === 'snapshot' ? (
                    <PhotoIcon className="w-5 h-5" />
                  ) : step.type === 'plan' ? (
                    <LightBulbIcon className="w-5 h-5" />
                  ) : step.status === 'running' ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : step.status === 'completed' ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : step.status === 'failed' ? (
                    <XCircleIcon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{i + 1}</span>
                  )}
                </div>
                
                {i < actionSteps.length - 1 && (
                  <div className={`absolute top-8 left-4 w-0.5 h-full -ml-px
                    ${actionSteps[i + 1].status === 'failed' ? 'bg-red-200' : 'bg-blue-200'}`}></div>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className={`font-medium ${step.status === 'running' ? 'text-blue-700' : step.status === 'completed' ? 'text-green-700' : step.status === 'failed' ? 'text-red-700' : 'text-gray-700'}`}>
                  {getActionTitle(step.type)}
                </h4>
                <p className="text-sm text-gray-600">{step.description}</p>
                {step.outputType === 'stderr' && (
                  <div className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    Error: {step.description}
                  </div>
                )}
                {step.screenshot && (
                  <div className="mt-2">
                    <img 
                      src={`data:image/png;base64,${step.screenshot}`} 
                      alt={step.description} 
                      className="max-w-full h-auto rounded-md border border-gray-300 shadow-sm" 
                    />
                  </div>
                )}
                <time className="text-xs text-gray-400 mt-1 block">
                  {new Date(step.timestamp).toLocaleTimeString()}
                </time>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getActionTitle(type: ActionStep['type']): string {
  switch (type) {
    case 'snapshot': return 'Take Snapshot';
    case 'action': return 'Perform Action';
    case 'thought': return 'Agent Thinking';
    case 'output': return 'Console Output';
    case 'plan': return 'Generated Plan';
    default: return 'Perform Action';
  }
}