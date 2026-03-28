import { TestBed } from '@angular/core/testing';
import { AppConfigService } from './app-config.service';
import { provideTestNiordConfig, TEST_CONFIG } from '../../testing/test-config';

describe('AppConfigService', () => {
  let service: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideTestNiordConfig()] });
    service = TestBed.inject(AppConfigService);
  });

  it('should expose languages from config', () => {
    expect(service.languages()).toEqual(TEST_CONFIG.languages);
  });

  it('should expose timeZone from config', () => {
    expect(service.timeZone()).toBe(TEST_CONFIG.timeZone);
  });

  it('should expose executionMode from config', () => {
    expect(service.executionMode()).toBe('DEVELOPMENT');
  });

  it('should expose wmsLayer from config', () => {
    expect(service.wmsLayer()).toBe(false);
  });

  it('should expose rootAreaSpecs from config', () => {
    expect(service.rootAreaSpecs()).toEqual(TEST_CONFIG.rootAreas);
  });
});
