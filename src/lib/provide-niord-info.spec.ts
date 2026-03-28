import { TestBed } from '@angular/core/testing';
import { provideNiordInfo } from './provide-niord-info';
import { NIORD_INFO_CONFIG, NiordInfoConfig } from './niord-info.config';
import { TEST_CONFIG } from './testing/test-config';

describe('provideNiordInfo()', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideNiordInfo(TEST_CONFIG)],
    });
  });

  it('should provide NIORD_INFO_CONFIG token', () => {
    const config = TestBed.inject(NIORD_INFO_CONFIG);
    expect(config).toBeDefined();
  });

  it('should expose config values', () => {
    const config = TestBed.inject(NIORD_INFO_CONFIG);
    expect(config.languages).toEqual(TEST_CONFIG.languages);
    expect(config.timeZone).toBe(TEST_CONFIG.timeZone);
  });

  it('should pass config through without mutation', () => {
    const config = TestBed.inject(NIORD_INFO_CONFIG);
    expect(config).toBe(TEST_CONFIG);
  });
});
