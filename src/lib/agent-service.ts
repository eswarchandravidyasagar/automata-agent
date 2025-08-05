import { chromium, Browser, Page } from 'playwright';
import { callGitHubModel } from './github-models';

// Define the structure for the tools the AI can use
const tools = [
  {
    name: 'navigate',
    description: 'Navigate to a URL.',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to navigate to.' },
      },
      required: ['url'],
    },
  },
  {
    name: 'click',
    description: 'Click on an element on the page.',
    parameters: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'A Playwright selector. Can be a standard CSS selector (e.g., `#my-id`) or a text-based selector (e.g., `text=Log In`).' },
      },
      required: ['selector'],
    },
  },
  {
    name: 'type',
    description: 'Type text into an input field.',
    parameters: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'A Playwright selector for the input field. For example: `input[name="username"]`.' },
        text: { type: 'string', description: 'The text to type.' },
      },
      required: ['selector', 'text'],
    },
  },
  {
    name: 'extractText',
    description: 'Extract text content from an element.',
    parameters: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'A Playwright selector for the element to extract text from. For example: `.price` or `text=Total`.' },
      },
      required: ['selector'],
    },
  },
  {
    name: 'extractAllText',
    description: 'Extract text content from ALL elements matching a selector. Returns an array of strings.',
    parameters: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'A Playwright selector for the elements to extract text from. For example: `.news-headline`.' },
        limit: { type: 'number', description: 'Optional. The maximum number of items to extract.' },
      },
      required: ['selector'],
    },
  },
  {
    name: 'hover',
    description: 'Hover over an element to reveal hidden content or trigger an action.',
    parameters: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'A Playwright selector for the element to hover over.' },
      },
      required: ['selector'],
    },
  },
  {
    name: 'press',
    description: "Simulate a key press on an element or the page (e.g., 'Enter', 'Escape').",
    parameters: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'Optional. A Playwright selector for an element to focus before pressing the key.' },
        key: { type: 'string', description: "The key to press (e.g., 'Enter', 'ArrowDown', 'a')." },
      },
      required: ['key'],
    },
  },
  {
    name: 'waitForTimeout',
    description: 'Wait for a specified number of milliseconds. Use sparingly.',
    parameters: {
      type: 'object',
      properties: {
        timeout: { type: 'number', description: 'The number of milliseconds to wait.' },
      },
      required: ['timeout'],
    },
  },
  {
    name: 'getAttribute',
    description: "Get an attribute's value from an element (e.g., 'href' from a link).",
    parameters: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'A Playwright selector for the element.' },
        attribute: { type: 'string', description: 'The name of the attribute to get.' },
      },
      required: ['selector', 'attribute'],
    },
  },
  {
    name: 'scroll',
    description: "Scroll the page 'up', 'down', 'left', or 'right' by a specified amount in pixels.",
    parameters: {
      type: 'object',
      properties: {
        direction: { type: 'string', enum: ['up', 'down', 'left', 'right'], description: 'The direction to scroll.' },
        pixels: { type: 'number', description: 'The number of pixels to scroll.' },
      },
      required: ['direction', 'pixels'],
    },
  },
  {
    name: 'finish',
    description: 'Finish the automation and optionally perform a final action on the last extracted data.',
    parameters: {
      type: 'object',
      properties: {
        post_action: { type: 'string', enum: ['report', 'csv'], description: 'Optional action to perform on the last result.' },
        title: { type: 'string', description: 'The title for the report (if post_action is "report").' },
        filename: { type: 'string', description: 'The filename for the CSV file (if post_action is "csv").' },
      },
    },
  },
];

