import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MessagesComponent } from './messages.component';
import { provideTestNiordConfig, provideTranslocoSpy } from '../../testing/test-config';
import { AreaVo, MessageVo } from '../../core/models/message.model';

describe('MessagesComponent', () => {
  let fixture: ComponentFixture<MessagesComponent>;
  let component: MessagesComponent;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MessagesComponent],
      providers: [
        provideTestNiordConfig(),
        provideTranslocoSpy(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(MessagesComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should fetch root areas on init', () => {
    component.ngOnInit();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/area/'));
    const areaResp: AreaVo = { id: 'dk', descs: [{ lang: 'en', name: 'Denmark' }] };
    req.flush(areaResp);
    // After root areas fetched, refreshMessages is called
    const msgReq = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/messages'));
    msgReq.flush([]);
    expect(component.areaRoots()).toHaveLength(1);
    expect(component.rootArea()).toBeDefined();
  });

  it('should early return on empty specs', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [MessagesComponent],
      providers: [
        provideTestNiordConfig({ rootAreas: [] }),
        provideTranslocoSpy(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    const f = TestBed.createComponent(MessagesComponent);
    const c = f.componentInstance;
    c.ngOnInit();
    expect(c.loading()).toBe(false);
    // No HTTP requests expected
    TestBed.inject(HttpTestingController).verify();
  });

  it('should restore saved rootArea from localStorage', () => {
    localStorage.setItem('rootAreaId', 'dk');
    component.ngOnInit();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/area/'));
    req.flush({ id: 'dk', descs: [{ lang: 'en', name: 'DK' }] });
    const msgReq = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/messages'));
    msgReq.flush([]);
    expect(component.rootArea()!.id).toBe('dk');
  });

  it('should persist rootArea to localStorage on updateRootArea', () => {
    const area: AreaVo = { id: 'gl' };
    component.updateRootArea(area);
    expect(localStorage.getItem('rootAreaId')).toBe('gl');
    // refreshMessages called but no rootArea latitude/longitude, just verify request
    httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/messages')).flush([]);
  });

  it('should persist mainTypes to localStorage on updateMainTypes', () => {
    component.rootArea.set({ id: 'dk' });
    component.updateMainTypes({ NW: false, NM: true });
    expect(localStorage.getItem('NW')).toBe('false');
    expect(localStorage.getItem('NM')).toBe('true');
    httpTesting.expectOne(() => true).flush([]);
  });

  it('should toggle activeNow and refresh', () => {
    component.rootArea.set({ id: 'dk' });
    expect(component.activeNow()).toBe(false);
    component.toggleActiveNow();
    expect(component.activeNow()).toBe(true);
    const req = httpTesting.expectOne((r) => r.url.includes('active=true'));
    req.flush([]);
  });

  it('should toggle subArea without HTTP call', () => {
    component.subAreas.set([
      { id: 'A', selected: true },
      { id: 'B', selected: false },
    ]);
    component.toggleSubArea({ id: 'B' } as AreaVo);
    expect(component.subAreas().find((a) => a.id === 'B')!.selected).toBe(true);
    httpTesting.verify(); // no requests
  });

  describe('pdf()', () => {
    let openSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      openSpy = vi.fn();
      vi.spyOn(window, 'open').mockImplementation(openSpy);
    });

    it('should include both mainType params when both selected', () => {
      component.mainTypes.set({ NW: true, NM: true });
      component.rootArea.set({ id: 'dk' });
      component.pdf();
      const url = openSpy.mock.calls[0][0] as string;
      expect(url).toContain('mainType=NW');
      expect(url).toContain('mainType=NM');
    });

    it('should include only NW when NM is false', () => {
      component.mainTypes.set({ NW: true, NM: false });
      component.rootArea.set({ id: 'dk' });
      component.pdf();
      const url = openSpy.mock.calls[0][0] as string;
      expect(url).toContain('mainType=NW');
      expect(url).not.toContain('mainType=NM');
    });

    it('should include areaId from rootArea', () => {
      component.mainTypes.set({ NW: true, NM: false });
      component.rootArea.set({ id: 'dk' });
      component.pdf();
      const url = openSpy.mock.calls[0][0] as string;
      expect(url).toContain('areaId=dk');
    });

    it('should include active=true when activeNow', () => {
      component.mainTypes.set({ NW: true, NM: false });
      component.rootArea.set({ id: 'dk' });
      component.activeNow.set(true);
      component.pdf();
      const url = openSpy.mock.calls[0][0] as string;
      expect(url).toContain('active=true');
    });

    it('should include subAreaId for selected sub-areas', () => {
      component.mainTypes.set({ NW: true, NM: false });
      component.rootArea.set({ id: 'dk' });
      component.subAreas.set([
        { id: 'A', selected: true },
        { id: 'B', selected: false },
        { id: 'C', selected: true },
      ]);
      component.pdf();
      const url = openSpy.mock.calls[0][0] as string;
      expect(url).toContain('subAreaId=A');
      expect(url).not.toContain('subAreaId=B');
      expect(url).toContain('subAreaId=C');
    });
  });

  describe('refreshMessages()', () => {
    it('should return early without rootArea', () => {
      component.refreshMessages();
      httpTesting.verify(); // no requests
    });

    it('should construct correct query', () => {
      component.rootArea.set({ id: 'dk' });
      component.mainTypes.set({ NW: true, NM: false });
      component.activeNow.set(true);
      component.refreshMessages();
      const req = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/messages'));
      expect(req.request.url).toContain('language=en');
      expect(req.request.url).toContain('active=true');
      expect(req.request.url).toContain('mainType=NW');
      expect(req.request.url).not.toContain('mainType=NM');
      expect(req.request.url).toContain('areaId=dk');
      req.flush([]);
    });

    it('should cancel previous request on re-call', () => {
      component.rootArea.set({ id: 'dk' });
      component.refreshMessages();
      component.refreshMessages();
      // Two requests made but first should be cancelled
      const reqs = httpTesting.match((r) => r.url.includes('/api/rest/public/v1/messages'));
      expect(reqs.length).toBe(2);
      expect(reqs[0].cancelled).toBe(true);
      reqs[1].flush([]);
    });
  });
});
