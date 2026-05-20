import { ListIcon } from "@phosphor-icons/react";
import { Button } from "~/components/ui/button";
import {
	tableOfContentsStoreActions,
	useTableOfContentsStore,
} from "~/stores/table-of-contents-store";

export default function ChatTableOfContentsToggle() {
	const isOpen = useTableOfContentsStore((state) => state.isOpen);

	if (isOpen) {
		return null;
	}

	return (
		<Button
			className="absolute top-3 right-3 z-20 hidden h-8 w-8 rounded-md shadow-sm transition-opacity duration-200 md:flex"
			onClick={tableOfContentsStoreActions.open}
			size="icon"
			variant="secondary"
		>
			<ListIcon className="size-4" />
		</Button>
	);
}