export class AgentService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private goal: string;
  private sendEvent: (event: any) => void;

  constructor(goal: string, sendEvent: (event: any) => void) {
    this.goal = goal;
    this.sendEvent = sendEvent;
  }

  async run(url: string) {
    this.sendEvent({ type: 'thought', content: 'Launching browser...' });
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
    await this.page.goto(url);
    this.sendEvent({ type: 'thought', content: `Navigated to ${url}. Generating a plan...` });

    let lastPlan: any[] = [];
    let lastError: string | null = null;
    let failedStepForRetry: any | null = null;
    const maxRetries = 3;

    for (let retry = 0; retry < maxRetries; retry++) {
      this.sendEvent({ type: 'thought', content: `Generating a plan (Attempt ${retry + 1} of ${maxRetries})...` });
      
      const pageContent = await this.getPageContent();
      const plan = await this.generatePlan(pageContent, lastError, failedStepForRetry);

      if (plan.length === 0 || plan[0].toolName === 'finish') {
        this.sendEvent({ type: 'thought', content: 'Could not generate a new plan. Finishing.' });
        break;
      }
      
      this.sendEvent({ type: 'thought', content: `Plan generated. Executing ${plan.length} steps...` });
      lastPlan = plan;

      const { success, error, failedStep } = await this.executePlan(plan);

      if (success) {
        this.sendEvent({ type: 'thought', content: 'Plan executed successfully.' });
        break;
      } else {
        lastError = error;
        failedStepForRetry = failedStep;
        this.sendEvent({ type: 'thought', content: `Plan failed: ${error}. Retrying...` });
      }
    }
    
    await this.close();
  }

  private async getPageContent(): Promise<string> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const bodyHtml = await this.page.evaluate(() => {
      const tagsToRemove = ['script', 'style', 'svg', 'noscript', 'link', 'meta', 'header', 'nav', 'footer'];
      tagsToRemove.forEach(tag => {
        Array.from(document.body.getElementsByTagName(tag)).forEach(el => el.remove());
      });
      return document.body.innerHTML;
    });

    // Clean up excessive whitespace, remove inline event handlers, and limit the content length
    const cleanedHtml = bodyHtml
      .replace(/<([a-z][a-z0-9]*)[^>]*\s(on\w+)=(['"])[^'"]*\3[^>]*>/gi, '<$1>') // Remove inline event handlers
      .replace(/\s+/g, ' ')
      .replace(/> </g, '><')
      .trim();
      
    const truncatedHtml = cleanedHtml.slice(0, 4000); // Give it a larger context

    return `Current URL: ${this.page.url()}\n\n## Page HTML Body\n${truncatedHtml}`;
  }
  
  private async generatePlan(pageContent: string, lastError: string | null, failedStep: any | null): Promise<any[]> {
    let systemPrompt = `You are an Advanced Automation Engineer. Your goal is to achieve: "${this.goal}".
Based on the provided HTML of the page, generate a JSON array of tool calls to execute.

You have access to the following tools:
${JSON.stringify(tools.map(({ name, description, parameters }) => ({ name, description, parameters })), null, 2)}

**Selector Guidance:**
- Use standard CSS selectors: \`#id\`, \`.class\`, \`[attribute=value]\`
- Use text selectors for content: \`text="Your Text Here"\`
- To be more specific, combine selectors like \`button:has-text("Your Text Here")\`.
- **Do not** invent new syntax like \`button:text=...\`. Stick to valid Playwright selectors.

Your response must be a valid JSON array of tool calls. The LAST step MUST be the "finish" tool.
Your response MUST be only the JSON array, with no other text, comments, or markdown formatting.
**IMPORTANT**: In JSON strings, all backslashes \`\\\` must be escaped. For example, to use the regex \`\\d+\`, you must write it as \`"\\\\d+"\`.

Here are some examples of good plans:

[
  {
    "toolName": "extractAllText",
    "args": { "selector": "h2.article-title", "limit": 10 }
  },
  {
    "toolName": "finish",
    "args": { "post_action": "csv", "filename": "headlines.csv" }
  }
]`;

    if (lastError && failedStep) {
      systemPrompt += `\n\nThe previous plan failed with this error: "${lastError}".
The failing step was: \`${JSON.stringify(failedStep)}\`.
**DO NOT** repeat this exact step. You MUST devise a new strategy.
A timeout error on a selector usually means the element is not yet visible. Look for a button or link that might need to be clicked first to reveal the element you are trying to interact with.
Please analyze the error and the current page HTML, and generate a new, corrected plan.`;
    } else if (lastError) {
      systemPrompt += `\n\nThe previous attempt failed with this error: "${lastError}".
Please analyze the error and the current page HTML, and generate a new, corrected plan.`;
    }

    const userPrompt = `Current page HTML:\n${pageContent}`;

    const response = await callGitHubModel('gpt-4o-mini', [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    try {
      // More robustly find the JSON array in the response
      const startIndex = response.indexOf('[');
      const endIndex = response.lastIndexOf(']');
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error("No valid JSON array found in the AI's response.");
      }

      const jsonString = response.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Raw AI response that failed to parse:", response);
      this.sendEvent({ type: 'error', error: 'Failed to parse AI-generated plan.' });
      return [{ toolName: 'finish', args: {} }];
    }
  }
  
  private async executePlan(plan: any[]): Promise<{ success: boolean; error: string | null; failedStep: any | null }> {
    let lastResult: any = null;
    for (const step of plan) {
      try {
        const { toolName, args } = step;

        if (toolName === 'finish') {
          this.sendEvent({ type: 'thought', content: `Finishing automation.` });

          if (args.post_action && lastResult) {
            if (args.post_action === 'report' && args.title) {
              this._generateReport(lastResult, args.title);
            } else if (args.post_action === 'csv' && args.filename) {
              this._generateCSV(lastResult, args.filename);
            }
          }

          return { success: true, error: null, failedStep: null };
        }
        
        const result = await this.executeStep(toolName, args);
        if (result) {
          lastResult = result;
        }

      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { success: false, error: `Step ${step.toolName} failed: ${errorMessage}`, failedStep: step };
      }
    }
    return { success: true, error: null, failedStep: null };
  }

  private async executeStep(toolName: string, args: any): Promise<any | null> {
    if (!this.page) throw new Error('Page not initialized');
    
    this.sendEvent({ type: 'thought', content: `Executing tool: ${toolName} with args: ${JSON.stringify(args)}` });

    switch (toolName) {
      case 'navigate':
        await this.page.goto(args.url);
        break;
      case 'click':
        await this.page.click(args.selector);
        break;
      case 'type':
        await this.page.fill(args.selector, args.text);
        break;
      case 'extractText': {
        const text = await this.page.textContent(args.selector);
        this.sendEvent({ type: 'thought', content: `Extracted text: ${text}` });
        const result = { extractedText: text };
        this.sendEvent({ type: 'result', content: result });
        return result;
      }
      case 'extractAllText': {
        let texts = await this.page.locator(args.selector).allTextContents();
        if (args.limit) {
          texts = texts.slice(0, args.limit);
        }
        this.sendEvent({ type: 'thought', content: `Extracted ${texts.length} items.` });
        const result = { extractedTexts: texts };
        this.sendEvent({ type: 'result', content: result });
        return result;
      }
      case 'hover':
        await this.page.hover(args.selector);
        break;
      case 'press':
        if (args.selector) {
          await this.page.press(args.selector, args.key);
        } else {
          await this.page.keyboard.press(args.key);
        }
        break;
      case 'waitForTimeout':
        await this.page.waitForTimeout(args.timeout);
        break;
      case 'getAttribute': {
        const attribute = await this.page.getAttribute(args.selector, args.attribute);
        this.sendEvent({ type: 'thought', content: `Extracted attribute: ${attribute}` });
        const result = { attributeValue: attribute };
        this.sendEvent({ type: 'result', content: result });
        return result;
      }
      case 'scroll':
        await this.page.evaluate(async ({ direction, pixels }) => {
          let x = 0, y = 0;
          if (direction === 'down') y = pixels;
          else if (direction === 'up') y = -pixels;
          else if (direction === 'right') x = pixels;
          else if (direction === 'left') x = -pixels;
          window.scrollBy(x, y);
        }, { direction: args.direction, pixels: args.pixels });
        break;
    }
    
    // For tools that don't return a value
    return null;
  }
  
  private _generateReport(data: any, title: string) {
    let reportContent = `# ${title}\n\n`;
    const dataToProcess = data.extractedTexts || data.extractedText || data;

    if (Array.isArray(dataToProcess)) {
      if (dataToProcess.length > 0 && typeof dataToProcess[0] === 'object' && dataToProcess[0] !== null) {
        const headers = Object.keys(dataToProcess[0]);
        reportContent += `| ${headers.join(' | ')} |\n`;
        reportContent += `| ${headers.map(() => '---').join(' | ')} |\n`;
        dataToProcess.forEach((row: any) => {
          reportContent += `| ${headers.map(h => row[h]).join(' | ')} |\n`;
        });
      } else {
        reportContent += dataToProcess.map((item: any) => `- ${item}`).join('\n');
      }
    } else if (typeof dataToProcess === 'object' && dataToProcess !== null) {
      for (const [key, value] of Object.entries(dataToProcess)) {
        reportContent += `**${key}:** \`\`\`\n${JSON.stringify(value, null, 2)}\n\`\`\`\n\n`;
      }
    } else {
      reportContent += String(dataToProcess);
    }
    this.sendEvent({ type: 'thought', content: 'Generated a report.' });
    this.sendEvent({ type: 'result', content: { report: reportContent } });
  }

  private _generateCSV(data: any, filename: string) {
    const dataForCsv = data.extractedTexts || (Array.isArray(data) ? data : null);

    if (!dataForCsv || !Array.isArray(dataForCsv) || dataForCsv.length === 0) {
      this.sendEvent({ type: 'error', error: 'CSV export requires a non-empty array.' });
      return;
    }

    let csvContent: string;
    if (typeof dataForCsv[0] === 'object' && dataForCsv[0] !== null) {
      const headers = Object.keys(dataForCsv[0]);
      csvContent = headers.join(',') + '\n';
      dataForCsv.forEach((row: any) => {
        const values = headers.map(header => {
          const value = String(row[header] ?? '');
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        csvContent += values.join(',') + '\n';
      });
    } else {
      csvContent = 'data\n' + dataForCsv.map(item => `"${String(item ?? '')}"`).join('\n');
    }

    this.sendEvent({ type: 'thought', content: `Prepared CSV file: ${filename}` });
    this.sendEvent({
      type: 'file',
      content: {
        filename: filename,
        mimeType: 'text/csv',
        data: csvContent,
      },
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
} 