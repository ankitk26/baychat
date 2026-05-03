import {
	BrainIcon,
	CaretDownIcon,
	CaretRightIcon,
	SpinnerGapIcon,
} from "@phosphor-icons/react";

type Props = {
	isStreaming: boolean;
	toggleReasoningDisplay: () => void;
	showReasoning: boolean;
};

export default function ReasoningToggleButton(props: Props) {
	return (
		<div
			className="flex cursor-pointer items-center gap-2 rounded px-1 py-1"
			onClick={props.toggleReasoningDisplay}
		>
			{props.showReasoning ? (
				<CaretDownIcon className="size-3" />
			) : (
				<CaretRightIcon className="size-3" />
			)}

			<div className="flex items-center gap-2 font-mono text-xs text-muted-foreground select-none">
				<BrainIcon className="size-3" />
				<div>Reasoning</div>
				{props.isStreaming && (
					<SpinnerGapIcon className="size-3 animate-spin" />
				)}
			</div>
		</div>
	);
}
