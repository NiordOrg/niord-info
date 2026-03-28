import { Component, ChangeDetectionStrategy, input, inject, computed } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { MessageService } from '../../../../core/services/message.service';
import { LanguageService } from '../../../../core/services/language.service';
import { LocaleService } from '../../../../core/services/locale.service';
import { MessageVo } from '../../../../core/models/message.model';
import { format, parseISO, toDate } from 'date-fns';

@Component({
  selector: 'app-message-source',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="message-source">{{ sourceText() }}</span>`,
})
export class MessageSourceComponent {
  private readonly messageService = inject(MessageService);
  private readonly transloco = inject(TranslocoService);
  private readonly languageService = inject(LanguageService);
  private readonly localeService = inject(LocaleService);

  msg = input.required<MessageVo>();

  sourceText = computed(() => {
    const m = this.msg();
    const lang = this.languageService.language();
    let source = '';

    const desc = this.messageService.desc(m, lang);
    if (desc?.source) {
      source = desc.source;
    }

    if (m.publishDateFrom) {
      if (source.length > 0) {
        if (source.charAt(source.length - 1) !== '.') source += '.';
        source += ' ';
      }
      const dateFormat = this.transloco.translate('SOURCE_DATE_FORMAT');
      // Guard against translations not yet loaded — the raw key would crash date-fns
      if (dateFormat && dateFormat !== 'SOURCE_DATE_FORMAT') {
        const locale = this.localeService.getDateFnsLocale(lang);
        const date = typeof m.publishDateFrom === 'string' ? parseISO(m.publishDateFrom) : toDate(m.publishDateFrom);
        source += this.transloco.translate('FIELD_PUBLISHED') + ' ' + format(date, dateFormat, { locale });
      }
    }

    return source;
  });
}
