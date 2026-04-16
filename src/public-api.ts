// Config
export type { NiordInfoConfig, RootAreaSpec } from './lib/niord-info.config';
export { NIORD_INFO_CONFIG } from './lib/niord-info.config';
export { provideNiordInfo } from './lib/provide-niord-info';
export type { NiordInfoRuntimeConfig } from './lib/runtime-config';
export { loadNiordInfoRuntimeConfig, parseNiordInfoRuntimeConfig } from './lib/runtime-config';

// Models
export type {
  MessageVo,
  AreaVo,
  DescVo,
  ChartVo,
  ReferenceVo,
  AttachmentVo,
  FeatureVo,
  GeometryVo,
  MessagePartVo,
} from './lib/core/models/message.model';
export type {
  PublicationVo,
  PublicationCategoryVo,
  PublicationDescVo,
} from './lib/core/models/publication.model';

// Services
export { AppConfigService } from './lib/core/services/app-config.service';
export { LanguageService } from './lib/core/services/language.service';
export { LocaleService } from './lib/core/services/locale.service';
export { MessageService } from './lib/core/services/message.service';
export { PublicationService } from './lib/core/services/publication.service';

// Interceptor
export { apiBaseUrlInterceptor } from './lib/core/interceptors/api-base-url.interceptor';

// Routes
export { createNiordRoutes } from './lib/routes/create-niord-routes';

// Pipes
export { SafeHtmlPipe } from './lib/shared/pipes/safe-html.pipe';
export { FormatDatePipe } from './lib/shared/pipes/format-date.pipe';
