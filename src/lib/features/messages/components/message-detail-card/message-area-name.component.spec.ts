import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageAreaNameComponent } from './message-area-name.component';
import { provideTestNiordConfig, provideTranslocoSpy } from '../../../../testing/test-config';
import { AreaVo } from '../../../../core/models/message.model';

describe('MessageAreaNameComponent', () => {
  let fixture: ComponentFixture<MessageAreaNameComponent>;
  let component: MessageAreaNameComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MessageAreaNameComponent],
      providers: [provideTestNiordConfig(), provideTranslocoSpy()],
    });
    fixture = TestBed.createComponent(MessageAreaNameComponent);
    component = fixture.componentInstance;
  });

  it('should render area name', () => {
    const area: AreaVo = { id: '1', descs: [{ lang: 'en', name: 'Denmark' }] };
    fixture.componentRef.setInput('area', area);
    fixture.detectChanges();
    expect(component.areaName()).toBe('Denmark');
  });

  it('should render lineage with divider', () => {
    const parent: AreaVo = { id: '1', descs: [{ lang: 'en', name: 'Europe' }] };
    const child: AreaVo = { id: '2', parent, descs: [{ lang: 'en', name: 'Denmark' }] };
    fixture.componentRef.setInput('area', child);
    fixture.detectChanges();
    expect(component.areaName()).toBe('Europe - Denmark');
  });

  it('should show leaf only when lineage=false', () => {
    const parent: AreaVo = { id: '1', descs: [{ lang: 'en', name: 'Europe' }] };
    const child: AreaVo = { id: '2', parent, descs: [{ lang: 'en', name: 'Denmark' }] };
    fixture.componentRef.setInput('area', child);
    fixture.componentRef.setInput('lineage', false);
    fixture.detectChanges();
    expect(component.areaName()).toBe('Denmark');
  });
});
