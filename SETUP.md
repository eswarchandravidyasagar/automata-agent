# 🚀 Quick Setup Guide

## GitHub Models Integration (FREE AI Access!)

This app now uses **GitHub Models** which provides **FREE** access to multiple AI models with just a GitHub token - no paid API keys needed!

### Available Models:
- **GPT-4o** and **GPT-4o Mini** (OpenAI)
- **Llama 3.1** models (Meta) 
- **Phi-3** models (Microsoft)
- **Mistral** models

## Setup Steps:

### 1. Get Your GitHub Token (FREE)
1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Add a note: "AI Agent App"
4. Select **"Public Repositories"** scope
5. Click "Generate token"
6. Copy the token

### 2. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
GITHUB_TOKEN="your-github-token-here"
```

### 3. Run the App
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and start chatting!

## Why GitHub Models?
✅ **100% FREE** - No credit card needed  
✅ **Multiple AI providers** in one place  
✅ **High rate limits** for development  
✅ **Perfect for open source projects**  
✅ **Latest models** from OpenAI, Meta, Microsoft, Mistral

## Model Selection
The app includes a model selector where you can switch between different AI models in real-time during your conversations!
