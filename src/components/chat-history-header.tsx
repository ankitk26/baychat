import { Badge } from "./ui/badge";

type Props = {
	totalChatCount: number;
	isLoading: boolean;
};

export default function ChatHistoryHeader({
	totalChatCount,
	isLoading,
}: Props) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-2">
				<h3 className="text-base font-semibold text-foreground">
					Chat History
				</h3>
				{!isLoading && (
					<Badge
						className="h-5 px-1.5 text-[0.625rem] font-medium"
						variant="secondary"
					>
						{totalChatCount}
					</Badge>
				)}
			</div>
		</div>
	);
}
