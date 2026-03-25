export const SUPPORTED_IMAGE_MIME_TYPES = [
	'image/png',
	'image/jpeg',
	'image/webp',
] as const;

export type SupportedImageMimeType = typeof SUPPORTED_IMAGE_MIME_TYPES[number];

export interface ImageAttachment {
	id: string;
	filename: string;
	mimeType: SupportedImageMimeType;
	base64Data: string;
	size?: number;
	dimensions?: {
		width: number;
		height: number;
	};
}

export interface ProcessedImageAttachment {
	mimeType: SupportedImageMimeType;
	base64Data?: string;
	r2Key: string;
	publicUrl: string;
	hash: string;
}

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGES_PER_MESSAGE = 2;

export function isSupportedImageType(mimeType: string): mimeType is SupportedImageMimeType {
	return (SUPPORTED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function getFileExtensionFromMimeType(mimeType: SupportedImageMimeType): string {
	const map: Record<SupportedImageMimeType, string> = {
		'image/png': 'png',
		'image/jpeg': 'jpg',
		'image/webp': 'webp',
	};
	return map[mimeType];
}
