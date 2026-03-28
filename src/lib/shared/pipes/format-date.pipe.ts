import { Pipe, PipeTransform, inject } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { LocaleService } from '../../core/services/locale.service';

@Pipe({ name: 'formatDate' })
export class FormatDatePipe implements PipeTransform {
  private readonly localeService = inject(LocaleService);

  transform(value: string | number | Date | undefined | null, dateFormat = 'PPp', locale = 'en'): string {
    if (!value) return '';
    const date = typeof value === 'string' ? parseISO(value) : new Date(value);
    return format(date, dateFormat, { locale: this.localeService.getDateFnsLocale(locale) });
  }
}
