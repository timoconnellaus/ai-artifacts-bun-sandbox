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

  const {
    messages,
    userID,
    template,
    model,
    config,
    apiKey,
  }: {
    messages: CoreMessage[];
    userID: string;
    template: SandboxTemplate;
    model: LLMModel;
    config: LLMModelConfig;
    apiKey: string;
  } = await req.json();
  console.log("userID", userID);
  console.log("template", template);
  console.log("apiKey", apiKey);
  console.log("model", model);
  console.log("config", config);

  const {
    model: modelNameString,
    apiKey: modelApiKey,
    ...modelConfig
  } = config;
  const modelClient = getModelClient(model, config);

  let data: StreamData = new StreamData();
  let result: StreamTextResult<any>;

  if (template === SandboxTemplate.ShadcnComponent) {
    result = await streamText({
      model: modelClient as LanguageModelV1,
      tools: {
        writeCodeToPageTsx: tool({
          description:
            "Renders a TSX component to HTML. You can use tailwind classes and shadcn components.",
          parameters: z.object({
            title: z
              .string()
              .describe("Short title (5 words max) of the artifact."),
            description: z
              .string()
              .describe("Short description (10 words max) of the artifact."),
            code: z.string().describe("The TSX code to write."),
          }),
          async execute({ code }) {
            data.append({
              tool: "renderTsxToHtml",
              state: "running",
            });

            // console.log(code);
            // console.log("WILL WRITE");
            // const response = await fetch(`http://localhost:3001/get-url`, {
            //   method: "POST",
            //   body: code,
            // });
            // const { url } = await response.json();
            // console.log("WROTE", { url });

            data.append({
              tool: "renderTsxToHtml",
              state: "complete",
            });

            return {
              tsx: code,
              template,
            };
          },
        }),
      },
      system: shadcnPrompt,
      messages,
      ...modelConfig,
    });
  } else {
    throw new Error("Invalid sandbox template");
  }

  const stream = result.toAIStream({
    async onFinal() {
      await data.close();
    },
  });

  return new StreamingTextResponse(stream, {}, data);
}
