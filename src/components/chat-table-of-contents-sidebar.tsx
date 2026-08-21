import { XIcon } from "@phosphor-icons/react";
import { memo, useMemo } from "react";
import { ScrollArea } from "~/components/app-scroll-area";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent } from "~/components/ui/sheet";
import { useIsMobile } from "~/hooks/use-mobile";
import { extractTableOfContents } from "~/lib/extract-table-of-contents";
import { cn } from "~/lib/utils";
import {
	tableOfContentsStoreActions,
	useTableOfContentsStore,
} from "~/stores/table-of-contents-store";
import type { CustomUIMessage } from "~/types";

type Props = {
	messages: CustomUIMessage[];
};

export default memo(function ChatTableOfContentsSidebar({ messages }: Props) {
	const isOpen = useTableOfContentsStore((state) => state.isOpen);
	const isMobile = useIsMobile();
	const sections = useMemo(() => extractTableOfContents(messages), [messages]);

	const handleNavigate = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: "instant", block: "start" });
		}
		if (isMobile) {
			tableOfContentsStoreActions.close();
		}
	};

	const tocContent = (
		<>
			<div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
				<h2 className="text-sm font-semibold">Contents</h2>
				{isMobile && (
					<Button
						onClick={tableOfContentsStoreActions.close}
						size="icon"
						variant="ghost"
					>
						<XIcon className="size-4" />
					</Button>
				)}
			</div>
			<ScrollArea className="min-h-0 flex-1">
				<div className="py-2 pb-8">
					{sections.length === 0 && (
						<p className="px-4 py-2 text-xs text-muted-foreground">
							No contents yet
						</p>
					)}

					{sections.map((section) => (
						<div key={section.turnId} className="px-2 py-0.5">
							<button
								onClick={() => handleNavigate(section.turnId)}
								className="w-full rounded px-2 py-1.5 text-left text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
								type="button"
							>
								{section.userPreview}
							</button>

							{section.headings.length > 0 && (
								<div className="mt-0.5 ml-2 border-l pl-2">
									{section.headings.map((heading, idx) => (
										<button
											key={idx}
											onClick={() => handleNavigate(heading.headingId)}
											className={cn(
												"w-full truncate rounded px-2 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
												heading.depth <= 2 && "font-medium text-foreground/80",
											)}
											type="button"
										>
											{heading.text}
										</button>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			</ScrollArea>
		</>
	);

	return (
		<>
			{isMobile && (
				<Sheet
					open={isOpen}
					onOpenChange={(open) => {
						if (!open) {
							tableOfContentsStoreActions.close();
						}
					}}
				>
					<SheetContent
						side="right"
						className="w-80 p-0"
						showCloseButton={false}
					>
						<div className="flex h-full flex-col bg-background">
							{tocContent}
						</div>
					</SheetContent>
				</Sheet>
			)}
			<div
				className={cn(
					"hidden h-full shrink-0 flex-col border-l bg-background transition-all duration-300 ease-in-out md:flex",
					isOpen
						? "w-64 opacity-100"
						: "w-0 overflow-hidden border-transparent opacity-0",
				)}
			>
				{tocContent}
			</div>
		</>
	);
});
