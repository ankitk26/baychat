import { useLayoutStore } from "~/stores/layout-store";

// Returns the max-width class for the main content column, following the
// expand/collapse width toggle shown at the top of the app.
export const useContentWidth = (
	collapsedClass: string,
	expandedClass: string,
) => {
	const isExpanded = useLayoutStore((store) => store.isExpanded);
	return isExpanded ? expandedClass : collapsedClass;
};
