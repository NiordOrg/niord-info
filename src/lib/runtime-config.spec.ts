import { loadNiordInfoRuntimeConfig, parseNiordInfoRuntimeConfig } from './runtime-config';
import { TEST_CONFIG } from './testing/test-config';

describe('runtime-config', () => {
  it('should parse valid runtime config', () => {
    expect(
      parseNiordInfoRuntimeConfig({
        executionMode: 'TEST',
        apiBaseUrl: 'https://niord.example.com',
        wmsLayer: true,
      }),
    ).toEqual({
      executionMode: 'TEST',
      apiBaseUrl: 'https://niord.example.com',
      wmsLayer: true,
    });
  });

  it('should reject invalid field types', () => {
    expect(() => parseNiordInfoRuntimeConfig({ executionMode: 123 })).toThrow(
      'runtime-config.json field "executionMode" must be a string',
    );
  });

  it('should fall back to static config when runtime config is missing', async () => {
    const config = await loadNiordInfoRuntimeConfig(TEST_CONFIG, {
      fetch: vi.fn(async () => ({
        ok: false,
        status: 404,
        json: async () => ({}),
      })),
    });

    expect(config).toEqual(TEST_CONFIG);
  });

  it('should overlay runtime config onto the static config', async () => {
    const config = await loadNiordInfoRuntimeConfig(TEST_CONFIG, {
      fetch: vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          executionMode: 'TEST',
          apiBaseUrl: 'https://niord.example.com',
        }),
      })),
    });

    expect(config).toEqual({
      ...TEST_CONFIG,
      executionMode: 'TEST',
      apiBaseUrl: 'https://niord.example.com',
    });
  });
});
