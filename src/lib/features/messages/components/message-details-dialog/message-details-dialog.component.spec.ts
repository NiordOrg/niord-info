import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageDetailsDialogComponent } from './message-details-dialog.component';
import { provideTestNiordConfig, provideTranslocoSpy } from '../../../../testing/test-config';

describe('MessageDetailsDialogComponent', () => {
  let fixture: ComponentFixture<MessageDetailsDialogComponent>;
  let component: MessageDetailsDialogComponent;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MessageDetailsDialogComponent],
      providers: [
        provideTestNiordConfig(),
        provideTranslocoSpy(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NgbActiveModal, useValue: { dismiss: vi.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(MessageDetailsDialogComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    component.messageId = 'msg-1';
    component.messageIds = ['msg-0', 'msg-1', 'msg-2'];
  });

  afterEach(() => httpTesting.verify());

  it('should load message details on init', () => {
    component.ngOnInit();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/message/'));
    req.flush({ id: 'msg-1', mainType: 'NW', descs: [{ lang: 'en' }] });
    expect(component.msg()).toBeDefined();
    expect(component.msg()!.id).toBe('msg-1');
  });

  it('should navigate with selectNext', () => {
    component.ngOnInit();
    httpTesting.expectOne(() => true).flush({ id: 'msg-1', mainType: 'NW' });

    component.selectNext();
    expect(component.currentIndex()).toBe(2);
    httpTesting.expectOne(() => true).flush({ id: 'msg-2', mainType: 'NW' });
    expect(component.msg()!.id).toBe('msg-2');
  });

  it('should pop stack on back', () => {
    component.ngOnInit();
    httpTesting.expectOne(() => true).flush({ id: 'msg-1', mainType: 'NW' });

    component.selectMessage('msg-ref');
    httpTesting.expectOne(() => true).flush({ id: 'msg-ref', mainType: 'NM' });
    expect(component.pushedMessageIds()).toHaveLength(2);

    component.back();
    httpTesting.expectOne(() => true).flush({ id: 'msg-1', mainType: 'NW' });
    expect(component.pushedMessageIds()).toHaveLength(1);
  });
});
