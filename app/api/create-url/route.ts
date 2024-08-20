import { z } from "zod";
import {
  type CoreMessage,
  StreamingTextResponse,
  StreamData,
  streamText,
  StreamTextResult,
  tool,
} from "ai";

import { LanguageModelV1 } from "@ai-sdk/provider";
import ratelimit from "@/lib/ratelimit";
import { runPython, writeToPage, writeToApp } from "@/lib/sandbox";
import { SandboxTemplate } from "@/lib/types";
import { prompt as shadcnPrompt } from "@/lib/shadcn-prompt";
import { getModelClient } from "@/lib/models";
import { LLMModel, LLMModelConfig } from "@/lib/models";

export interface ServerMessage {
  role: "user" | "assistant" | "function";
  content: string;
}

export const maxDuration = 60;

const rateLimitMaxRequests = 5;
const ratelimitWindow = "1m";

export async function POST(req: Request) {
  const limit = await ratelimit(req, rateLimitMaxRequests, ratelimitWindow);
  if (limit) {
    return new Response("You have reached your request limit for the day.", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.amount.toString(),
        "X-RateLimit-Remaining": limit.remaining.toString(),
        "X-RateLimit-Reset": limit.reset.toString(),
      },
    });
  }
}
