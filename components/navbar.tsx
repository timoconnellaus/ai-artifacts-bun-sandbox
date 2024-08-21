import "core-js/features/object/group-by.js";
import Link from "next/link";
import Image from "next/image";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { GithubIcon, LogOut, Settings2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SandboxTemplate } from "@/lib/types";
import { LLMModel, LLMModelConfig } from "@/lib/models";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function NavBar({
  session,
  showLogin,
  signOut,
  selectedTemplate,
  onSelectedTemplateChange,
  models,
  languageModel,
  onLanguageModelChange,
  apiKeyConfigurable,
}: {
  session: Session | null;
  showLogin: () => void;
  signOut: () => void;
  selectedTemplate: SandboxTemplate;
  onSelectedTemplateChange: (template: SandboxTemplate) => void;
  models: LLMModel[];
  languageModel: LLMModelConfig;
  apiKeyConfigurable: boolean;
  onLanguageModelChange: (config: LLMModelConfig) => void;
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white">
      <div className="flex px-4 py-2">
        <div className="flex flex-1 items-center">
          <Link href="/" className="flex items-center gap-2" target="_blank">
            <h1 className="whitespace-pre text-[#3d3929]">AI Artifacts</h1>
          </Link>
        </div>
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                "https://github.com/timoconnellaus/ai-artifacts-bun-sandbox",
                "_blank",
              )
            }
          >
            <GithubIcon className="mr-2 h-4 w-4" /> Star on GitHub
          </Button>
          <Separator orientation="vertical" />
          {session ? (
            <div className="flex items-center">
              <span className="text-sm text-[#3d3929] font-medium">
                {session.user.email}
              </span>
              <Button variant="link" size="icon" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="text-sm text-[#3d3929] font-medium px-8 py-2"
              onClick={showLogin}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-end border-b border-gray-300 px-4 py-2 space-x-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="template">Persona</Label>
          <Select
            name="template"
            defaultValue={selectedTemplate}
            onValueChange={onSelectedTemplateChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Persona</SelectLabel>
                <SelectItem value="shadcn-component">
                  Shadcn component
                </SelectItem>
                <SelectItem value="daisyui-component">
                  DaisyUI component
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="languageModel">Model</Label>
          <Select
            name="languageModel"
            defaultValue={languageModel.model}
            onValueChange={(e) => onLanguageModelChange({ model: e })}
          >
            <SelectTrigger className="w-[200px] whitespace-nowrap">
              <SelectValue placeholder="Language model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(
                Object.groupBy(models, ({ provider }) => provider),
              ).map(([provider, models]) => (
                <SelectGroup key={provider}>
                  <SelectLabel>{provider}</SelectLabel>
                  {models?.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center space-x-2">
                        <Image
                          className="flex"
                          src={`/thirdparty/logos/${model.providerId}.svg`}
                          alt={model.provider}
                          width={16}
                          height={16}
                        />
                        <span>{model.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {apiKeyConfigurable && (
              <>
                <div className="flex flex-col gap-1.5 px-2 py-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    name="apiKey"
                    type="text"
                    placeholder="Auto"
                    required={true}
                    defaultValue={languageModel.apiKey}
                    onChange={(e) =>
                      onLanguageModelChange({ apiKey: e.target.value })
                    }
                    className="text-sm"
                  />
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <div className="flex gap-1.5 px-2 py-2 items-center space-x-4">
              <span className="text-sm flex-1">Output tokens</span>
              <Input
                type="number"
                defaultValue={languageModel.maxTokens}
                min={50}
                max={10000}
                step={1}
                className="h-6 rounded-sm w-[84px] text-xs text-center tabular-nums"
                placeholder="Auto"
                onChange={(e) =>
                  onLanguageModelChange({
                    maxTokens: parseFloat(e.target.value) || undefined,
                  })
                }
              />
            </div>
            <div className="flex gap-1.5 px-2 py-2 items-center space-x-4">
              <span className="text-sm flex-1">Temperature</span>
              <Input
                type="number"
                defaultValue={languageModel.temperature}
                min={0}
                max={5}
                step={0.01}
                className="h-6 rounded-sm w-[84px] text-xs text-center tabular-nums"
                placeholder="Auto"
                onChange={(e) =>
                  onLanguageModelChange({
                    temperature: parseFloat(e.target.value) || undefined,
                  })
                }
              />
            </div>
            <div className="flex gap-1.5 px-2 py-2 items-center space-x-4">
              <span className="text-sm flex-1">Top P</span>
              <Input
                type="number"
                defaultValue={languageModel.topP}
                min={0}
                max={1}
                step={0.01}
                className="h-6 rounded-sm w-[84px] text-xs text-center tabular-nums"
                placeholder="Auto"
                onChange={(e) =>
                  onLanguageModelChange({
                    topP: parseFloat(e.target.value) || undefined,
                  })
                }
              />
            </div>
            <div className="flex gap-1.5 px-2 py-2 items-center space-x-4">
              <span className="text-sm flex-1">Top K</span>
              <Input
                type="number"
                defaultValue={languageModel.topK}
                min={0}
                max={500}
                step={1}
                className="h-6 rounded-sm w-[84px] text-xs text-center tabular-nums"
                placeholder="Auto"
                onChange={(e) =>
                  onLanguageModelChange({
                    topK: parseFloat(e.target.value) || undefined,
                  })
                }
              />
            </div>
            <div className="flex gap-1.5 px-2 py-2 items-center space-x-4">
              <span className="text-sm flex-1">Frequence penalty</span>
              <Input
                type="number"
                defaultValue={languageModel.frequencyPenalty}
                min={0}
                max={2}
                step={0.01}
                className="h-6 rounded-sm w-[84px] text-xs text-center tabular-nums"
                placeholder="Auto"
                onChange={(e) =>
                  onLanguageModelChange({
                    frequencyPenalty: parseFloat(e.target.value) || undefined,
                  })
                }
              />
            </div>
            <div className="flex gap-1.5 px-2 py-2 items-center space-x-4">
              <span className="text-sm flex-1">Presence penalty</span>
              <Input
                type="number"
                defaultValue={languageModel.presencePenalty}
                min={0}
                max={2}
                step={0.01}
                className="h-6 rounded-sm w-[84px] text-xs text-center tabular-nums"
                placeholder="Auto"
                onChange={(e) =>
                  onLanguageModelChange({
                    presencePenalty: parseFloat(e.target.value) || undefined,
                  })
                }
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
