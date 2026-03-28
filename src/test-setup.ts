import '@analogjs/vitest-angular/setup-zone';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

setupTestBed();

// OpenLayers imports trigger document.createElement('canvas') at module level.
// jsdom's canvas returns null from getContext(). Provide a minimal mock.
HTMLCanvasElement.prototype.getContext = (() => null) as never;

// Clear localStorage between tests to prevent LanguageService state leaking.
beforeEach(() => localStorage.clear());
