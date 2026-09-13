import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/saved-messages")({
	component: SavedMessagesLayout,
});

function SavedMessagesLayout() {
	return <Outlet />;
}
