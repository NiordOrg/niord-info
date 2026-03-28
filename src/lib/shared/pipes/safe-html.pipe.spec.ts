import { TestBed } from '@angular/core/testing';
import { SafeHtmlPipe } from './safe-html.pipe';

describe('SafeHtmlPipe', () => {
  let pipe: SafeHtmlPipe;

  beforeEach(() => {
    pipe = TestBed.runInInjectionContext(() => new SafeHtmlPipe());
  });

  it('should bypass sanitization for HTML string', () => {
    const result = pipe.transform('<b>bold</b>');
    expect(result).toBeTruthy();
    expect(result.toString()).toContain('bold');
  });

  it('should return safe empty for null', () => {
    const result = pipe.transform(null);
    expect(result).toBeTruthy();
  });

  it('should return safe empty for undefined', () => {
    const result = pipe.transform(undefined);
    expect(result).toBeTruthy();
  });
});
