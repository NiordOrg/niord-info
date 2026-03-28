import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { MessageSourceComponent } from './message-source.component';
import { provideTestNiordConfig } from '../../../../testing/test-config';
import { MessageVo } from '../../../../core/models/message.model';

describe('MessageSourceComponent', () => {
  let fixture: ComponentFixture<MessageSourceComponent>;
  let component: MessageSourceComponent;
  let translocoSpy: { translate: ReturnType<typeof vi.fn>; setActiveLang: ReturnType<typeof vi.fn>; setAvailableLangs: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    translocoSpy = {
      translate: vi.fn((k: string) => {
        if (k === 'SOURCE_DATE_FORMAT') return 'd MMMM yyyy';
        if (k === 'FIELD_PUBLISHED') return 'Published';
        return k;
      }),
      setActiveLang: vi.fn(),
      setAvailableLangs: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [MessageSourceComponent],
      providers: [
        provideTestNiordConfig(),
        { provide: TranslocoService, useValue: translocoSpy },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MessageSourceComponent);
    component = fixture.componentInstance;
  });

  it('should render source text', () => {
    const msg: MessageVo = { id: '1', mainType: 'NW', descs: [{ lang: 'en', source: 'DMA' }] };
    fixture.componentRef.setInput('msg', msg);
    fixture.detectChanges();
    expect(component.sourceText()).toContain('DMA');
  });

  it('should render published date when present', () => {
    const msg: MessageVo = { id: '1', mainType: 'NW', publishDateFrom: '2024-03-15T10:00:00Z' };
    fixture.componentRef.setInput('msg', msg);
    fixture.detectChanges();
    expect(component.sourceText()).toContain('Published');
    expect(component.sourceText()).toContain('2024');
  });

  it('should guard against untranslated format key', () => {
    translocoSpy.translate.mockImplementation((k: string) => k);
    const msg: MessageVo = { id: '1', mainType: 'NW', publishDateFrom: '2024-03-15T10:00:00Z' };
    fixture.componentRef.setInput('msg', msg);
    fixture.detectChanges();
    // Should not crash even when translate returns the raw key
    expect(() => component.sourceText()).not.toThrow();
  });
});
