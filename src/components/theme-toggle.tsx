import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useHydrated } from "@tanstack/react-router";
import { useTheme } from "better-themes";
import { Button } from "~/components/ui/button";

export function ThemeToggler() {
	const { theme, setTheme } = useTheme();
	const hydrated = useHydrated();

	return (
		<Button
			className="group-data-[collapsible=icon]:opacity-0"
			onClick={() => {
				if (theme === "light") {
					setTheme("dark");
				} else {
					setTheme("light");
				}
			}}
			size="icon"
			variant="ghost"
			disabled={!hydrated}
		>
			<SunIcon className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
			<MoonIcon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
