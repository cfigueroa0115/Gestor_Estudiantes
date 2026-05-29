import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

describe('fast-check setup verification', () => {
  it('should verify that reversing an array twice returns the original array', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const reversed = [...arr].reverse().reverse();
        expect(reversed).toEqual(arr);
      }),
      { numRuns: 100 }
    );
  });
});
