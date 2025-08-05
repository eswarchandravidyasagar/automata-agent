# Automata Agent

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Playwright-1-brightgreen?style=for-the-badge&logo=playwright" alt="Playwright">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
</p>

This project is an AI-powered agent, **Aura (Automated Reasoning Agent)**, capable of understanding high-level goals in natural language, interacting with websites using Playwright, and automating complex data extraction workflows. It features a sophisticated agent that devises and executes multi-step plans, learns from runtime errors, and delivers extracted data in user-specified formats like reports or CSV files.

## Key Features

- **Goal-Driven Automation**: Translates natural language objectives (e.g., "Extract the top 10 headlines and save to CSV") into executable, multi-step plans.
- **Robust Browser Interaction**: Leverages a rich set of Playwright-based tools to navigate, click, type, scroll, hover, and handle dynamic web content.
- **Flexible Data Extraction**: Extracts single items, lists of items, or specific element attributes (e.g., `href` from a link).
- **Data Formatting & Export**: Formats findings into clean Markdown reports or exports structured data directly to a downloadable CSV file.
- **Self-Healing Execution**: Autonomously corrects its course. If a plan fails, the agent analyzes the error, re-evaluates the webpage, and devises a new strategy.
- **Powered by GitHub Models**: Integrates with GitHub Models for free access to powerful LLMs (GPT-4o, Llama 3.1, etc.) using only a GitHub account.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web Automation**: Playwright
- **AI Integration**: GitHub Models
- **UI**: React

## Getting Started

### Prerequisites

- Node.js
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/eswarchandravidyasagar/automata-agent.git
    cd automata-agent
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    This project uses GitHub Models for free access to powerful LLMs.
    
    a. Copy the example environment file:
    ```bash
    cp .env.example .env.local
    ```
    b. Follow the instructions in `SETUP.md` to generate a free GitHub Personal Access Token.

    c. Add your token to `.env.local`:
    ```env
    GITHUB_TOKEN="your-github-token-here"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000` or the next available port.

## Usage

1.  Navigate to the running application in your browser.
2.  Select **Automation** from the sidebar.
3.  Provide the **Target Website URL**.
4.  Describe your **Automation Goal** in the text area.
5.  Click **Run Automation** and monitor the agent's progress in the activity log.

### Example Goals

- `Go to https://news.ycombinator.com/ and extract the top 10 story headlines, then export them to a CSV file named "headlines.csv".`
- `Go to github.com, search for the repository "microsoft/playwright", and extract its star count.`
- `On eswarchandravidyasagar.github.io, click the "View My Work" button and create a report of all the project titles.`

## Key Architectural Files

-   `src/lib/agent-service.ts`: The core of the agent. Defines its tools, logic for planning and execution, and the system prompts that determine its capabilities.
-   `src/app/api/automation/create/route.ts`: The backend endpoint that initializes and runs the `AgentService`.
-   `src/components/automation-agent-interface.tsx`: The primary UI for interacting with the agent.
-   `src/components/agent-action-view.tsx`: The component that renders the agent's step-by-step thought process and actions.
-   `src/types/index.ts`: Contains all TypeScript type definitions for the project.
