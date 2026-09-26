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
			className="absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-md opacity-0 outline-hidden transition-[opacity,background-color,color] select-none group-hover/dropdown-menu-item:opacity-100 hover:bg-foreground/15 hover:text-foreground focus-visible:bg-foreground/15 focus-visible:opacity-100 data-[pinned=true]:text-foreground data-[pinned=true]:opacity-100"
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
