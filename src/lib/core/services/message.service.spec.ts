import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslocoService } from '@jsverse/transloco';
import { MessageService } from './message.service';
import { LanguageService } from './language.service';
import { provideTestNiordConfig } from '../../testing/test-config';
import { MessageVo, AreaVo, DescVo } from '../models/message.model';

describe('MessageService', () => {
  let service: MessageService;
  let httpTesting: HttpTestingController;
  let translocoSpy: { translate: ReturnType<typeof vi.fn>; setActiveLang: ReturnType<typeof vi.fn>; setAvailableLangs: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    translocoSpy = {
      translate: vi.fn((key: string) => key),
      setActiveLang: vi.fn(),
      setAvailableLangs: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideTestNiordConfig(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TranslocoService, useValue: translocoSpy },
      ],
    });
    service = TestBed.inject(MessageService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  // --- desc() ---

  describe('desc()', () => {
    it('should return desc matching language', () => {
      const descs: DescVo[] = [{ lang: 'da', title: 'Danish' }, { lang: 'en', title: 'English' }];
      expect(service.desc({ descs }, 'en')?.title).toBe('English');
    });

    it('should fall back to first desc when no lang match', () => {
      const descs: DescVo[] = [{ lang: 'da', title: 'Danish' }];
      expect(service.desc({ descs }, 'fr')?.title).toBe('Danish');
    });

    it('should return undefined for empty descs', () => {
      expect(service.desc({ descs: [] })).toBeUndefined();
    });

    it('should return undefined for undefined input', () => {
      expect(service.desc(undefined)).toBeUndefined();
    });

    it('should use LanguageService default when no lang passed', () => {
      const descs: DescVo[] = [{ lang: 'en', title: 'English' }, { lang: 'da', title: 'Danish' }];
      expect(service.desc({ descs })?.title).toBe('English');
    });
  });

  // --- rootAreaOf() ---

  describe('rootAreaOf()', () => {
    it('should walk parent chain to root', () => {
      const root: AreaVo = { id: '1' };
      const child: AreaVo = { id: '2', parent: root };
      const leaf: AreaVo = { id: '3', parent: child };
      expect(service.rootAreaOf(leaf)).toBe(root);
    });

    it('should return self when no parent', () => {
      const area: AreaVo = { id: '1' };
      expect(service.rootAreaOf(area)).toBe(area);
    });

    it('should return undefined for undefined input', () => {
      expect(service.rootAreaOf(undefined)).toBeUndefined();
    });
  });

  // --- messageIdLabelHtml() ---

  describe('messageIdLabelHtml()', () => {
    it('should return empty string for undefined msg', () => {
      expect(service.messageIdLabelHtml(undefined)).toBe('');
    });

    it('should render NW shortId with correct class', () => {
      const msg = { id: '1', mainType: 'NW' as const, shortId: 'DK-001' };
      const html = service.messageIdLabelHtml(msg);
      expect(html).toContain('label-message-nw');
      expect(html).toContain('DK-001');
    });

    it('should render NM class', () => {
      const msg = { id: '1', mainType: 'NM' as const, shortId: 'NM-002' };
      expect(service.messageIdLabelHtml(msg)).toContain('label-message-nm');
    });

    it('should use translated type+mainType when no shortId', () => {
      const msg = { id: '1', mainType: 'NW' as const, type: 'TEMPORARY_NOTICE' };
      service.messageIdLabelHtml(msg);
      expect(translocoSpy.translate).toHaveBeenCalledWith('TYPE_TEMPORARY_NOTICE');
      expect(translocoSpy.translate).toHaveBeenCalledWith('MAIN_TYPE_NW');
    });

    it('should append (T) for TEMPORARY_NOTICE', () => {
      const msg = { id: '1', mainType: 'NW' as const, type: 'TEMPORARY_NOTICE', shortId: 'X' };
      expect(service.messageIdLabelHtml(msg)).toContain('(T)');
    });

    it('should append (P) for PRELIMINARY_NOTICE', () => {
      const msg = { id: '1', mainType: 'NW' as const, type: 'PRELIMINARY_NOTICE', shortId: 'X' };
      expect(service.messageIdLabelHtml(msg)).toContain('(P)');
    });

    it('should show status badge for EXPIRED non-PERMANENT', () => {
      const msg = { id: '1', mainType: 'NW' as const, shortId: 'X', status: 'EXPIRED', type: 'TEMPORARY_NOTICE' };
      const html = service.messageIdLabelHtml(msg, true);
      expect(html).toContain('label-message-status');
      expect(translocoSpy.translate).toHaveBeenCalledWith('STATUS_EXPIRED');
    });

    it('should NOT show status badge for EXPIRED PERMANENT_NOTICE', () => {
      const msg = { id: '1', mainType: 'NW' as const, shortId: 'X', status: 'EXPIRED', type: 'PERMANENT_NOTICE' };
      const html = service.messageIdLabelHtml(msg, true);
      expect(html).not.toContain('label-message-status');
    });

    it('should show status badge for CANCELLED', () => {
      const msg = { id: '1', mainType: 'NW' as const, shortId: 'X', status: 'CANCELLED' };
      const html = service.messageIdLabelHtml(msg, true);
      expect(html).toContain('label-message-status');
      expect(translocoSpy.translate).toHaveBeenCalledWith('STATUS_CANCELLED');
    });
  });

  // --- sortDescs() ---

  describe('sortDescs()', () => {
    const mkMsg = (descs: DescVo[]): MessageVo => ({
      id: '1',
      mainType: 'NW',
      descs,
    });

    it('should reorder lang to front in msg.descs', () => {
      const msg = mkMsg([{ lang: 'da', title: 'DA' }, { lang: 'en', title: 'EN' }]);
      const sorted = service.sortDescs(msg, 'en');
      expect(sorted.descs![0].lang).toBe('en');
    });

    it('should also reorder area descs', () => {
      const msg: MessageVo = {
        id: '1',
        mainType: 'NW',
        descs: [{ lang: 'en' }],
        areas: [{ id: '1', descs: [{ lang: 'da' }, { lang: 'en' }] }],
      };
      const sorted = service.sortDescs(msg, 'en');
      expect(sorted.areas![0].descs![0].lang).toBe('en');
    });

    it('should handle message with no parts/refs/attachments', () => {
      const msg = mkMsg([{ lang: 'en' }]);
      expect(() => service.sortDescs(msg, 'en')).not.toThrow();
    });

    it('should not mutate original message', () => {
      const descs: DescVo[] = [{ lang: 'da' }, { lang: 'en' }];
      const msg = mkMsg(descs);
      service.sortDescs(msg, 'en');
      expect(msg.descs![0].lang).toBe('da');
    });
  });

  // --- computeAreaHeadings() ---

  describe('computeAreaHeadings()', () => {
    it('should return heading for first message of group', () => {
      const area: AreaVo = { id: 'A' };
      const msgs: MessageVo[] = [
        { id: '1', mainType: 'NW', areas: [area] },
        { id: '2', mainType: 'NW', areas: [area] },
      ];
      const headings = service.computeAreaHeadings(msgs);
      expect(headings.get('1')).toBeDefined();
      expect(headings.has('2')).toBe(false);
    });

    it('should return headings for subsequent different areas', () => {
      const msgs: MessageVo[] = [
        { id: '1', mainType: 'NW', areas: [{ id: 'A' }] },
        { id: '2', mainType: 'NW', areas: [{ id: 'B' }] },
      ];
      const headings = service.computeAreaHeadings(msgs);
      expect(headings.get('1')).toBeDefined();
      expect(headings.get('2')).toBeDefined();
    });

    it('should respect maxLevels with nested areas', () => {
      const root: AreaVo = { id: 'root' };
      const mid: AreaVo = { id: 'mid', parent: root };
      const leaf: AreaVo = { id: 'leaf', parent: mid };
      const msgs: MessageVo[] = [{ id: '1', mainType: 'NW', areas: [leaf] }];
      const headings = service.computeAreaHeadings(msgs, 2);
      expect(headings.get('1')!.id).toBe('mid');
    });

    it('should skip messages with no areas', () => {
      const msgs: MessageVo[] = [{ id: '1', mainType: 'NW' }];
      const headings = service.computeAreaHeadings(msgs);
      expect(headings.has('1')).toBe(false);
    });

    it('should not mutate messages', () => {
      const msgs: MessageVo[] = [{ id: '1', mainType: 'NW', areas: [{ id: 'A' }] }];
      service.computeAreaHeadings(msgs);
      expect((msgs[0] as Record<string, unknown>)['areaHeading']).toBeUndefined();
    });
  });

  // --- filterByAreaIds() ---

  describe('filterByAreaIds()', () => {
    it('should return all messages when areaIds is empty', () => {
      const msgs: MessageVo[] = [{ id: '1', mainType: 'NW' }];
      expect(service.filterByAreaIds(msgs, [])).toEqual(msgs);
    });

    it('should match direct area id', () => {
      const msgs: MessageVo[] = [
        { id: '1', mainType: 'NW', areas: [{ id: 'A' }] },
        { id: '2', mainType: 'NW', areas: [{ id: 'B' }] },
      ];
      const result = service.filterByAreaIds(msgs, ['A']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should match parent lineage', () => {
      const parent: AreaVo = { id: 'P' };
      const child: AreaVo = { id: 'C', parent };
      const msgs: MessageVo[] = [{ id: '1', mainType: 'NW', areas: [child] }];
      expect(service.filterByAreaIds(msgs, ['P'])).toHaveLength(1);
    });

    it('should match when message has multiple areas', () => {
      const msgs: MessageVo[] = [
        { id: '1', mainType: 'NW', areas: [{ id: 'A' }, { id: 'B' }] },
      ];
      expect(service.filterByAreaIds(msgs, ['B'])).toHaveLength(1);
    });
  });

  // --- featuresForMessage() ---

  describe('featuresForMessage()', () => {
    it('should extract features from parts', () => {
      const msg: MessageVo = {
        id: '1',
        mainType: 'NW',
        parts: [
          {
            type: 'DETAILS',
            geometry: {
              type: 'FeatureCollection',
              features: [{ type: 'Feature', properties: {} }],
            },
          },
        ],
      };
      expect(service.featuresForMessage(msg)).toHaveLength(1);
    });

    it('should return empty for no parts', () => {
      expect(service.featuresForMessage({ id: '1', mainType: 'NW' })).toEqual([]);
    });

    it('should return empty for parts with no geometry', () => {
      const msg: MessageVo = {
        id: '1',
        mainType: 'NW',
        parts: [{ type: 'DETAILS' }],
      };
      expect(service.featuresForMessage(msg)).toEqual([]);
    });
  });

  // --- getMessages() ---

  describe('getMessages()', () => {
    it('should make GET with query string', () => {
      service.getMessages('language=en&mainType=NW').subscribe();
      const req = httpTesting.expectOne('/api/rest/public/v1/messages?language=en&mainType=NW');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  // --- getMessageDetails() ---

  describe('getMessageDetails()', () => {
    it('should make GET with encoded id and lang param', () => {
      service.getMessageDetails('NW/123').subscribe();
      const req = httpTesting.expectOne((r) => r.url.includes('/api/rest/public/v1/message/'));
      expect(req.request.url).toBe('/api/rest/public/v1/message/NW%2F123?lang=en');
      req.flush({ id: 'NW/123', mainType: 'NW' });
    });

    it('should return the response', () => {
      const expected: MessageVo = { id: '1', mainType: 'NW' };
      let result: MessageVo | undefined;
      service.getMessageDetails('1').subscribe((r) => (result = r));
      httpTesting.expectOne(() => true).flush(expected);
      expect(result).toEqual(expected);
    });
  });
});
