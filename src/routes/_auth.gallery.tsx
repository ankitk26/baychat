import { convexQuery } from "@convex-dev/react-query";
import { ImagesIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { ScrollArea } from "~/components/app-scroll-area";
import GeneratedImageViewer from "~/components/generated-image-viewer";
import { Skeleton } from "~/components/ui/skeleton";
import { useContentWidth } from "~/hooks/use-content-width";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_auth/gallery")({
	component: RouteComponent,
	loader: async ({ context }) =>
		context.queryClient.ensureQueryData(
			convexQuery(api.imageGenerations.getAll),
		),
});

function RouteComponent() {
	const { data: imageGenerations, isLoading } = useQuery(
		convexQuery(api.imageGenerations.getAll),
	);
	const contentWidth = useContentWidth("max-w-7xl", "max-w-none");

	return (
		<section className="h-svh max-h-svh py-4 pb-8 lg:py-6 lg:pb-12">
			<ScrollArea className="h-full w-full">
				<div
					className={cn(
						"mx-auto w-full space-y-4 px-8 pb-20 transition-[max-width] duration-300 ease-in-out lg:space-y-6 lg:px-12 lg:pb-12",
						contentWidth,
					)}
				>
					{/* Gallery Grid */}
					{isLoading ? (
						<div className="columns-2 gap-3 sm:columns-3 lg:columns-4 lg:gap-4">
							{Array.from({ length: 8 }).map((_, i) => (
								<Skeleton key={i} className="mb-2 aspect-square rounded-lg" />
							))}
						</div>
					) : imageGenerations?.length === 0 ? (
						<div className="py-12 text-center text-muted-foreground">
							<ImagesIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
							<p className="text-lg font-medium">No images yet</p>
							<p className="text-sm">Generated images will appear here</p>
						</div>
					) : (
						<div className="columns-2 gap-3 sm:columns-3 lg:columns-4 lg:gap-4">
							{imageGenerations?.map((image) => (
								<div key={image._id} className="break-inside-avoid">
									<GeneratedImageViewer
										alt="Generated"
										imageUrl={image.generatedImageUrl}
										storageId={image.storageId}
									/>
								</div>
							))}
						</div>
					)}
				</div>
			</ScrollArea>
		</section>
	);
}
