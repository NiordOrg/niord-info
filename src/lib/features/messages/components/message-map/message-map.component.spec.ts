import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageMapComponent } from './message-map.component';
import { provideTestNiordConfig, provideTranslocoSpy } from '../../../../testing/test-config';

describe('MessageMapComponent', () => {
  let fixture: ComponentFixture<MessageMapComponent>;
  let component: MessageMapComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MessageMapComponent],
      providers: [
        provideTestNiordConfig(),
        { provide: NgbModal, useValue: { open: vi.fn() } },
        provideTranslocoSpy(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(MessageMapComponent);
    component = fixture.componentInstance;
  });

  it('should create without errors', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle minimizeNoPosMessages', () => {
    expect(component.minimizeNoPosMessages()).toBe(false);
    component.minimizeNoPosMessages.set(true);
    expect(component.minimizeNoPosMessages()).toBe(true);
  });

  it('should have empty layerSwitcherLayers initially', () => {
    expect(component.layerSwitcherLayers()).toEqual([]);
  });
});
