import { isDevMode, makeEnvironmentProviders } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { NiordInfoConfig, NIORD_INFO_CONFIG } from './niord-info.config';
import { NiordTranslocoLoader } from './i18n/niord-transloco-loader';

export function provideNiordInfo(config: NiordInfoConfig) {
  return makeEnvironmentProviders([
    { provide: NIORD_INFO_CONFIG, useValue: config },
    provideTransloco({
      config: {
        defaultLang: config.defaultLanguage,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: NiordTranslocoLoader,
    }),
  ]);
}
