'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (model: string) => void;
}

const availableModels = {
  'OpenAI': [
    { 
      id: 'gpt-4o', 
      name: 'GPT-4o', 
      description: 'Advanced multimodal AI with vision capabilities', 
      icon: '🧠', 
      provider: 'OpenAI',
      tier: 'Premium',
      capabilities: ['Text', 'Vision', 'Reasoning']
    },
    { 
      id: 'gpt-4o-mini', 
      name: 'GPT-4o Mini', 
      description: 'Fast and efficient model for everyday tasks', 
      icon: '⚡', 
      provider: 'OpenAI',
      tier: 'Standard',
      capabilities: ['Text', 'Speed']
    },
  ],
  'Meta': [
    { 
      id: 'llama-3.1-8b', 
      name: 'Llama 3.1 8B', 
      description: 'Lightweight yet powerful open-source model', 
      icon: '🦙', 
      provider: 'Meta',
      tier: 'Standard',
      capabilities: ['Text', 'Speed', 'Open Source']
    },
    { 
      id: 'llama-3.1-405b', 
      name: 'Llama 3.1 405B', 
      description: 'Massive scale model for complex reasoning', 
      icon: '🏔️', 
      provider: 'Meta',
      tier: 'Premium',
      capabilities: ['Text', 'Reasoning', 'Large Scale']
    },
    { 
      id: 'llama-3.3-70b', 
      name: 'Llama 3.3 70B', 
      description: 'Latest enhanced model with improved performance', 
      icon: '🔥', 
      provider: 'Meta',
      tier: 'Premium',
      capabilities: ['Text', 'Enhanced', 'Latest']
    },
    { 
      id: 'llama-3.2-11b-vision', 
      name: 'Llama 3.2 Vision', 
      description: 'Specialized model for image understanding', 
      icon: '👁️', 
      provider: 'Meta',
      tier: 'Specialized',
      capabilities: ['Text', 'Vision', 'Analysis']
    },
  ],
  'Microsoft': [
    { 
      id: 'phi-3-mini-4k', 
      name: 'Phi-3 Mini', 
      description: 'Compact model optimized for efficiency', 
      icon: '�', 
      provider: 'Microsoft',
      tier: 'Standard',
      capabilities: ['Text', 'Efficiency', 'Compact']
    },
    { 
      id: 'phi-3-medium-4k', 
      name: 'Phi-3 Medium', 
      description: 'Balanced performance and capability', 
      icon: '�', 
      provider: 'Microsoft',
      tier: 'Standard',
      capabilities: ['Text', 'Balanced', 'Reliable']
    },
    { 
      id: 'phi-3.5-mini', 
      name: 'Phi-3.5 Mini', 
      description: 'Enhanced mini model with better reasoning', 
      icon: '✨', 
      provider: 'Microsoft',
      tier: 'Enhanced',
      capabilities: ['Text', 'Reasoning', 'Enhanced']
    },
  ],
  'Mistral': [
    { 
      id: 'mistral-nemo', 
      name: 'Mistral Nemo', 
      description: 'Balanced model for general-purpose tasks', 
      icon: '🌊', 
      provider: 'Mistral',
      tier: 'Standard',
      capabilities: ['Text', 'General', 'Balanced']
    },
    { 
      id: 'mistral-large', 
      name: 'Mistral Large', 
      description: 'High-performance model for complex tasks', 
      icon: '🌟', 
      provider: 'Mistral',
      tier: 'Premium',
      capabilities: ['Text', 'Performance', 'Complex']
    },
    { 
      id: 'codestral', 
      name: 'Codestral', 
      description: 'Specialized model for code generation', 
      icon: '💻', 
      provider: 'Mistral',
      tier: 'Specialized',
      capabilities: ['Code', 'Programming', 'Generation']
    },
  ],
};

export function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getCurrentModelInfo = () => {
    for (const category of Object.values(availableModels)) {
      const model = category.find(m => m.id === currentModel);
      if (model) return model;
    }
    return { name: currentModel, icon: '🤖', provider: 'Unknown', tier: 'Unknown', capabilities: [] };
  };

  const currentModelInfo = getCurrentModelInfo();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Premium': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'Enhanced': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'Specialized': return 'bg-gradient-to-r from-orange-500 to-red-500 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'OpenAI': return 'bg-green-100 text-green-800 border-green-200';
      case 'Meta': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Microsoft': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Mistral': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between h-14 px-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-purple-300 hover:bg-white/90 transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg shadow-lg">
            {currentModelInfo.icon}
          </div>
          <div className="text-left">
            <div className="font-bold text-gray-900 text-sm">{currentModelInfo.name}</div>
            <div className="text-xs text-gray-500">{currentModelInfo.provider}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${getTierColor(currentModelInfo.tier)}`}>
            {currentModelInfo.tier}
          </div>
          <svg className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} group-hover:text-purple-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border-2 border-gray-200 rounded-3xl shadow-2xl z-[100] max-h-[70vh] overflow-hidden">
          <div className="max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-gray-100 scrollbar-track-rounded-full scrollbar-thumb-rounded-full hover:scrollbar-thumb-purple-500">
            {Object.entries(availableModels).map(([category, models]) => (
              <div key={category} className="p-6 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">{category.charAt(0)}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{category}</h3>
                </div>
                
                <div className="grid gap-3">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onModelChange(model.id);
                        setIsOpen(false);
                      }}
                      className={`group relative p-4 rounded-2xl transition-all duration-300 border-2 text-left ${
                        currentModel === model.id 
                          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-lg transform scale-[1.02]' 
                          : 'bg-white/60 border-gray-200 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:border-purple-200 hover:shadow-md hover:transform hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl shadow-lg flex-shrink-0">
                          {model.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900 text-base">{model.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getProviderColor(model.provider)}`}>
                              {model.provider}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getTierColor(model.tier)}`}>
                              {model.tier}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{model.description}</p>
                          
                          <div className="flex flex-wrap gap-1">
                            {model.capabilities.map((capability, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                                {capability}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {currentModel === model.id && (
                          <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <span className="font-bold text-gray-900">Powered by GitHub Models</span>
            </div>
            <div className="text-sm text-gray-600 leading-relaxed">
              🚀 <strong>Free with GitHub token</strong> • 🔄 <strong>Real-time streaming</strong> • 
              ✅ <strong>All models verified working</strong> • 🎨 <strong>Advanced markdown support</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
