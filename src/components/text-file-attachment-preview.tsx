import { FileTextIcon, XIcon } from "@phosphor-icons/react";
import type { FileUIPart } from "ai";
import CodeHighlight from "./code-highlight";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";

type AttachmentPart = FileUIPart & { size?: number };

const LANGUAGE_BY_EXTENSION: Record<string, string> = {
	c: "c",
	cc: "cpp",
	cpp: "cpp",
	css: "css",
	env: "bash",
	go: "go",
	h: "c",
	hpp: "cpp",
	html: "html",
	ini: "ini",
	java: "java",
	js: "js",
	json: "json",
	jsx: "jsx",
	kt: "kotlin",
	md: "markdown",
	php: "php",
	py: "python",
	rb: "ruby",
	rs: "rust",
	scss: "scss",
	sh: "bash",
	sql: "sql",
	swift: "swift",
	toml: "toml",
	ts: "ts",
	tsx: "tsx",
	txt: "txt",
	xml: "xml",
	yaml: "yaml",
	yml: "yaml",
};

const getCodeLanguage = (attachment: AttachmentPart) => {
	const extension = attachment.filename?.toLowerCase().split(".").at(-1) ?? "";
	if (extension in LANGUAGE_BY_EXTENSION) {
		return LANGUAGE_BY_EXTENSION[extension];
	}

	if (attachment.mediaType.includes("json")) {
		return "json";
	}

	if (attachment.mediaType.includes("javascript")) {
		return "js";
	}

	if (attachment.mediaType.includes("typescript")) {
		return "ts";
	}

	if (attachment.mediaType.includes("html")) {
		return "html";
	}

	if (attachment.mediaType.includes("css")) {
		return "css";
	}

	if (attachment.mediaType.startsWith("text/")) {
		return "txt";
	}

	return "txt";
};

const getTextContent = (attachment: AttachmentPart) => {
	const textContent = attachment.providerMetadata?.baychat?.textContent;
	return typeof textContent === "string" ? textContent : "";
};

export default function TextFileAttachmentPreview({
	attachment,
	fileSize,
	index,
	label,
	onRemove,
}: {
	attachment: AttachmentPart;
	fileSize: string | null;
	index: number;
	label: string;
	onRemove?: (index: number) => void;
}) {
	const textContent = getTextContent(attachment);
	const language = getCodeLanguage(attachment);

	return (
		<Dialog>
			<div className="relative flex min-h-20 items-center gap-3 rounded-2xl border border-border/70 bg-linear-to-br from-muted/55 to-muted/15 px-3 py-3 shadow-sm">
				<DialogTrigger
					render={
						<button
							type="button"
							className="flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-[inherit] text-left outline-none focus:outline-none"
						>
							<div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/80">
								<FileTextIcon className="text-muted-foreground" />
							</div>
							<div className="min-w-0 flex-1">
								<div className="truncate text-xs font-medium">{label}</div>
								<div className="mt-1 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
									{fileSize ?? "File"}
								</div>
							</div>
						</button>
					}
				/>

				{onRemove && (
					<Button
						aria-label={`Remove ${label}`}
						className="absolute top-2 right-2 rounded-full"
						onClick={(event) => {
							event.stopPropagation();
							onRemove(index);
						}}
						size="icon-xs"
						type="button"
						variant="ghost"
					>
						<XIcon />
					</Button>
				)}
			</div>

			<DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-5xl">
				<DialogHeader className="pr-10">
					<DialogTitle className="truncate text-sm">{label}</DialogTitle>
					<div className="text-xs text-muted-foreground">
						{fileSize ?? "File"}
					</div>
				</DialogHeader>

				<div className="max-h-[calc(90vh-6rem)] overflow-auto">
					{textContent.trim() ? (
						<CodeHighlight className={`language-${language}`}>
							{textContent}
						</CodeHighlight>
					) : (
						<div className="rounded-md border border-border/70 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
							Preview unavailable.
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
