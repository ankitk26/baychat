import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import { isBrowser } from "~/lib/environment";
import { useOptionalSharedChatContext } from "~/providers/chat-provider";
import { Button } from "./ui/button";

export default function TanstackErrorComponent({
	error,
	info,
}: ErrorComponentProps) {
	const chatContext = useOptionalSharedChatContext();

	if (!isBrowser()) {
		console.error("TanStack Router error boundary reached", {
			error,
			componentStack: info?.componentStack,
		});
	}

	return (
		<div className="flex min-h-dvh items-center justify-center p-6">
			<section
				aria-live="assertive"
				className="mx-auto max-w-md p-6 text-center"
				role="alert"
			>
				<h2 className="text-lg font-semibold text-balance">
					Some error occurred.
				</h2>

				<div className="mt-4 flex justify-center">
					<Link
						aria-label="Go to the home page"
						onClick={() => chatContext?.clearChat()}
						to="/"
					>
						<Button>Go to Home</Button>
					</Link>
				</div>
			</section>
		</div>
	);
}
