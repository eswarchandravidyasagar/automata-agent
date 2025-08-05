// AI Agent related types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  config?: Partial<AgentConfig>;
}

export interface ChatResponse {
  message: Message;
  conversationId: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Database related types
export interface DatabaseConnection {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

// Environment variables
export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  API_URL?: string;
  GITHUB_TOKEN?: string; // Only GitHub token needed for AI models
}

// Automation types
export interface Automation {
  id: number;
  name: string;
  description: string;
  url: string;
  goal: string;
  script: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationRun {
  id: number;
  automationId: number;
  status: 'running' | 'completed' | 'failed';
  result: any | null;
  error: string | null;
  actionSteps: ActionStep[];
  startedAt: Date;
  finishedAt: Date | null;
}

import { ActionStep } from '@/components/agent-action-view';
