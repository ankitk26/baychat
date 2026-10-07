import { useConvexMutation } from "@convex-dev/react-query";
import { FloppyDiskIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useOpenRouterPreference } from "~/hooks/use-openrouter-preference";
import { useProviderApiKeyStatus } from "~/hooks/use-provider-api-key-status";
import { isBrowser } from "~/lib/environment";
import { STORAGE_KEYS } from "~/lib/storage-keys";
import { apiKeyPreferencesStoreActions } from "~/stores/persisted-api-keys-store";
import { type ApiKeys, defaultApiKeys, type Provider } from "~/types";
import ApiKeyInput from "./api-key-input";
import ApiKeyOpenRouter from "./api-key-open-router";
import { Button } from "./ui/button";
import { TabsContent } from "./ui/tabs";

const keysForm: {
	provider: Provider;
	label: string;
	placeholder: string;
	keyLink: string;
}[] = [
	{
		provider: "openrouter",
		label: "OpenRouter",
		placeholder: "sk-or-...",
		keyLink: "https://openrouter.ai/settings/keys",
	},
	{
		provider: "openai",
		label: "OpenAI",
		placeholder: "sk-...",
		keyLink: "https://platform.openai.com/api-keys",
	},
	{
		provider: "anthropic",
		label: "Anthropic",
		placeholder: "sk-ant-...",
		keyLink: "https://console.anthropic.com/settings/keys",
	},
	{
		provider: "gemini",
		label: "Gemini",
		placeholder: "AI...",
		keyLink: "https://aistudio.google.com/app/apikey",
	},
	{
		provider: "xai",
		label: "xAI",
		placeholder: "xai...",
		keyLink: "https://console.x.ai/",
	},
];

const legacySettingsSchema = z.object({
	persistedApiKeys: z
		.object({
			gemini: z.string().optional(),
			openai: z.string().optional(),
			anthropic: z.string().optional(),
			openrouter: z.string().optional(),
			xai: z.string().optional(),
		})
		.optional(),
});

