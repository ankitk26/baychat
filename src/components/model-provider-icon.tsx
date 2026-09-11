import type { JSX } from "react";
import AnthropicIcon from "./anthropic-icon";
import ByteDanceIcon from "./byte-dance-icon";
import DeepSeekIcon from "./deepseek-icon";
import GeminiIcon from "./gemini-icon";
import MiniMaxIcon from "./minimax-icon";
import MoonShotIcon from "./moonshot-icon";
import OpenAIIcon from "./open-ai-icon";
import OpenRouterIcon from "./open-router-icon";
import XAIIcon from "./xai-icon";
import XiaomiIcon from "./xiaomi-icon";
import ZaiIcon from "./zai-icon";

type Props = {
	provider: string;
};

const iconMap = new Map<string, () => JSX.Element>([
	["google", GeminiIcon],
	["openai", OpenAIIcon],
	["anthropic", AnthropicIcon],
	["xai", XAIIcon],
	["deepseek", DeepSeekIcon],
	["moonshot", MoonShotIcon],
	["zai", ZaiIcon],
	["minimax", MiniMaxIcon],
	["openrouter", OpenRouterIcon],
	["xiaomi", XiaomiIcon],
	["byteDance", ByteDanceIcon],
]);

export default function ModelProviderIcon({ provider }: Props) {
	const Icon = iconMap.get(provider) ?? DeepSeekIcon;
	return <Icon />;
}
