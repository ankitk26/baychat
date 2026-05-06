import { Label } from "~/components/ui/label";
import type { Provider } from "~/types";
import ApiKeyInputForm from "./api-key-input-form";
import ApiKeyInputIcon from "./api-key-input-icon";
import ApiKeyLink from "./api-key-link";

type Props = {
	provider: Provider;
	keyLink: string;
	formValues: {
		label: string;
		placeholder?: string;
		value: string;
		onChange: (provider: Provider, value: string) => void;
	};
};

export default function ApiKeyInput(props: Props) {
	return (
		<div className="flex items-start gap-4">
			<Label
				className="flex w-48 shrink-0 items-center gap-2 leading-normal text-muted-foreground"
				htmlFor={`api-key-${props.provider}`}
			>
				<ApiKeyInputIcon provider={props.provider} />
				<span className="truncate">{props.formValues.label}</span>
			</Label>

			<div className="flex-1 space-y-1">
				<ApiKeyInputForm
					formValues={props.formValues}
					provider={props.provider}
				/>
				<ApiKeyLink keyLink={props.keyLink} />
			</div>
		</div>
	);
}
