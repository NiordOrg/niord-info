import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { apiBaseUrlInterceptor } from './api-base-url.interceptor';
import { provideTestNiordConfig } from '../../testing/test-config';

describe('apiBaseUrlInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  function setup(apiBaseUrl?: string) {
    TestBed.configureTestingModule({
      providers: [
        provideTestNiordConfig({ apiBaseUrl }),
        provideHttpClient(withInterceptors([apiBaseUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  }

  afterEach(() => httpTesting.verify());

  it('should prepend baseUrl to /api/ requests', () => {
    setup('https://niord.example.com');
    http.get('/api/rest/public/v1/messages').subscribe();
    const req = httpTesting.expectOne('https://niord.example.com/api/rest/public/v1/messages');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should not modify non-/api/ requests', () => {
    setup('https://niord.example.com');
    http.get('/assets/i18n/en.json').subscribe();
    const req = httpTesting.expectOne('/assets/i18n/en.json');
    req.flush({});
  });

  it('should not modify when no baseUrl configured', () => {
    setup(undefined);
    http.get('/api/rest/public/v1/messages').subscribe();
    const req = httpTesting.expectOne('/api/rest/public/v1/messages');
    req.flush([]);
  });

  it('should preserve request properties', () => {
    setup('https://niord.example.com');
    http.get('/api/test', { headers: { 'X-Custom': 'val' } }).subscribe();
    const req = httpTesting.expectOne('https://niord.example.com/api/test');
    expect(req.request.headers.get('X-Custom')).toBe('val');
    req.flush({});
  });
});
