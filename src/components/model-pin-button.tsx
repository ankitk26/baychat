import { PushPinIcon } from "@phosphor-icons/react";

type Props = {
	isPinned: boolean;
	onToggle: () => void;
};

export default function ModelPinButton({ isPinned, onToggle }: Props) {
	return (
		<span
			aria-label={isPinned ? "Unpin model" : "Pin model"}
			role="button"
			tabIndex={-1}
			className="absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground data-[pinned=true]:text-foreground"
			data-pinned={isPinned}
			onClick={(event) => {
				// Prevent the parent menu item's select + close handlers.
				event.stopPropagation();
				event.preventDefault();
				onToggle();
			}}
		>
			<PushPinIcon
				className="size-3.5"
				weight={isPinned ? "fill" : "regular"}
			/>
		</span>
	);
}
