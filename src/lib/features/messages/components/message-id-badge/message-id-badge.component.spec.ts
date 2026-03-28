import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MessageIdBadgeComponent } from './message-id-badge.component';
import { provideTestNiordConfig, provideTranslocoSpy } from '../../../../testing/test-config';

describe('MessageIdBadgeComponent', () => {
  let fixture: ComponentFixture<MessageIdBadgeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MessageIdBadgeComponent],
      providers: [provideTestNiordConfig(), provideTranslocoSpy()],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(MessageIdBadgeComponent);
  });

  it('should render NW badge', () => {
    fixture.componentRef.setInput('msg', { id: '1', mainType: 'NW', shortId: 'NW-001' });
    fixture.detectChanges();
    expect(fixture.componentInstance.badgeHtml()).toContain('label-message-nw');
  });

  it('should render NM badge', () => {
    fixture.componentRef.setInput('msg', { id: '1', mainType: 'NM', shortId: 'NM-001' });
    fixture.detectChanges();
    expect(fixture.componentInstance.badgeHtml()).toContain('label-message-nm');
  });
});
