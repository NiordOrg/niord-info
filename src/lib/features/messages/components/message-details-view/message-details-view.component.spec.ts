import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageDetailsViewComponent } from './message-details-view.component';
import { MessagesComponent } from '../../messages.component';
import { provideTestNiordConfig, provideTranslocoSpy, createMockMessagesParent } from '../../../../testing/test-config';

describe('MessageDetailsViewComponent', () => {
  it('should open dialog from route param messageId on init', () => {
    const mockParent = createMockMessagesParent({
      messages: signal([{ id: 'msg-1' }, { id: 'msg-2' }]),
    });
    const modalSpy = {
      open: vi.fn(() => ({ componentInstance: {} })),
    };

    TestBed.configureTestingModule({
      imports: [MessageDetailsViewComponent],
      providers: [
        provideTestNiordConfig(),
        provideTranslocoSpy(),
        { provide: MessagesComponent, useValue: mockParent },
        { provide: NgbModal, useValue: modalSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ messageId: 'msg-2' }),
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const fixture = TestBed.createComponent(MessageDetailsViewComponent);
    fixture.componentInstance.ngOnInit();

    expect(modalSpy.open).toHaveBeenCalled();
    const instance = modalSpy.open.mock.results[0].value.componentInstance;
    expect(instance.messageId).toBe('msg-2');
    expect(instance.messageIds).toEqual(['msg-1', 'msg-2']);
  });
});
