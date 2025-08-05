import { createOpenAI } from '@ai-sdk/openai';

// GitHub Models configuration  
// GitHub Models provides free access to various AI models through their API
// Just need a GitHub Personal Access Token (no additional API keys required)
const githubModels = createOpenAI({
  baseURL: 'https://models.github.ai/',
  apiKey: process.env.GITHUB_TOKEN || '',
  headers: {
    'X-GitHub-Api-Version': '2022-11-28',
    'Accept': 'application/vnd.github+json',
  },
});

// Available models through GitHub Models
export const models = {
  // OpenAI Models via GitHub Models (free access)
  'gpt-4o': githubModels('openai/gpt-4o'),
  'gpt-4o-mini': githubModels('openai/gpt-4o-mini'),
  'gpt-4-turbo': githubModels('openai/gpt-4-turbo'),
  'gpt-3.5-turbo': githubModels('openai/gpt-3.5-turbo'),
  
  // Meta Models via GitHub Models
  'llama-3.1-405b': githubModels('meta/meta-llama-3.1-405b-instruct'),
  'llama-3.1-70b': githubModels('meta/meta-llama-3.1-70b-instruct'),
  'llama-3.1-8b': githubModels('meta/meta-llama-3.1-8b-instruct'),
  
  // Microsoft Models via GitHub Models
  'phi-3-medium': githubModels('microsoft/phi-3-medium-4k-instruct'),
  'phi-3-mini': githubModels('microsoft/phi-3-mini-4k-instruct'),
  
  // Mistral Models via GitHub Models
  'mistral-large': githubModels('mistralai/mistral-large'),
  'mistral-nemo': githubModels('mistralai/mistral-nemo'),
};

// Default model configuration
export const defaultConfig = {
  model: 'gpt-4o-mini', // Fast and cost-effective model via GitHub Models
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompt: `You are a helpful AI assistant powered by GitHub Models. You are knowledgeable, concise, and friendly. 
You can help with various tasks including:
- Answering questions
- Writing and editing text
- Coding assistance
- Analysis and research
- Creative tasks

Please provide helpful and accurate responses while being conversational and engaging.`,
};

// Get the configured model
export function getModel(modelName: string = defaultConfig.model) {
  const model = models[modelName as keyof typeof models];
  if (!model) {
    console.warn(`Model ${modelName} not found, falling back to ${defaultConfig.model}`);
    return models[defaultConfig.model as keyof typeof models];
  }
  return model;
}

// System prompts for different agent types
export const systemPrompts = {
  general: defaultConfig.systemPrompt,
  
  codeAssistant: `You are an expert software developer and coding assistant. You help with:
- Writing clean, efficient code
- Debugging and troubleshooting
- Code reviews and best practices
- Architecture and design patterns
- Technology recommendations

Provide clear explanations with your code examples and focus on best practices.`,

  researcher: `You are a research assistant that helps with:
- Finding and analyzing information
- Summarizing complex topics
- Fact-checking and verification
- Providing citations and sources
- Breaking down complex concepts

Be thorough, accurate, and provide sources when possible.`,

  creative: `You are a creative writing assistant that helps with:
- Story and content creation
- Brainstorming ideas
- Editing and improving text
- Writing in different styles and tones
- Creative problem-solving

Be imaginative, engaging, and help bring ideas to life.`,
};
