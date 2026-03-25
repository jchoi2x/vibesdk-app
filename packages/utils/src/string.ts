export function slugify(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function truncate(s: string, maxLen: number, suffix = '...'): string {
	if (s.length <= maxLen) return s;
	return s.slice(0, maxLen - suffix.length) + suffix;
}
