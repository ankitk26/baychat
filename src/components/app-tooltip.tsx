import {
	Tooltip,
	TooltipContent as ShadcnTooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

function TooltipContent({
	className,
	...props
}: React.ComponentProps<typeof ShadcnTooltipContent>) {
	return (
		<ShadcnTooltipContent
			className={cn("[&>*:last-child]:hidden", className)}
			{...props}
		/>
	);
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
