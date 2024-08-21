# AI Artifacts - Open Source Anthropic Claude Artifacts
This app is an open source version of [Anthropic's Artifacts UI](https://www.anthropic.com/news/claude-3-5-sonnet) in their [Claude chat app](https://claude.ai/).

This app is forked from https://github.com/e2b-dev/ai-artifacts and replaces the e2b-dev/code-interpreter sandbox with a custom one that uses [Bun](https://bun.sh/) transpiler.

![Preview](<img width="1721" alt="image" src="https://github.com/user-attachments/assets/f15b3a99-0e4c-4069-bf74-1652ae5d2806">)

## Features
- [Anthropic Claude Sonnet 3.5](https://www.anthropic.com/) model for AI code generation
- Uses the Bun transpiler to transpile TSX to JS
- Uses @mhsdesign/jit-browser-tailwindcss to generate tailwind css at run time
- Has all shadcn components available
- [Vercel AI SDK](https://sdk.vercel.ai/docs/introduction) for tool calling and streaming responses from the model

### 1. Install dependencies
```sh
bun install
```

### 2. Set API keys
Create a `.env.local` file and set the following:
```sh
ANTHROPIC_API_KEY="your-anthropic-api-key"
```
Note: You can enter your API key in the UI instead of setting it in the `.env.local` file.

### 3. Run
```sh
bun run start-all
```
