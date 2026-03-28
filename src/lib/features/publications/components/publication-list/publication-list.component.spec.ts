import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PublicationListComponent } from './publication-list.component';
import { PublicationVo } from '../../../../core/models/publication.model';
import { getTranslocoTestingModule } from '../../../../testing/test-config';

describe('PublicationListComponent', () => {
  let fixture: ComponentFixture<PublicationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationListComponent, getTranslocoTestingModule()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(PublicationListComponent);
  });

  it('should render publication titles', () => {
    const pubs: PublicationVo[] = [
      { publicationId: 'p1', descs: [{ lang: 'en', title: 'NM Weekly Report' }] },
    ];
    fixture.componentRef.setInput('publications', pubs);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('NM Weekly Report');
  });

  it('should show download link when descs[0].link exists', () => {
    const pubs: PublicationVo[] = [
      { publicationId: 'p1', descs: [{ lang: 'en', title: 'Report', link: 'https://example.com/dl' }] },
    ];
    fixture.componentRef.setInput('publications', pubs);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a[href="https://example.com/dl"]');
    expect(link).toBeTruthy();
  });
});
