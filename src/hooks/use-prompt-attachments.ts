import type { FileUIPart } from "ai";
import type { Id } from "convex/_generated/dataModel";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { getPostUrl } from "~/server-fns/get-post-url";
import {
	useIsModalitiesLoaded,
	useModelModalities,
} from "~/stores/model-modalities-store";

const TEXT_FILE_EXTENSIONS = new Set([
	"c",
	"cc",
	"cpp",
	"cxx",
	"h",
	"hh",
	"hpp",
	"go",
	"js",
	"jsx",
	"ts",
	"tsx",
	"json",
	"md",
	"txt",
	"py",
	"java",
	"rs",
	"rb",
	"php",
	"css",
	"scss",
	"html",
	"xml",
	"yaml",
	"yml",
	"sh",
	"sql",
	"kt",
	"swift",
	"toml",
	"ini",
	"env",
]);

const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;

const MIME_TYPE_TO_EXTENSION = new Map<string, string>([
	["image/gif", "gif"],
	["image/heic", "heic"],
	["image/heif", "heif"],
	["image/jpeg", "jpg"],
	["image/png", "png"],
	["image/webp", "webp"],
]);

export type PendingAttachment = {
	file: File;
	filename: string;
	mediaType: string;
	previewUrl: string;
	size: number;
	textContent?: string;
};

type UploadedAttachment = {
	filename: string;
	mediaType: string;
	previewUrl: string;
	storageId: Id<"_storage">;
	storageUrl: string;
	textContent?: string;
};

// Generate a local preview immediately because persisted file URLs are resolved later.
const fileToDataUrl = (file: File) =>
	new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});

// Fall back to extensions because browser MIME types are inconsistent for text files.
const getFileExtension = (filename: string) => {
	const parts = filename.toLowerCase().split(".");
	return parts.length > 1 ? (parts.at(-1) ?? "") : "";
};

// Derive a stable media type so validation and downstream prompt handling stay consistent.
const inferMediaType = (file: File) => {
	if (file.type.trim() !== "") {
		return file.type;
	}

	const extension = getFileExtension(file.name);
	if (TEXT_FILE_EXTENSIONS.has(extension)) {
		return "text/plain";
	}

	if (extension === "pdf") {
		return "application/pdf";
	}

	return "application/octet-stream";
};

const getClipboardImageFilename = (file: File) => {
	if (file.name.trim() !== "") {
		return file.name;
	}

	const extension = MIME_TYPE_TO_EXTENSION.get(file.type) ?? "png";
	return `clipboard-image-${Date.now()}.${extension}`;
};

// Limit attachments to types the UI and chat pipeline know how to handle safely.
const isSupportedAttachmentType = (mediaType: string) =>
	mediaType.startsWith("text/") ||
	mediaType.startsWith("image/") ||
	mediaType === "application/pdf";

// Check extensions as well because some text formats are mislabeled as application/*.
const isTextAttachment = (file: File, mediaType: string) => {
	if (mediaType.startsWith("text/")) {
		return true;
	}

	return TEXT_FILE_EXTENSIONS.has(getFileExtension(file.name));
};

