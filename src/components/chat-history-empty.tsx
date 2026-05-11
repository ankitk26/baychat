import { ChatTeardropTextIcon } from "@phosphor-icons/react";

type Props = {
	title: string;
	description: string;
};

export default function ChatHistoryEmpty({ title, description }: Props) {
	return (
		<div className="flex flex-col items-center justify-center rounded-lg border py-14 text-center">
			<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
				<ChatTeardropTextIcon className="h-4 w-4 text-muted-foreground" />
			</div>
			<p className="text-sm font-medium text-foreground">{title}</p>
			<p className="mt-1 text-xs text-muted-foreground">{description}</p>
		</div>
	);
}
