import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini client helper.
const rawApiKey = process.env.GEMINI_API_KEY;
const apiKey = rawApiKey ? rawApiKey.replace(/^["']|["']$/g, "").trim() : undefined;

if (apiKey) {
  console.log(`[Gemini Init] Loaded API Key: ${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`);
} else {
  console.log("[Gemini Init] No API key detected. Running in mock fallback mode.");
}

let ai: GoogleGenerativeAI | null = null;
if (apiKey) {
  ai = new GoogleGenerativeAI(apiKey);
}

export interface GeneratedPlan {
  name: string;
  description: string;
  milestones: Array<{
    title: string;
    description: string;
    order: number;
    tasks: Array<{
      title: string;
      description: string;
      priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      estimatedHours: number;
      dayOffset: number; // Day offset from project start date to schedule due dates
    }>;
  }>;
}

/**
 * Uses Gemini to generate a structured project plan based on a description prompt.
 */
export async function generateProjectPlan(
  promptText: string,
  durationWeeks: number = 4
): Promise<GeneratedPlan> {
  if (!ai) {
    console.warn("⚠️ GEMINI_API_KEY is missing in environmental variables. Running in Mock fallback mode.");
    return getMockProjectPlan(promptText, durationWeeks);
  }

  const systemInstruction = `You are an expert technical project manager and software architect.
Given a project prompt, decompose it into a structured project plan.
You MUST respond with a JSON object matching the following structure:
{
  "name": "Project Name (concise)",
  "description": "Brief project description outlining core goals",
  "milestones": [
    {
      "title": "Milestone Title (e.g. Phase 1: Core Setup)",
      "description": "Short explanation of what this milestone accomplishes",
      "order": 1,
      "tasks": [
        {
          "title": "Task Title (specific, actionable)",
          "description": "Details on implementation requirements",
          "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
          "estimatedHours": number (integer representing estimated effort, e.g. 2, 4, 8, 16),
          "dayOffset": number (integer offset from project start date, e.g. 2 means due on day 2. Spread these out logically up to the total timeline limit)
        }
      ]
    }
  ]
}

Decompose the project logically into 2 to 4 milestones, with 3 to 6 tasks per milestone.
Ensure estimatedHours are realistic, ranging from 2 to 24 hours.
Spread the task dayOffsets evenly across the total target duration of ${durationWeeks} weeks (i.e. up to ${durationWeeks * 7} days).
Do not output markdown code blocks or any text other than the raw JSON structure.`;

  try {
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction,
    });

    const result = await model.generateContent(
      `Generate a project plan for: "${promptText}". Target timeline is ${durationWeeks} weeks.`
    );

    const text = result.response.text();
    const parsed = JSON.parse(text) as GeneratedPlan;
    
    // Ensure basic validity
    if (!parsed.name || !Array.isArray(parsed.milestones)) {
      throw new Error("Invalid structure returned by AI");
    }

    return parsed;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

/**
 * Handles Project Assistant chat queries. Compiles tasks & milestones as system context.
 */
export async function chatWithProject(
  projectName: string,
  projectDescription: string | null,
  milestones: any[],
  tasks: any[],
  messages: Array<{ role: "user" | "model"; content: string }>
): Promise<string> {
  if (!ai) {
    return "GEMINI_API_KEY is not configured. Please add it to your `.env` file to enable the AI Insights Assistant.";
  }

  // Build a concise textual representation of the project state to feed to the context window
  const projectState = `
Project Name: ${projectName}
Project Description: ${projectDescription || "None"}

Milestones:
${milestones.map((m, idx) => `[Milestone ${idx + 1}] ${m.title}: ${m.description || "No description"}`).join("\n")}

Tasks:
${tasks.map(t => {
  const milestoneName = milestones.find(m => m.id === t.milestoneId)?.title || "General";
  return `- [${t.status}] ${t.title} (${t.priority} priority, Estimated: ${t.estimatedHours || 0}h, Milestone: ${milestoneName}, Assignee: ${t.assigneeName || "Unassigned"}, Due: ${t.dueDate || "None"})`;
}).join("\n")}
`;

  const systemInstruction = `You are Worklyn Copilot, an AI Project Health Assistant.
You are helping the user manage and analyze the following project:
${projectState}

Use this project context to provide detailed, actionable, and analytical feedback.
Answer the user's questions accurately based on this data.
If tasks are overdue, point it out. Highlight high-priority tasks that are uncompleted, identify resource allocation risks (e.g. too many tasks on one person or high estimated hours), and help summarize overall project progress.
Keep responses concise, professional, and visually clear using markdown formatting.`;

  try {
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
    });

    // Format chat history for @google/generative-ai.
    // Filter messages to match alternating user/model roles required by SDK.
    let history = messages.slice(0, -1).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    // Find the first index that has role 'user' because Gemini chat history must start with 'user'
    const firstUserIdx = history.findIndex(h => h.role === "user");
    if (firstUserIdx !== -1) {
      history = history.slice(firstUserIdx);
    } else {
      history = [];
    }

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);

    return result.response.text();
  } catch (error: any) {
    console.error("Gemini Chat API error:", error);
    return `Gemini Chat Error: ${error.message || error}`;
  }
}

/**
 * Fallback mock generator in case the API key is not configured or fails.
 */
function getMockProjectPlan(promptText: string, durationWeeks: number): GeneratedPlan {
  const cleanPrompt = promptText.trim().replace(/^Build an? /i, "");
  const projectName = cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1);

  return {
    name: projectName,
    description: `A planned initiative to develop and launch: ${projectName}. Est. duration: ${durationWeeks} weeks.`,
    milestones: [
      {
        title: "Milestone 1: Core Setup & System Architecture",
        description: "Initialize database schema, setup environment, and configure primary services.",
        order: 1,
        tasks: [
          {
            title: "Setup boilerplate & project configuration",
            description: "Initialize workspace, install dependencies, and configure linters.",
            priority: "HIGH",
            estimatedHours: 4,
            dayOffset: 2,
          },
          {
            title: "Design and implement database schema",
            description: "Define entities, relationships, indexes and run initial Prisma migrations.",
            priority: "URGENT",
            estimatedHours: 6,
            dayOffset: 3,
          },
          {
            title: "Configure user authentication & role access",
            description: "Setup auth adapters, session management, and routing guards.",
            priority: "HIGH",
            estimatedHours: 8,
            dayOffset: 5,
          },
        ],
      },
      {
        title: "Milestone 2: Core Workflows & Logic",
        description: "Implement primary features and workflows requested in the specifications.",
        order: 2,
        tasks: [
          {
            title: "Build user interface & core components",
            description: "Create primary dashboard screens, forms, and responsive list views.",
            priority: "MEDIUM",
            estimatedHours: 12,
            dayOffset: 10,
          },
          {
            title: "Implement backend controllers & service APIs",
            description: "Write API request validation, business logic handlers, and error boundaries.",
            priority: "HIGH",
            estimatedHours: 16,
            dayOffset: 14,
          },
        ],
      },
      {
        title: "Milestone 3: Deployment & Testing",
        description: "Verify correct functioning, build production targets, and release application.",
        order: 3,
        tasks: [
          {
            title: "Conduct integration tests & resolve issues",
            description: "Write automated tests for core API flows and perform manual sanity checks.",
            priority: "MEDIUM",
            estimatedHours: 8,
            dayOffset: 20,
          },
          {
            title: "Configure environment vars & deploy to production",
            description: "Set up production variables, configure hosting environment, and deploy initial build.",
            priority: "URGENT",
            estimatedHours: 4,
            dayOffset: 24,
          },
        ],
      },
    ],
  };
}
