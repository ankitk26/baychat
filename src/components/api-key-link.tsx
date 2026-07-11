import CustomExternalLink from "./custom-external-link";

type Props = {
	keyLink: string;
};

export default function ApiKeyLink(props: Props) {
	return (
		<small className="text-xs text-muted-foreground">
			Get your{" "}
			<CustomExternalLink
				className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
				href={props.keyLink}
			>
				API key
			</CustomExternalLink>
		</small>
	);
}
