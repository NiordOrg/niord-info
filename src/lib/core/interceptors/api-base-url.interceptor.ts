import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { NIORD_INFO_CONFIG } from '../../niord-info.config';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(NIORD_INFO_CONFIG);
  const baseUrl = config.apiBaseUrl;

  if (baseUrl && req.url.startsWith('/api/')) {
    return next(req.clone({ url: `${baseUrl}${req.url}` }));
  }

  return next(req);
};
