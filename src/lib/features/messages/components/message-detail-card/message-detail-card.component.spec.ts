import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MessageDetailCardComponent } from './message-detail-card.component';
import { provideTestNiordConfig, getTranslocoTestingModule } from '../../../../testing/test-config';
import { MessageVo } from '../../../../core/models/message.model';

describe('MessageDetailCardComponent', () => {
  let fixture: ComponentFixture<MessageDetailCardComponent>;
  let component: MessageDetailCardComponent;

  const baseMsg: MessageVo = {
    id: 'msg-1',
    mainType: 'NW',
    shortId: 'NW-001',
    descs: [{ lang: 'en', title: 'Test Message' }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageDetailCardComponent, getTranslocoTestingModule()],
      providers: [
        provideTestNiordConfig(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(MessageDetailCardComponent);
    component = fixture.componentInstance;
  });

  it('should display title from desc', () => {
    fixture.componentRef.setInput('msg', baseMsg);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Test Message');
  });

  it('should render references section', () => {
    const msg: MessageVo = {
      ...baseMsg,
      references: [{ messageId: 'ref-1', type: 'REPETITION', descs: [] }],
    };
    fixture.componentRef.setInput('msg', msg);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('ref-1');
  });

  it('should format charts text correctly', () => {
    const msg: MessageVo = {
      ...baseMsg,
      charts: [
        { chartNumber: '101', internationalNumber: 42 },
        { chartNumber: '202' },
      ],
    };
    fixture.componentRef.setInput('msg', msg);
    fixture.detectChanges();
    expect(component.chartsText()).toBe('101 (INT 42), 202.');
  });

  it('should toggle showAttachments', () => {
    const msg: MessageVo = {
      ...baseMsg,
      attachments: [{ path: '/img/a.png', fileName: 'a.png' }],
    };
    fixture.componentRef.setInput('msg', msg);
    fixture.detectChanges();
    expect(component.showAttachments()).toBe(false);
    component.showAttachments.set(true);
    expect(component.showAttachments()).toBe(true);
  });

  it('should emit showDetails on click', () => {
    fixture.componentRef.setInput('msg', baseMsg);
    fixture.detectChanges();
    const spy = vi.fn();
    component.showDetails.subscribe(spy);
    component.onDetailsClick('msg-1');
    expect(spy).toHaveBeenCalledWith('msg-1');
  });
});
