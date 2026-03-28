import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fromZonedTime } from 'date-fns-tz';
import { PublicationsComponent } from './publications.component';
import { provideTestNiordConfig, getTranslocoTestingModule } from '../../testing/test-config';
import { PublicationVo } from '../../core/models/publication.model';

describe('PublicationsComponent', () => {
  let fixture: ComponentFixture<PublicationsComponent>;
  let component: PublicationsComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationsComponent, getTranslocoTestingModule()],
      providers: [
        provideTestNiordConfig(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicationsComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should fetch active publications on creation', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/publication'));
    expect(req.request.url).toContain('language=en');
    req.flush([{ publicationId: 'p1', descs: [{ lang: 'en', title: 'Test Pub' }] }]);
    expect(component.activePublications()).toHaveLength(1);
  });

  it('should fetch historical publications when dates are set', () => {
    fixture.detectChanges();
    // Flush the initial active publications request
    httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/publication')).flush([]);

    component.setDateRange('2024-01-01', '2024-12-31');
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url.includes('from='));
    expect(req.request.url).toContain('language=en');
    const params = new URL(req.request.urlWithParams, 'https://example.com').searchParams;
    expect(params.get('from')).toBe(String(fromZonedTime('2024-01-01', 'Europe/Copenhagen').getTime()));
    expect(params.get('to')).toBe(
      String(fromZonedTime('2025-01-01', 'Europe/Copenhagen').getTime() - 1),
    );
    req.flush([]);
    expect(component.historicalPublications()).toEqual([]);
  });

  it('should add category headings via checkGroupByCategory', () => {
    fixture.detectChanges();
    const pubs: PublicationVo[] = [
      { publicationId: 'p1', category: { categoryId: 'cat-A', descs: [{ lang: 'en', name: 'Cat A' }] } },
      { publicationId: 'p2', category: { categoryId: 'cat-A', descs: [{ lang: 'en', name: 'Cat A' }] } },
      { publicationId: 'p3', category: { categoryId: 'cat-B', descs: [{ lang: 'en', name: 'Cat B' }] } },
    ];
    httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/publication')).flush(pubs);
    const result = component.activePublications();
    // First of cat-A gets heading
    expect(result[0].categoryHeading).toBeDefined();
    expect(result[0].categoryHeading!.categoryId).toBe('cat-A');
    // Second of cat-A does NOT get heading
    expect(result[1].categoryHeading).toBeUndefined();
    // First of cat-B gets heading
    expect(result[2].categoryHeading).toBeDefined();
    expect(result[2].categoryHeading!.categoryId).toBe('cat-B');
  });
});
