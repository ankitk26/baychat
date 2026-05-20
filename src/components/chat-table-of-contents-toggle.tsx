import { ListIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type Props = {
	isOpen: boolean;
	onToggle: () => void;
};

export default function ChatTableOfContentsToggle({ isOpen, onToggle }: Props) {
	return (
		<Button
			className={cn(
				"absolute top-3 right-3 z-20 hidden h-8 w-8 rounded-md shadow-sm transition-opacity duration-200 md:flex",
			)}
			onClick={onToggle}
			size="icon"
			variant="secondary"
		>
			{isOpen ? <XIcon className="size-4" /> : <ListIcon className="size-4" />}
		</Button>
	);
}
