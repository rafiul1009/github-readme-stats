/**
 * Quote has no meaningful "raw data" to fetch — computeData picks a random
 * quote itself, ignoring this — so the preview route shows a genuinely
 * random quote too, same as the real endpoint. This exists only to satisfy
 * the registry's `mockRawData` contract.
 */
export function getMockQuoteData(): Record<string, never> {
  return {};
}
