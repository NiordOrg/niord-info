import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { of } from 'rxjs';
import { MessagePrintViewComponent } from './message-print-view.component';
import { provideTestNiordConfig } from '../../../../testing/test-config';

function makeRoute(queryParams: Record<string, string | string[]> = {}) {
  return {
    snapshot: {
      queryParams,
      queryParamMap: convertToParamMap(queryParams),
    },
  };
}

describe('MessagePrintViewComponent', () => {
  let fixture: ComponentFixture<MessagePrintViewComponent>;
  let component: MessagePrintViewComponent;
  let httpTesting: HttpTestingController;
  let translocoSpy: Record<string, ReturnType<typeof vi.fn>>;

  function setup(queryParams: Record<string, string | string[]> = {}) {
    translocoSpy = {
      translate: vi.fn((k: string) => {
        const map: Record<string, string> = {
          PRINT_DATE_FORMAT: 'd MMMM yyyy',
          PRINT_BANNER: 'NtM {nw} / {nm} — {date}',
          MENU_NW: 'NW',
          MENU_NM: 'NM',
        };
        return map[k] ?? k;
      }),
      setActiveLang: vi.fn(),
      setAvailableLangs: vi.fn(),
      selectTranslation: vi.fn(() => of({})),
    };

    TestBed.configureTestingModule({
      imports: [MessagePrintViewComponent],
      providers: [
        provideTestNiordConfig(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: makeRoute(queryParams) },
        { provide: TranslocoService, useValue: translocoSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(MessagePrintViewComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  }

  afterEach(() => httpTesting.verify());

  it('should set language from ?language= param', () => {
    setup({ language: 'da' });
    component.ngOnInit();
    // Multi-message fetch
    const req = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/messages'));
    expect(req.request.url).toContain('language=da');
    req.flush([]);
  });

  it('should set language from ?lang= param as alias', () => {
    setup({ lang: 'da' });
    component.ngOnInit();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/messages'));
    expect(req.request.url).toContain('language=da');
    req.flush([]);
  });

  it('should prefer ?language= over ?lang=', () => {
    setup({ language: 'da', lang: 'en' });
    component.ngOnInit();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/messages'));
    expect(req.request.url).toContain('language=da');
    req.flush([]);
  });

  it('should build banner text', () => {
    setup({});
    component.ngOnInit();
    httpTesting.expectOne(() => true).flush([]);
    expect(component.bannerText()).toContain('NtM');
  });

  it('should fetch single message when messageId param present', () => {
    setup({ messageId: 'msg-42' });
    component.ngOnInit();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/message/'));
    expect(req.request.url).toContain('msg-42');
    req.flush({ id: 'msg-42', mainType: 'NW', descs: [{ lang: 'en' }] });
    expect(component.messages()).toHaveLength(1);
  });

  it('should include mainType params in multi-message URL', () => {
    setup({ mainType: ['NW', 'NM'], areaId: 'dk' });
    component.ngOnInit();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/messages'));
    expect(req.request.url).toContain('mainType=NW');
    expect(req.request.url).toContain('mainType=NM');
    expect(req.request.url).toContain('areaId=dk');
    req.flush([]);
  });

  it('should pass publication param through to API', () => {
    setup({ publication: 'pub-1' });
    component.ngOnInit();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/messages'));
    expect(req.request.url).toContain('publication=pub-1');
    req.flush([]);
  });

  it('should include active param in URL', () => {
    setup({ active: 'true', mainType: 'NW' });
    component.ngOnInit();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/messages'));
    expect(req.request.url).toContain('active=true');
    req.flush([]);
  });
});
