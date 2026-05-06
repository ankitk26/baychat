import { Skeleton } from "./ui/skeleton";

export default function ChatHistoryLoading() {
	return (
		<div className="space-y-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<div className="space-y-2" key={`skeleton-${i}`}>
					<Skeleton className="h-3 w-20" />
					<div className="space-y-1">
						{Array.from({ length: 2 }).map((_, j) => (
							<div
								className="flex items-center gap-3 rounded-lg px-2 py-2"
								key={`skeleton-item-${i}-${j}`}
							>
								<Skeleton className="h-4 w-4 rounded-sm" />
								<div className="flex-1 space-y-1.5">
									<Skeleton className="h-3.5 w-3/4" />
									<Skeleton className="h-2.5 w-1/4" />
								</div>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
