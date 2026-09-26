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
			className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-md outline-hidden transition-[background-color,color] select-none hover:bg-secondary hover:**:text-secondary-foreground! focus-visible:bg-secondary focus-visible:**:text-secondary-foreground!"
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
