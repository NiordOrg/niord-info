import { NiordInfoConfig } from './niord-info.config';

/**
 * JSON-serializable subset of NiordInfoConfig that can vary per deployment
 * without rebuilding the Angular app.
 */
export type NiordInfoRuntimeConfig = Partial<
  Pick<NiordInfoConfig, 'defaultLanguage' | 'timeZone' | 'executionMode' | 'wmsLayer' | 'apiBaseUrl'>
>;

interface LoadRuntimeConfigOptions {
  url?: string;
  fetch?: (input: string, init?: RequestInit) => Promise<Pick<Response, 'ok' | 'status' | 'json'>>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseNiordInfoRuntimeConfig(value: unknown): NiordInfoRuntimeConfig {
  if (!isRecord(value)) {
    throw new Error('runtime-config.json must contain a JSON object');
  }

  const config: NiordInfoRuntimeConfig = {};
  const stringKeys = ['defaultLanguage', 'timeZone', 'executionMode', 'apiBaseUrl'] as const;

  for (const key of stringKeys) {
    const runtimeValue = value[key];
    if (runtimeValue === undefined) continue;
    if (typeof runtimeValue !== 'string') {
      throw new Error(`runtime-config.json field "${key}" must be a string`);
    }
    config[key] = runtimeValue;
  }

  if (value['wmsLayer'] !== undefined) {
    if (typeof value['wmsLayer'] !== 'boolean') {
      throw new Error('runtime-config.json field "wmsLayer" must be a boolean');
    }
    config.wmsLayer = value['wmsLayer'];
  }

  return config;
}

/**
 * Loads runtime-config.json and overlays it onto the static app config.
 * A missing file falls back to the static config so `ng serve` works unchanged.
 */
export async function loadNiordInfoRuntimeConfig(
  staticConfig: NiordInfoConfig,
  options: LoadRuntimeConfigOptions = {},
): Promise<NiordInfoConfig> {
  const fetchRuntimeConfig = options.fetch ?? globalThis.fetch?.bind(globalThis);
  if (!fetchRuntimeConfig) {
    throw new Error('loadNiordInfoRuntimeConfig requires fetch support');
  }

  const response = await fetchRuntimeConfig(options.url ?? 'runtime-config.json');

  if (response.status === 404) {
    return staticConfig;
  }

  if (!response.ok) {
    throw new Error(`Failed to load runtime config: HTTP ${response.status}`);
  }

  return { ...staticConfig, ...parseNiordInfoRuntimeConfig(await response.json()) };
}