// Keep prompt submission focused on messaging while this hook owns attachment state and uploads.
export function usePromptAttachments(openRouterModelId: string) {
	const modelModalities = useModelModalities(openRouterModelId);
	const isModalitiesLoaded = useIsModalitiesLoaded();
	const modelSupportsImage = modelModalities.includes("image");
	const modelSupportsPdf = modelModalities.includes("pdf");

	const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
	const [isUploading, setIsUploading] = useState(false);

	const queueFiles = async (files: File[]) => {
		const validFiles = files.filter((file) => {
			if (file.size === 0) {
				toast.warning(`${file.name} is empty.`);
				return false;
			}

			const mediaType = inferMediaType(file);

			// Extension-based text files should be allowed even when the browser reports application/*.
			if (
				!isSupportedAttachmentType(mediaType) &&
				!isTextAttachment(file, mediaType)
			) {
				toast.warning(`${file.name} is not a supported file, PDF, or image.`);
				return false;
			}

			if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
				toast.warning(`${file.name} is larger than 10 MB.`);
				return false;
			}

			// Skip model-specific validation until modalities data has loaded
			if (isModalitiesLoaded) {
				const isImageFile = mediaType.startsWith("image/");
				const isPdfFile = mediaType === "application/pdf";

				if (isImageFile && !modelSupportsImage) {
					toast.warning(
						`${file.name} is an image, but the current model does not support image input.`,
					);
					return false;
				}

				if (isPdfFile && !modelSupportsPdf) {
					toast.warning(
						`${file.name} is a PDF, but the current model does not support PDF input.`,
					);
					return false;
				}
			}

			return true;
		});

		if (validFiles.length === 0) {
			return;
		}

		const nextAttachments = await Promise.all(
			validFiles.map(async (file) => {
				const mediaType = inferMediaType(file);
				// Capture text once up front so prompt construction does not depend on later file reads.
				const textContent = isTextAttachment(file, mediaType)
					? await file.text()
					: undefined;

				return {
					file,
					filename: file.name,
					mediaType,
					size: file.size,
					previewUrl: await fileToDataUrl(file),
					textContent,
				};
			}),
		);

		setAttachments((current) => [...current, ...nextAttachments]);
	};

	// Validate early so unsupported files never enter prompt state and text can be captured once.
	const handleAttachmentChange = async (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const files = event.target.files;
		if (!files || files.length === 0) {
			return;
		}

		await queueFiles(Array.from(files));
		event.target.value = "";
	};

	const handleClipboardFiles = async (files: File[]) => {
		const clipboardFiles = files.map((file) =>
			file.name.trim() === ""
				? new File([file], getClipboardImageFilename(file), { type: file.type })
				: file,
		);

		await queueFiles(clipboardFiles);
	};

	// Remove by index to preserve the user-visible ordering of the remaining attachments.
	const removeAttachment = (index: number) => {
		setAttachments((current) =>
			current.filter((_, currentIndex) => currentIndex !== index),
		);
	};

	// Reset attachments after send or cancel so the next prompt starts from a clean state.
	const clearAttachments = () => {
		setAttachments([]);
	};

	// Return preview-backed parts for the live UI and storage-backed parts for persisted messages.
	const uploadAttachments = async (): Promise<{
		optimisticAttachments: FileUIPart[];
		persistedAttachments: FileUIPart[];
	}> => {
		if (attachments.length === 0) {
			return {
				optimisticAttachments: [],
				persistedAttachments: [],
			};
		}

		setIsUploading(true);

		try {
			const uploadedAttachments: UploadedAttachment[] = await Promise.all(
				attachments.map(async (attachment) => {
					// Each file gets its own upload URL so storage authorization stays scoped to that upload.
					const uploadUrl = await getPostUrl();
					const uploadResponse = await fetch(uploadUrl, {
						method: "POST",
						headers: {
							"Content-Type": attachment.mediaType,
						},
						body: attachment.file,
					});

					if (!uploadResponse.ok) {
						throw new Error(`Upload failed: ${uploadResponse.status}`);
					}

					const { storageId } = (await uploadResponse.json()) as {
						storageId: Id<"_storage">;
					};

					return {
						filename: attachment.filename,
						mediaType: attachment.mediaType,
						previewUrl: attachment.previewUrl,
						storageId,
						// Leave URLs empty here because authorized storage URLs are generated on read.
						storageUrl: "",
						textContent: attachment.textContent,
					};
				}),
			);

			return {
				optimisticAttachments: uploadedAttachments.map(
					(attachment) =>
						({
							type: "file",
							filename: attachment.filename,
							mediaType: attachment.mediaType,
							// Keep the local preview in the optimistic message so the UI updates immediately.
							url: attachment.previewUrl,
							providerMetadata: {
								baychat: {
									textContent: attachment.textContent,
								},
								convex: {
									storageId: attachment.storageId,
								},
							},
						}) satisfies FileUIPart,
				),
				persistedAttachments: uploadedAttachments.map(
					(attachment) =>
						({
							type: "file",
							filename: attachment.filename,
							mediaType: attachment.mediaType,
							// Persist storage metadata instead of a transient preview URL.
							url: attachment.storageUrl,
							providerMetadata: {
								baychat: {
									textContent: attachment.textContent,
								},
								convex: {
									storageId: attachment.storageId,
								},
							},
						}) satisfies FileUIPart,
				),
			};
		} catch (error) {
			console.error("Failed to upload attachments:", error);
			toast.error("Could not upload attachment");
			throw error;
		} finally {
			setIsUploading(false);
		}
	};

	return {
		attachments,
		clearAttachments,
		handleClipboardFiles,
		handleAttachmentChange,
		isUploading,
		removeAttachment,
		uploadAttachments,
	};
}
