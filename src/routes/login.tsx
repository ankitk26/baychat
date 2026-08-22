import {
	ArrowRightIcon,
	GithubLogoIcon,
	GoogleLogoIcon,
	SpinnerIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const [loadingProvider, setLoadingProvider] = useState<
		"google" | "github" | null
	>(null);

	const handleLogin = async (provider: "google" | "github") => {
		setLoadingProvider(provider);
		try {
			await authClient.signIn.social({ provider });
		} catch {
			setLoadingProvider(null);
		}
	};

	return (
		<div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6 py-16">
			<style>{`
				@keyframes bc-in {
					from { opacity: 0; transform: translateY(10px); }
					to { opacity: 1; transform: translateY(0); }
				}
			`}</style>

			<div
				className="relative z-10 w-full max-w-xs"
				style={{ animation: "bc-in 0.6s ease-out both" }}
			>
				<div className="mb-14 flex items-center justify-center">
					<span className="text-xl font-medium tracking-tight">baychat</span>
				</div>

				{/* Heading */}
				<div className="mb-9 space-y-3">
					<p className="font-mono text-[0.7rem] font-medium tracking-[0.3em] text-muted-foreground/50 uppercase">
						Sign in
					</p>
					<h1 className="text-2xl font-medium tracking-tight">Welcome back.</h1>
					<p className="text-sm text-muted-foreground">
						Continue where you left off.
					</p>
				</div>
				{/* Actions */}
				<div className="space-y-2.5">
					<Button
						className="w-full gap-2 duration-200"
						size="lg"
						disabled={loadingProvider !== null}
						onClick={() => handleLogin("github")}
					>
						{loadingProvider === "github" ? (
							<SpinnerIcon className="size-4 animate-spin" />
						) : (
							<GithubLogoIcon className="size-4" />
						)}
						Continue with GitHub
						<ArrowRightIcon className="size-3.5 translate-x-[-4px] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
					</Button>

					<Button
						className="w-full gap-2 duration-200"
						size="lg"
						variant="outline"
						disabled={loadingProvider !== null}
						onClick={() => handleLogin("google")}
					>
						{loadingProvider === "google" ? (
							<SpinnerIcon className="size-4 animate-spin" />
						) : (
							<GoogleLogoIcon className="size-4" />
						)}
						Continue with Google
						<ArrowRightIcon className="size-3.5 translate-x-[-4px] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
					</Button>
				</div>
			</div>
		</div>
	);
}
