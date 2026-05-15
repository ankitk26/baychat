import { FilePdf, Image, TextT } from "@phosphor-icons/react";
import type { InputModality } from "~/lib/fetch-model-modalities";
import { useModelModalities } from "~/stores/model-modalities-store";

type Props = {
	openRouterModelId: string;
};

const modalityConfig: Record<
	InputModality,
	{
		Icon: typeof Image;
		label: string;
	}
> = {
	text: {
		Icon: TextT,
		label: "Text",
	},
	image: {
		Icon: Image,
		label: "Image",
	},
	pdf: {
		Icon: FilePdf,
		label: "PDF",
	},
};

const displayOrder: InputModality[] = ["text", "image", "pdf"];

export default function ModelInputIndicators({ openRouterModelId }: Props) {
	const modalities = useModelModalities(openRouterModelId);

	if (modalities.length === 0) return null;

	// Only show the requested modalities in order
	const visibleModalities = displayOrder.filter((m) => modalities.includes(m));

	if (visibleModalities.length === 0) return null;

	return (
		<span className="flex items-center gap-0.5">
			{visibleModalities.map((modality) => {
				const config = modalityConfig[modality];
				if (!config) return null;
				const { Icon, label } = config;
				return (
					<span
						key={modality}
						aria-label={label}
						className="inline-flex items-center justify-center rounded p-0.5 text-muted-foreground/70"
						title={`Supports ${label.toLowerCase()} input`}
					>
						<Icon className="size-3" weight="fill" />
					</span>
				);
			})}
		</span>
	);
}
