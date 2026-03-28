import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MessageFilterComponent } from './message-filter.component';
import { getTranslocoTestingModule } from '../../../../testing/test-config';

describe('MessageFilterComponent', () => {
  let fixture: ComponentFixture<MessageFilterComponent>;
  let component: MessageFilterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageFilterComponent, getTranslocoTestingModule()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(MessageFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have default mainTypes (both true)', () => {
    expect(component.mainTypes()).toEqual({ NW: true, NM: true });
  });

  it('should emit toggled mainTypes on toggleMainType', () => {
    const spy = vi.fn();
    component.mainTypesChange.subscribe(spy);
    component.toggleMainType('NW');
    expect(spy).toHaveBeenCalledWith({ NW: false, NM: true });
  });

  it('should accept areaRoots input', () => {
    fixture.componentRef.setInput('areaRoots', [{ id: '1' }]);
    fixture.detectChanges();
    expect(component.areaRoots()).toHaveLength(1);
  });

  it('should emit printRequested', () => {
    const spy = vi.fn();
    component.printRequested.subscribe(spy);
    component.printRequested.emit();
    expect(spy).toHaveBeenCalled();
  });
});
