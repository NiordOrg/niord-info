import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PublicationService } from './publication.service';
import { PublicationVo } from '../models/publication.model';

describe('PublicationService', () => {
  let service: PublicationService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PublicationService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should search with correct URL', () => {
    service.search('category=NM&language=en').subscribe();
    const req = httpTesting.expectOne('/api/rest/public/v1/publications?category=NM&language=en');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should return search results', () => {
    const expected: PublicationVo[] = [{ publicationId: 'p1' }];
    let result: PublicationVo[] | undefined;
    service.search('').subscribe((r) => (result = r));
    httpTesting.expectOne(() => true).flush(expected);
    expect(result).toEqual(expected);
  });

  it('should get publication with encoded id and language', () => {
    service.getPublication('pub/123', 'da').subscribe();
    const req = httpTesting.expectOne(
      '/api/rest/public/v1/publications/publication/pub%2F123?language=da',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ publicationId: 'pub/123' });
  });

  it('should return the publication', () => {
    const expected: PublicationVo = { publicationId: 'p1' };
    let result: PublicationVo | undefined;
    service.getPublication('p1', 'en').subscribe((r) => (result = r));
    httpTesting.expectOne(() => true).flush(expected);
    expect(result).toEqual(expected);
  });
});