export default function ApiKeysForm() {
	const [apiKeys, setApiKeys] = useState<ApiKeys>(defaultApiKeys);
	const [useOpenRouter, setUseOpenRouter] = useState(false);
	const [initialUseOpenRouter, setInitialUseOpenRouter] = useState(false);
	const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
	const legacyMigrationStarted = useRef(false);
	const preferenceMigrationStarted = useRef(false);
	const {
		status,
		maskedHints,
		isLoading: isLoadingStatus,
	} = useProviderApiKeyStatus();
	const {
		value: persistedUseOpenRouter,
		hasProfilePreference,
		isLoading: isLoadingPreference,
	} = useOpenRouterPreference();
	const saveOpenRouterPreference = useMutation({
		mutationFn: useConvexMutation(api.userSettings.setUseOpenRouter),
	});
	const saveApiKey = useMutation({
		mutationFn: useConvexMutation(api.providerApiKeys.save),
	});
	const removeApiKey = useMutation({
		mutationFn: useConvexMutation(api.providerApiKeys.remove),
	});

	useEffect(() => {
		setUseOpenRouter(persistedUseOpenRouter);
		setInitialUseOpenRouter(persistedUseOpenRouter);
	}, [persistedUseOpenRouter]);

	useEffect(() => {
		if (
			isLoadingPreference ||
			hasProfilePreference ||
			preferenceMigrationStarted.current
		)
			return;

		preferenceMigrationStarted.current = true;
		apiKeyPreferencesStoreActions.setPersistedUseOpenRouter(
			persistedUseOpenRouter,
		);
		apiKeyPreferencesStoreActions.preserveLocalPreference(
			persistedUseOpenRouter,
		);
		void saveOpenRouterPreference
			.mutateAsync({ value: persistedUseOpenRouter })
			.catch(() => {
				toast.error(
					"Could not sync the OpenRouter preference to your account.",
				);
			});
	}, [
		hasProfilePreference,
		isLoadingPreference,
		persistedUseOpenRouter,
		saveOpenRouterPreference.mutateAsync,
	]);

	useEffect(() => {
		if (!isBrowser() || isLoadingStatus || legacyMigrationStarted.current)
			return;
		const legacyStorage = localStorage.getItem(STORAGE_KEYS.apiKeys);
		if (!legacyStorage) return;

		legacyMigrationStarted.current = true;
		let parsed: ReturnType<typeof legacySettingsSchema.safeParse>;
		try {
			parsed = legacySettingsSchema.safeParse(JSON.parse(legacyStorage));
		} catch {
			localStorage.removeItem(STORAGE_KEYS.apiKeys);
			return;
		}
		if (!parsed.success) {
			localStorage.removeItem(STORAGE_KEYS.apiKeys);
			return;
		}

		const legacyKeys = parsed.data.persistedApiKeys ?? {};
		const keysToMigrate = keysForm.flatMap(({ provider }) => {
			const value = legacyKeys[provider]?.trim();
			return value && !status[provider] ? [{ provider, value }] : [];
		});

		Promise.all(
			keysToMigrate.map(({ provider, value }) =>
				saveApiKey.mutateAsync({ provider, value }),
			),
		)
			.then(() => {
				localStorage.removeItem(STORAGE_KEYS.apiKeys);
				if (keysToMigrate.length > 0) {
					toast.success("Saved API keys from this browser to your account.");
				}
			})
			.catch(() => {
				legacyMigrationStarted.current = false;
				toast.error("Could not import API keys saved in this browser.");
			});
	}, [isLoadingStatus, saveApiKey.mutateAsync, status]);

	const handleApiKeyChange = (provider: Provider, value: string) => {
		setApiKeys((prev) => ({ ...prev, [provider]: value }));
	};

	const handleSave = async () => {
		const keysToSave = keysForm.filter(
			({ provider }) => apiKeys[provider].trim() !== "",
		);
		try {
			await Promise.all([
				...keysToSave.map(({ provider }) =>
					saveApiKey.mutateAsync({
						provider,
						value: apiKeys[provider].trim(),
					}),
				),
				saveOpenRouterPreference.mutateAsync({ value: useOpenRouter }),
			]);
			apiKeyPreferencesStoreActions.setPersistedUseOpenRouter(useOpenRouter);
			setApiKeys(defaultApiKeys);
			setEditingProvider(null);
			setInitialUseOpenRouter(useOpenRouter);
			toast.success("API key settings saved!");
		} catch {
			toast.error("Could not save API keys. Please try again.");
		}
	};

	const handleRemove = async (provider: Provider) => {
		try {
			await removeApiKey.mutateAsync({ provider });
			setEditingProvider(null);
			setApiKeys((previous) => ({ ...previous, [provider]: "" }));
			toast.success("Saved API key removed.");
			return true;
		} catch {
			toast.error("Could not remove the saved API key.");
			return false;
		}
	};

	const hasDraftKeys = Object.values(apiKeys).some(
		(value) => value.trim() !== "",
	);
	const hasChanges = hasDraftKeys || useOpenRouter !== initialUseOpenRouter;

	return (
		<TabsContent value="apiKeys">
			<div className="space-y-6">
				<ApiKeyOpenRouter
					hasOpenRouterKey={status.openrouter}
					setUseOpenRouter={setUseOpenRouter}
					useOpenRouter={useOpenRouter}
				/>

				<div className="space-y-6">
					{keysForm.map((keyItem) => (
						<ApiKeyInput
							formValues={{
								label: `${keyItem.label} API Key`,
								placeholder: keyItem.placeholder,
								value: apiKeys[keyItem.provider],
								onChange: handleApiKeyChange,
							}}
							isConfigured={status[keyItem.provider]}
							maskedHint={maskedHints[keyItem.provider]}
							isEditing={editingProvider === keyItem.provider}
							isRemoving={removeApiKey.isPending}
							key={keyItem.provider}
							keyLink={keyItem.keyLink}
							onCancel={() => {
								setEditingProvider(null);
								setApiKeys((previous) => ({
									...previous,
									[keyItem.provider]: "",
								}));
							}}
							onClear={handleRemove}
							onReplace={() => setEditingProvider(keyItem.provider)}
							provider={keyItem.provider}
						/>
					))}
				</div>

				<div className="flex justify-start pt-4">
					<Button
						className="flex w-full items-center gap-2 lg:w-fit"
						disabled={
							!hasChanges ||
							saveApiKey.isPending ||
							saveOpenRouterPreference.isPending
						}
						onClick={handleSave}
					>
						<FloppyDiskIcon className="size-4" />
						Save Settings
					</Button>
				</div>
			</div>
		</TabsContent>
	);
}
