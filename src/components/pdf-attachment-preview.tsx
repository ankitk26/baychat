import { ArrowSquareOutIcon, FilePdfIcon, XIcon } from "@phosphor-icons/react";
import type { FileUIPart } from "ai";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { getFileUrl } from "~/server-fns/get-file-url";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";

type AttachmentPart = FileUIPart & { size?: number };

const isSafeBrowserUrl = (value: string) => {
	try {
		const url = new URL(value);
		return (
			url.protocol === "http:" ||
			url.protocol === "https:" ||
			url.protocol === "blob:"
		);
	} catch {
		return false;
	}
};

export default function PdfAttachmentPreview({
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
	const inlinePdfUrl = useMemo(() => {
		if (isSafeBrowserUrl(attachment.url)) {
			return attachment.url;
		}

		if (attachment.url.startsWith("data:")) {
			try {
				const byteString = atob(attachment.url.split(",")[1]);
				const mimeMatch = attachment.url.match(/data:([^;]+)/);
				const mime = mimeMatch?.[1] ?? "application/pdf";
				const ab = new Uint8Array(byteString.length);
				for (let i = 0; i < byteString.length; i++) {
					ab[i] = byteString.charCodeAt(i);
				}
				return URL.createObjectURL(new Blob([ab], { type: mime }));
			} catch {
				return "about:blank";
			}
		}

		return "about:blank";
	}, [attachment.url]);

	useEffect(() => {
		return () => {
			if (inlinePdfUrl.startsWith("blob:")) {
				URL.revokeObjectURL(inlinePdfUrl);
			}
		};
	}, [inlinePdfUrl]);

	const handleOpenInNewTab = async () => {
		const newTab = window.open("", "_blank");

		if (!newTab) {
			toast.error("Could not open PDF in a new tab");
			return;
		}

		try {
			const storageId = attachment.providerMetadata?.convex?.storageId;
			let pdfUrl = attachment.url;

			if (pdfUrl.startsWith("data:")) {
				const response = await fetch(pdfUrl);
				const pdfBlob = await response.blob();
				pdfUrl = URL.createObjectURL(pdfBlob);
			} else if (!isSafeBrowserUrl(pdfUrl) && typeof storageId === "string") {
				const freshUrl = await getFileUrl({ data: { storageId } });
				if (typeof freshUrl === "string" && freshUrl.trim() !== "") {
					pdfUrl = freshUrl;
				}
			}

			if (!isSafeBrowserUrl(pdfUrl)) {
				throw new Error("Invalid PDF URL");
			}

			newTab.location.replace(pdfUrl);
		} catch (error) {
			newTab.close();
			console.error("Failed to open PDF in a new tab:", error);
			toast.error("Could not open PDF in a new tab");
		}
	};

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
								<FilePdfIcon className="text-muted-foreground" />
							</div>
							<div className="min-w-0 flex-1">
								<div className="truncate text-xs font-medium">{label}</div>
								<div className="mt-1 flex items-center gap-2 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
									<span>PDF</span>
									{fileSize && <span>{fileSize}</span>}
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

			<DialogContent
				className="flex h-[82vh] max-h-[82vh] flex-col gap-0 overflow-hidden rounded-[2rem] p-0 sm:max-w-[min(92vw,1600px)]"
				showCloseButton={false}
			>
				<DialogHeader className="flex-row items-start justify-between px-7 pt-7 pb-4">
					<div className="min-w-0">
						<DialogTitle className="truncate pr-4 text-[1.05rem] font-medium">
							{label}
						</DialogTitle>
					</div>

					<div className="flex shrink-0 items-center gap-2">
						<Button
							aria-label={`Open ${label} in a new tab`}
							onClick={handleOpenInNewTab}
							size="icon-sm"
							type="button"
							variant="outline"
						>
							<ArrowSquareOutIcon />
						</Button>

						<DialogClose
							render={
								<Button
									aria-label={`Close ${label}`}
									size="icon-sm"
									type="button"
									variant="outline"
								/>
							}
						>
							<XIcon />
						</DialogClose>
					</div>
				</DialogHeader>

				<div className="min-h-0 flex-1 px-5 pb-5">
					<iframe
						className="h-full min-h-0 w-full rounded-2xl border border-border/70 bg-background shadow-xs"
						src={inlinePdfUrl}
						title={label}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
