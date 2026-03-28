import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { TeaserComponent } from './teaser.component';
import { provideTestNiordConfig, provideTranslocoSpy } from '../../testing/test-config';

describe('TeaserComponent', () => {
  let fixture: ComponentFixture<TeaserComponent>;
  let component: TeaserComponent;
  let httpTesting: HttpTestingController;

  function setup(queryParams: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      imports: [TeaserComponent],
      providers: [
        provideTestNiordConfig(),
        provideTranslocoSpy(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams } } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(TeaserComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpTesting.verify();
  });

  it('should fetch messages on init', () => {
    setup();
    component.ngOnInit();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/messages'));
    expect(req.request.url).toContain('mainType=NW');
    expect(req.request.url).toContain('mainType=NM');
    req.flush([{ id: 'msg-1', mainType: 'NW' }]);
    expect(component.messages()).toHaveLength(1);
  });

  it('should use lang from query params', () => {
    setup({ lang: 'da' });
    component.ngOnInit();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/messages'));
    expect(req.request.url).toContain('language=da');
    req.flush([]);
  });

  it('should include area from query params in URL', () => {
    setup({ area: 'urn:mrn:iho:country:dk' });
    component.ngOnInit();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/messages'));
    expect(req.request.url).toContain('areaId=');
    req.flush([]);
  });
});
