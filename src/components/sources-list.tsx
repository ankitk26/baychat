import type { SourceUrlUIPart } from "ai";

type Props = {
	sourceParts: SourceUrlUIPart[];
};

export default function SourcesList(props: Props) {
	return (
		<div className="space-y-2">
			{props.sourceParts.map((sourcePart, index) => (
				<a
					className="group/source block rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
					href={sourcePart.url}
					key={sourcePart.sourceId}
					rel="noopener noreferrer"
					target="_blank"
				>
					<div className="flex items-center gap-3">
						<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
							{index + 1}
						</span>
						<div className="min-w-0 flex-1">
							<div className="line-clamp-2 text-xs text-foreground transition-colors group-hover/source:text-primary">
								{sourcePart.title}
							</div>
						</div>
					</div>
				</a>
			))}
		</div>
	);
}
