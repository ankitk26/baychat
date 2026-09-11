import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "convex/_generated/api";

const pinnedModelsQuery = convexQuery(api.pinnedModels.getPinnedModelIds, {});

export function usePinnedModels() {
	const queryClient = useQueryClient();

	const { data: pinnedModelIds } = useQuery(pinnedModelsQuery);

	const toggleMutation = useMutation<
		boolean,
		Error,
		{ modelId: string },
		{ previousPinnedIds: string[] }
	>({
		mutationFn: useConvexMutation(api.pinnedModels.togglePinnedModel),
		onMutate: async ({ modelId }) => {
			await queryClient.cancelQueries({
				queryKey: pinnedModelsQuery.queryKey,
			});
			const previousPinnedIds =
				queryClient.getQueryData<string[]>(pinnedModelsQuery.queryKey) ?? [];
			const nextPinnedIds = previousPinnedIds.includes(modelId)
				? previousPinnedIds.filter((id) => id !== modelId)
				: [...previousPinnedIds, modelId];
			queryClient.setQueryData(pinnedModelsQuery.queryKey, nextPinnedIds);
			return { previousPinnedIds };
		},
		onError: (_error, _variables, context) => {
			if (context?.previousPinnedIds) {
				queryClient.setQueryData(
					pinnedModelsQuery.queryKey,
					context.previousPinnedIds,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: pinnedModelsQuery.queryKey });
		},
	});

	const pinnedIds = pinnedModelIds ?? [];
	const pinnedIdSet = new Set(pinnedIds);

	return {
		pinnedIds,
		isPinned: (modelId: string) => pinnedIdSet.has(modelId),
		togglePinned: (modelId: string) => toggleMutation.mutate({ modelId }),
	};
}
