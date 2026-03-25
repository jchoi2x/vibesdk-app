/**
 * Diff Format Implementations for LLM-generated code changes
 *
 * This module provides two different diff format implementations,
 * each with the same API but different approaches to handling changes.
 */

import { applyDiff as applyUnifiedDiff } from '@/agents/output-formats/diff-formats/udiff';
import {
  applyDiff as applySearchReplaceDiff,
  createSearchReplaceDiff,
  validateDiff as validateSearchReplaceDiff,
  type ApplyResult,
  type FailedBlock,
  MatchingStrategy,
} from '@/agents/output-formats/diff-formats/search-replace';

export {
  // Unified Diff Format (git-style)
  applyUnifiedDiff,

  // Search/Replace Format (simpler, more reliable for LLMs)
  applySearchReplaceDiff,
  createSearchReplaceDiff,
  validateSearchReplaceDiff,

  // Types and utilities
  type ApplyResult,
  type FailedBlock,
  MatchingStrategy,
};
