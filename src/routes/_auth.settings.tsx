import { SignOutIcon } from "@phosphor-icons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import ApiKeysForm from "~/components/api-keys-form";
import AppearanceSettings from "~/components/appearance-settings";
import ChatHistoryManager from "~/components/chat-history-manager";
import ContactSection from "~/components/contact-section";
import CustomizationSettings from "~/components/customization-settings";
import PageShell from "~/components/page-shell";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useIsMobile } from "~/hooks/use-mobile";
import { authClient } from "~/lib/auth-client";

export const Route = createFileRoute("/_auth/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const isMobile = useIsMobile();
	const navigate = useNavigate();

	return (
		<PageShell
			className="space-y-4 lg:space-y-6"
			collapsedWidthClass="max-w-5xl"
			expandedWidthClass="max-w-7xl"
		>
			{/* Header - responsive layout */}
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-bold lg:text-3xl">Settings</h1>
				<Button
					onClick={async () => {
						await authClient.signOut({
							fetchOptions: {
								onSuccess: () => {
									location.reload();
								},
							},
						});
						navigate({ to: "/login" });
					}}
					size={isMobile ? "icon" : "default"}
					variant="secondary"
				>
					<SignOutIcon className="h-4 w-4" />
					<span className="hidden lg:inline">Sign out</span>
				</Button>
			</div>

			<Tabs className="w-full flex-col" defaultValue="apiKeys">
				{/* Scrollable tabs on mobile */}
				<div className="scrollbar-hide w-full overflow-x-auto lg:w-fit">
					<TabsList className="flex w-full min-w-fit lg:w-auto">
						<TabsTrigger
							className="px-2 py-1 text-xs whitespace-nowrap lg:px-3 lg:py-1.5 lg:text-sm"
							value="apiKeys"
						>
							API Keys
						</TabsTrigger>
						<TabsTrigger
							className="px-2 py-1 text-xs whitespace-nowrap lg:px-3 lg:py-1.5 lg:text-sm"
							value="chatHistory"
						>
							Chat History
						</TabsTrigger>
						<TabsTrigger
							className="px-2 py-1 text-xs whitespace-nowrap lg:px-3 lg:py-1.5 lg:text-sm"
							value="appearance"
						>
							Appearance
						</TabsTrigger>
						<TabsTrigger
							className="px-2 py-1 text-xs whitespace-nowrap lg:px-3 lg:py-1.5 lg:text-sm"
							value="customization"
						>
							Customization
						</TabsTrigger>
						<TabsTrigger
							className="px-2 py-1 text-xs whitespace-nowrap lg:px-3 lg:py-1.5 lg:text-sm"
							value="about"
						>
							Contact
						</TabsTrigger>
					</TabsList>
				</div>

				{/* Content area with responsive spacing */}
				<div className="mt-4 lg:mt-6">
					<ApiKeysForm />
					<ChatHistoryManager />
					<AppearanceSettings />
					<CustomizationSettings />
					<ContactSection />
				</div>
			</Tabs>
		</PageShell>
	);
}
