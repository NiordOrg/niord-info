import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageTableViewComponent } from './message-table-view.component';
import { MessagesComponent } from '../../messages.component';
import { provideTestNiordConfig, provideTranslocoSpy, createMockMessagesParent } from '../../../../testing/test-config';

describe('MessageTableViewComponent', () => {
  it('should open dialog with correct messageId and messageIds', () => {
    const mockParent = createMockMessagesParent({
      messages: signal([{ id: 'msg-1' }, { id: 'msg-2' }, { id: 'msg-3' }]),
    });
    const modalSpy = {
      open: vi.fn(() => ({ componentInstance: {} })),
    };

    TestBed.configureTestingModule({
      imports: [MessageTableViewComponent],
      providers: [
        provideTestNiordConfig(),
        provideTranslocoSpy(),
        { provide: MessagesComponent, useValue: mockParent },
        { provide: NgbModal, useValue: modalSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const fixture = TestBed.createComponent(MessageTableViewComponent);
    fixture.componentInstance.openDetails('msg-2');

    expect(modalSpy.open).toHaveBeenCalled();
    const instance = modalSpy.open.mock.results[0].value.componentInstance;
    expect(instance.messageId).toBe('msg-2');
    expect(instance.messageIds).toEqual(['msg-1', 'msg-2', 'msg-3']);
  });
});
