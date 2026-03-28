import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { MessageMapViewComponent } from './message-map-view.component';
import { MessagesComponent } from '../../messages.component';
import { provideTestNiordConfig, provideTranslocoSpy, createMockMessagesParent } from '../../../../testing/test-config';

describe('MessageMapViewComponent', () => {
  it('should create and expose parent signals', () => {
    const mockParent = createMockMessagesParent({
      messages: signal([{ id: 'msg-1', mainType: 'NW' }]),
      rootArea: signal({ id: 'dk' }),
    });

    TestBed.configureTestingModule({
      imports: [MessageMapViewComponent],
      providers: [
        provideTestNiordConfig(),
        provideTranslocoSpy(),
        { provide: MessagesComponent, useValue: mockParent },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const fixture = TestBed.createComponent(MessageMapViewComponent);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
    expect(component.parent.messages()).toHaveLength(1);
    expect(component.parent.rootArea()!.id).toBe('dk');
  });
});
