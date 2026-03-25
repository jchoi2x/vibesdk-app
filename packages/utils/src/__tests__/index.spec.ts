import { describe, it, expect, vi } from 'vitest';
import {
	sleep,
	retry,
	pick,
	omit,
	slugify,
	truncate,
	isNonNull,
	isDefined,
	chunk,
	groupBy,
	uniqueBy,
	deepMerge,
} from '../index';

describe('sleep', () => {
	it('resolves after approximately the given milliseconds', async () => {
		const start = Date.now();
		await sleep(50);
		expect(Date.now() - start).toBeGreaterThanOrEqual(40);
	});

	it('resolves with undefined for 0ms', async () => {
		await expect(sleep(0)).resolves.toBeUndefined();
	});
});

describe('retry', () => {
	it('returns value on first success', async () => {
		const fn = vi.fn().mockResolvedValue('ok');
		await expect(retry(fn, { attempts: 3 })).resolves.toBe('ok');
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('retries and eventually succeeds', async () => {
		const fn = vi
			.fn()
			.mockRejectedValueOnce(new Error('fail'))
			.mockRejectedValueOnce(new Error('fail'))
			.mockResolvedValue('ok');
		await expect(retry(fn, { attempts: 3 })).resolves.toBe('ok');
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it('throws last error when all attempts fail', async () => {
		const fn = vi.fn().mockRejectedValue(new Error('always fails'));
		await expect(retry(fn, { attempts: 3 })).rejects.toThrow('always fails');
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it('calls onRetry with attempt number and error', async () => {
		const onRetry = vi.fn();
		const fn = vi
			.fn()
			.mockRejectedValueOnce(new Error('e1'))
			.mockResolvedValue('ok');
		await retry(fn, { attempts: 3, onRetry });
		expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
	});

	it('does not call onRetry on the final failing attempt', async () => {
		const onRetry = vi.fn();
		const fn = vi.fn().mockRejectedValue(new Error('fail'));
		await expect(retry(fn, { attempts: 2, onRetry })).rejects.toThrow();
		expect(onRetry).toHaveBeenCalledTimes(1);
	});

	it('does not sleep when delayMs is 0', async () => {
		const fn = vi
			.fn()
			.mockRejectedValueOnce(new Error('fail'))
			.mockResolvedValue('ok');
		const start = Date.now();
		await retry(fn, { attempts: 2, delayMs: 0 });
		expect(Date.now() - start).toBeLessThan(100);
	});
});

describe('pick', () => {
	it('returns object with only the specified keys', () => {
		expect(pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 });
	});

	it('returns empty object for empty keys array', () => {
		expect(pick({ a: 1 }, [])).toEqual({});
	});

	it('ignores keys absent from the source object', () => {
		const obj = { a: 1 } as { a: number; b?: number };
		expect(pick(obj, ['a', 'b'])).toEqual({ a: 1 });
	});
});

describe('omit', () => {
	it('returns object without the omitted keys', () => {
		expect(omit({ a: 1, b: 2, c: 3 }, ['b'])).toEqual({ a: 1, c: 3 });
	});

	it('returns a copy when no keys are omitted', () => {
		const obj = { a: 1, b: 2 };
		expect(omit(obj, [])).toEqual(obj);
	});

	it('omits multiple keys', () => {
		expect(omit({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ b: 2 });
	});
});

describe('slugify', () => {
	it('lowercases and replaces spaces with hyphens', () => {
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('removes diacritics', () => {
		expect(slugify('café')).toBe('cafe');
	});

	it('replaces non-alphanumeric characters with hyphens', () => {
		expect(slugify('foo!@#bar')).toBe('foo-bar');
	});

	it('strips leading and trailing hyphens', () => {
		expect(slugify('  hello  ')).toBe('hello');
	});

	it('collapses consecutive separators into one hyphen', () => {
		expect(slugify('foo   bar')).toBe('foo-bar');
	});

	it('handles empty string', () => {
		expect(slugify('')).toBe('');
	});
});

describe('truncate', () => {
	it('returns the string unchanged when within maxLen', () => {
		expect(truncate('hello', 10)).toBe('hello');
	});

	it('truncates and appends the default suffix', () => {
		expect(truncate('hello world', 8)).toBe('hello...');
	});

	it('uses a custom suffix', () => {
		expect(truncate('hello world', 7, '…')).toBe('hello w…');
	});

	it('returns a string of exactly maxLen characters', () => {
		const result = truncate('hello world', 8);
		expect(result.length).toBe(8);
	});

	it('returns string as-is when length equals maxLen', () => {
		expect(truncate('hi', 2)).toBe('hi');
	});
});

describe('isNonNull', () => {
	it('returns true for non-null, non-undefined values', () => {
		expect(isNonNull(0)).toBe(true);
		expect(isNonNull('')).toBe(true);
		expect(isNonNull(false)).toBe(true);
		expect(isNonNull({})).toBe(true);
	});

	it('returns false for null', () => {
		expect(isNonNull(null)).toBe(false);
	});

	it('returns false for undefined', () => {
		expect(isNonNull(undefined)).toBe(false);
	});
});

describe('isDefined', () => {
	it('returns true for defined values, including null', () => {
		expect(isDefined(null)).toBe(true);
		expect(isDefined(0)).toBe(true);
		expect(isDefined('')).toBe(true);
	});

	it('returns false for undefined', () => {
		expect(isDefined(undefined)).toBe(false);
	});
});

describe('chunk', () => {
	it('splits an array into chunks of the given size', () => {
		expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
	});

	it('returns a single chunk when size >= array length', () => {
		expect(chunk([1, 2, 3], 10)).toEqual([[1, 2, 3]]);
	});

	it('returns an empty array for an empty input', () => {
		expect(chunk([], 2)).toEqual([]);
	});

	it('throws RangeError for size of 0', () => {
		expect(() => chunk([1, 2], 0)).toThrow(RangeError);
	});

	it('throws RangeError for negative size', () => {
		expect(() => chunk([1, 2], -1)).toThrow(RangeError);
	});
});

describe('groupBy', () => {
	it('groups items by key function result', () => {
		const items = [
			{ type: 'a', v: 1 },
			{ type: 'b', v: 2 },
			{ type: 'a', v: 3 },
		];
		expect(groupBy(items, (i) => i.type)).toEqual({
			a: [
				{ type: 'a', v: 1 },
				{ type: 'a', v: 3 },
			],
			b: [{ type: 'b', v: 2 }],
		});
	});

	it('returns an empty object for an empty array', () => {
		expect(groupBy([], (i: unknown) => String(i))).toEqual({});
	});

	it('places single-item groups correctly', () => {
		const result = groupBy([{ k: 'x' }], (i) => i.k);
		expect(result).toEqual({ x: [{ k: 'x' }] });
	});
});

describe('uniqueBy', () => {
	it('removes duplicates by key function', () => {
		const items = [
			{ id: 1, name: 'a' },
			{ id: 2, name: 'b' },
			{ id: 1, name: 'c' },
		];
		expect(uniqueBy(items, (i) => i.id)).toEqual([
			{ id: 1, name: 'a' },
			{ id: 2, name: 'b' },
		]);
	});

	it('returns all items when all are unique', () => {
		expect(uniqueBy([1, 2, 3], (i) => i)).toEqual([1, 2, 3]);
	});

	it('returns an empty array for empty input', () => {
		expect(uniqueBy([], (i: unknown) => i)).toEqual([]);
	});

	it('preserves the first occurrence of a duplicate', () => {
		const result = uniqueBy(['a', 'b', 'a'], (s) => s);
		expect(result).toEqual(['a', 'b']);
	});
});

describe('deepMerge', () => {
	it('merges top-level keys from source into target', () => {
		expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
	});

	it('source value overwrites target value for primitives', () => {
		expect(deepMerge({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
	});

	it('recursively merges nested plain objects', () => {
		expect(
			deepMerge({ a: { x: 1, y: 2 } }, { a: { y: 3, z: 4 } }),
		).toEqual({ a: { x: 1, y: 3, z: 4 } });
	});

	it('ignores undefined values from source', () => {
		expect(deepMerge({ a: 1 }, { a: undefined })).toEqual({ a: 1 });
	});

	it('merges multiple sources left to right', () => {
		expect(deepMerge({ a: 1 }, { b: 2 }, { c: 3 })).toEqual({
			a: 1,
			b: 2,
			c: 3,
		});
	});

	it('does not mutate the target object', () => {
		const target = { a: 1 };
		deepMerge(target, { b: 2 });
		expect(target).toEqual({ a: 1 });
	});

	it('later sources take precedence over earlier ones', () => {
		expect(deepMerge({ a: 1 }, { a: 2 }, { a: 3 })).toEqual({ a: 3 });
	});
});
