import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { AppFont } from "~/types";

const fontStorageKey = "app-font";

export const getAppFont = createServerFn().handler((): AppFont => {
	const appFont = getCookie(fontStorageKey);
	if (!appFont) {
		return "font-sans";
	}
	return appFont as AppFont;
});

export const setAppFont = createServerFn()
	.validator((data: AppFont) => data)
	.handler(({ data }) => {
		setCookie(fontStorageKey, data);
	});
