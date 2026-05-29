import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '@/lib/utils';

describe('sanitizeHtml', () => {
  it('escapes < and > characters', () => {
    expect(sanitizeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('escapes & character', () => {
    expect(sanitizeHtml('foo & bar')).toBe('foo &amp; bar');
  });

  it('escapes double quotes', () => {
    expect(sanitizeHtml('he said "hello"')).toBe('he said &quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(sanitizeHtml("it's fine")).toBe('it&#x27;s fine');
  });

  it('escapes all special characters together', () => {
    expect(sanitizeHtml('<div class="test">&\'</div>')).toBe(
      '&lt;div class=&quot;test&quot;&gt;&amp;&#x27;&lt;/div&gt;'
    );
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('returns the same string when no special characters', () => {
    expect(sanitizeHtml('Hello World 123')).toBe('Hello World 123');
  });
});
