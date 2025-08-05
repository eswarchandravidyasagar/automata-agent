// Direct GitHub Models API integration
// This bypasses the OpenAI SDK compatibility issues

export interface GitHubModelsMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GitHubModelsResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callGitHubModel(
  model: string,
  messages: GitHubModelsMessage[],
  options: {
    temperature?: number;
    max_tokens?: number;
  } = {}
): Promise<string> {
  console.log('Calling GitHub Models with model:', model);
  
  const response = await fetch('https://models.github.ai/inference/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Accept': 'application/vnd.github+json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GitHub Models API error:', response.status, errorText);
    throw new Error(`GitHub Models API error: ${response.status} ${errorText}`);
  }

  const data: GitHubModelsResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Streaming version for real-time responses (simulated for now)
export async function callGitHubModelStream(
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    temperature?: number;
    max_tokens?: number;
  }
): Promise<string> {
  // For now, use the regular call and return the full response
  // In a real implementation, you would use the streaming endpoint
  return await callGitHubModel(model, messages, options);
}

// Available models mapping - Based on GitHub Models catalog
export const githubModels = {
  // OpenAI Models (verified from catalog)
  'gpt-4o': 'openai/gpt-4o',                     // Available ✅
  'gpt-4o-mini': 'openai/gpt-4o-mini',           // Confirmed working ✅
  'gpt-4.1': 'openai/gpt-4.1',                   // Latest model ✅
  'gpt-4.1-mini': 'openai/gpt-4.1-mini',         // Latest mini ✅
  'gpt-4.1-nano': 'openai/gpt-4.1-nano',         // Latest nano ✅
  'o1': 'openai/o1',                             // Reasoning model ✅
  'o1-mini': 'openai/o1-mini',                   // Reasoning mini ✅
  'o3': 'openai/o3',                             // Latest reasoning ✅
  'o3-mini': 'openai/o3-mini',                   // Latest reasoning mini ✅
  
  // Meta Models (verified from catalog)
  'llama-3.1-405b': 'meta/meta-llama-3.1-405b-instruct',  // Available ✅
  'llama-3.1-8b': 'meta/meta-llama-3.1-8b-instruct',      // Available ✅
  'llama-3.3-70b': 'meta/llama-3.3-70b-instruct',         // Latest 70B ✅
  'llama-3.2-11b-vision': 'meta/llama-3.2-11b-vision-instruct', // Vision model ✅
  'llama-3.2-90b-vision': 'meta/llama-3.2-90b-vision-instruct', // Large vision ✅
  
  // Microsoft Models (verified from catalog)
  'phi-3-mini-4k': 'microsoft/phi-3-mini-4k-instruct',    // Available ✅
  'phi-3-mini-128k': 'microsoft/phi-3-mini-128k-instruct', // Large context ✅
  'phi-3-medium-4k': 'microsoft/phi-3-medium-4k-instruct', // Available ✅
  'phi-3-medium-128k': 'microsoft/phi-3-medium-128k-instruct', // Large context ✅
  'phi-3.5-mini': 'microsoft/phi-3.5-mini-instruct',      // Latest mini ✅
  'phi-3.5-moe': 'microsoft/phi-3.5-moe-instruct',        // Mixture of experts ✅
  'phi-4': 'microsoft/phi-4',                              // Latest Phi ✅
  'phi-4-mini': 'microsoft/phi-4-mini-instruct',           // Latest mini ✅
  
  // Mistral Models (verified from catalog)
  'mistral-large': 'mistral-ai/mistral-large-2411',       // Latest large ✅
  'mistral-nemo': 'mistral-ai/mistral-nemo',               // Available ✅
  'mistral-small': 'mistral-ai/mistral-small-2503',        // Latest small ✅
  'codestral': 'mistral-ai/codestral-2501',                // Code model ✅
  'ministral-3b': 'mistral-ai/ministral-3b',               // Lightweight ✅
};
