/**
 * Database utility functions
 * This is a simple in-memory store for demonstration.
 * Replace with actual database integration (PostgreSQL, MongoDB, etc.)
 */

import { User, Conversation, Message, Automation, AutomationRun } from '@/types';

// In-memory database simulation
const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
];

const conversations: Conversation[] = [
  {
    id: '1',
    title: 'Welcome Conversation',
    messages: [
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        timestamp: new Date(),
      }
    ],
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

let nextUserId = 4;
let nextConversationId = 2;
let nextMessageId = 2;

const automations: Automation[] = [];
let nextAutomationId = 1;

const automationRuns: AutomationRun[] = [];
let nextRunId = 1;

/**
 * Database operations for Users
 */
export const userDb = {
  // Get all users
  findAll: async (): Promise<User[]> => {
    return Promise.resolve([...users]);
  },

  // Get user by ID
  findById: async (id: number): Promise<User | null> => {
    const user = users.find(u => u.id === id);
    return Promise.resolve(user || null);
  },

  // Create a new user
  create: async (userData: Omit<User, 'id'>): Promise<User> => {
    const newUser: User = {
      id: nextUserId++,
      ...userData,
    };
    users.push(newUser);
    return Promise.resolve(newUser);
  },

  // Update an existing user
  update: async (id: number, userData: Partial<Omit<User, 'id'>>): Promise<User | null> => {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      return Promise.resolve(null);
    }
    
    users[index] = { ...users[index], ...userData };
    return Promise.resolve(users[index]);
  },

  // Delete a user
  delete: async (id: number): Promise<boolean> => {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      return Promise.resolve(false);
    }
    
    users.splice(index, 1);
    return Promise.resolve(true);
  },

  // Check if email already exists
  emailExists: async (email: string, excludeId?: number): Promise<boolean> => {
    const user = users.find(u => u.email === email && u.id !== excludeId);
    return Promise.resolve(!!user);
  },
};

/**
 * Database operations for Conversations
 */
export const conversationDb = {
  // Get all conversations
  findAll: async (userId?: number): Promise<Conversation[]> => {
    const filtered = userId 
      ? conversations.filter(c => c.userId === userId)
      : conversations;
    return Promise.resolve([...filtered]);
  },

  // Get conversation by ID
  findById: async (id: string): Promise<Conversation | null> => {
    const conversation = conversations.find(c => c.id === id);
    return Promise.resolve(conversation || null);
  },

  // Create a new conversation
  create: async (conversationData: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conversation> => {
    const newConversation: Conversation = {
      id: (nextConversationId++).toString(),
      ...conversationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    conversations.push(newConversation);
    return Promise.resolve(newConversation);
  },

  // Update conversation
  update: async (id: string, data: Partial<Omit<Conversation, 'id' | 'createdAt'>>): Promise<Conversation | null> => {
    const index = conversations.findIndex(c => c.id === id);
    if (index === -1) {
      return Promise.resolve(null);
    }
    
    conversations[index] = { 
      ...conversations[index], 
      ...data, 
      updatedAt: new Date() 
    };
    return Promise.resolve(conversations[index]);
  },

  // Delete conversation
  delete: async (id: string): Promise<boolean> => {
    const index = conversations.findIndex(c => c.id === id);
    if (index === -1) {
      return Promise.resolve(false);
    }
    
    conversations.splice(index, 1);
    return Promise.resolve(true);
  },

  // Add message to conversation
  addMessage: async (conversationId: string, message: Omit<Message, 'id'>): Promise<Message | null> => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return Promise.resolve(null);
    }

    const newMessage: Message = {
      id: (nextMessageId++).toString(),
      ...message,
      timestamp: new Date(),
    };

    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date();
    
    return Promise.resolve(newMessage);
  },
};

/**
 * Database operations for Automations
 */
export const automationDb = {
  findAll: async (): Promise<Automation[]> => {
    return Promise.resolve([...automations]);
  },

  findById: async (id: number): Promise<Automation | null> => {
    const automation = automations.find(a => a.id === id);
    return Promise.resolve(automation || null);
  },

  create: async (automationData: Omit<Automation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Automation> => {
    const newAutomation: Automation = {
      id: nextAutomationId++,
      ...automationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    automations.push(newAutomation);
    return Promise.resolve(newAutomation);
  },

  update: async (id: number, automationData: Partial<Omit<Automation, 'id'>>): Promise<Automation | null> => {
    const index = automations.findIndex(a => a.id === id);
    if (index === -1) {
      return Promise.resolve(null);
    }
    
    automations[index] = { ...automations[index], ...automationData, updatedAt: new Date() };
    return Promise.resolve(automations[index]);
  },

  delete: async (id: number): Promise<boolean> => {
    const index = automations.findIndex(a => a.id === id);
    if (index === -1) {
      return Promise.resolve(false);
    }
    
    automations.splice(index, 1);
    return Promise.resolve(true);
  },
};

/**
 * Database operations for Automation Runs
 */
export const runDb = {
  findAllForAutomation: async (automationId: number): Promise<AutomationRun[]> => {
    const runs = automationRuns.filter(r => r.automationId === automationId);
    return Promise.resolve([...runs]);
  },

  findById: async (id: number): Promise<AutomationRun | null> => {
    const run = automationRuns.find(r => r.id === id);
    return Promise.resolve(run || null);
  },

  create: async (runData: Omit<AutomationRun, 'id' | 'finishedAt'>): Promise<AutomationRun> => {
    const newRun: AutomationRun = {
      id: nextRunId++,
      ...runData,
      finishedAt: null,
    };
    automationRuns.push(newRun);
    return Promise.resolve(newRun);
  },

  update: async (id: number, runData: Partial<Omit<AutomationRun, 'id' | 'automationId'>>): Promise<AutomationRun | null> => {
    const index = automationRuns.findIndex(r => r.id === id);
    if (index === -1) {
      return Promise.resolve(null);
    }
    
    automationRuns[index] = { ...automationRuns[index], ...runData, finishedAt: new Date() };
    return Promise.resolve(automationRuns[index]);
  },
};

/**
 * Example of how to extend with real database
 * 
 * import { Pool } from 'pg'; // For PostgreSQL
 * import { MongoClient } from 'mongodb'; // For MongoDB
 * 
 * const pool = new Pool({
 *   connectionString: process.env.DATABASE_URL,
 * });
 * 
 * export const userDb = {
 *   findAll: async (): Promise<User[]> => {
 *     const result = await pool.query('SELECT * FROM users ORDER BY id');
 *     return result.rows;
 *   },
 *   // ... other operations
 * };
 */
