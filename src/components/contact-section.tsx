import { GithubLogoIcon, XLogoIcon } from "@phosphor-icons/react";
import CustomExternalLink from "./custom-external-link";
import { Button } from "./ui/button";
import { TabsContent } from "./ui/tabs";

export default function ContactSection() {
	return (
		<TabsContent className="space-y-4" value="about">
			<div>
				<h3 className="text-base font-semibold text-foreground">About</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					Learn more about this project and how to get in touch.
				</p>
			</div>

			<div className="space-y-3">
				<div className="flex items-start gap-3 rounded-lg border p-3">
					<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
						<GithubLogoIcon className="h-4 w-4" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-sm font-medium">Open Source</p>
						<p className="text-xs text-muted-foreground">
							This project is open-source.
						</p>
						<CustomExternalLink
							href={import.meta.env.VITE_GITHUB_REPO_LINK}
							className="mt-2 inline-block"
						>
							<Button className="h-7 px-2.5 text-xs" variant="outline">
								baychat
							</Button>
						</CustomExternalLink>
					</div>
				</div>

				<div className="flex items-start gap-3 rounded-lg border p-3">
					<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
						<XLogoIcon className="h-4 w-4" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-sm font-medium">Contact</p>
						<p className="text-xs text-muted-foreground">
							For bugs, features, or general inquiries.
						</p>
						<CustomExternalLink
							href={import.meta.env.VITE_X_URL}
							className="mt-2 inline-block"
						>
							<Button className="h-7 px-2.5 text-xs" variant="outline">
								Contact
							</Button>
						</CustomExternalLink>
					</div>
				</div>
			</div>
		</TabsContent>
	);
}
