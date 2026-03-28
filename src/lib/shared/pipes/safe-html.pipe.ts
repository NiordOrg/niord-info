import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * SECURITY: Bypasses Angular's HTML sanitization. Only use with trusted content
 * (Niord API responses, translation keys). Never use with user-supplied input.
 */
@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | undefined | null): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value || '');
  }
}
