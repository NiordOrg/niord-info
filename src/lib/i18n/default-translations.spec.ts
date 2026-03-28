import { DEFAULT_TRANSLATIONS } from './default-translations';

describe('DEFAULT_TRANSLATIONS', () => {
  it('should have English translations', () => {
    expect(DEFAULT_TRANSLATIONS['en']).toBeDefined();
    expect(typeof DEFAULT_TRANSLATIONS['en']).toBe('object');
  });

  it('should contain critical keys', () => {
    const en = DEFAULT_TRANSLATIONS['en'];
    const criticalKeys = [
      'MENU_NW', 'MENU_NM', 'MENU_DETAILS', 'MENU_MAP', 'MENU_TABLE',
      'MENU_PUBLICATIONS', 'MENU_PRINT', 'PRINT_BANNER', 'PRINT_DATE_FORMAT',
      'STATUS_CANCELLED', 'STATUS_EXPIRED', 'MAIN_TYPE_NW', 'MAIN_TYPE_NM',
    ];
    for (const key of criticalKeys) {
      expect(en[key]).toBeDefined();
    }
  });

  it('should have no unintended empty values except MAP_ACCESSIBILITY and MAP_COPYRIGHT', () => {
    const en = DEFAULT_TRANSLATIONS['en'];
    const allowedEmpty = ['MAP_ACCESSIBILITY', 'MAP_COPYRIGHT'];
    for (const [key, value] of Object.entries(en)) {
      if (!allowedEmpty.includes(key)) {
        expect(value).not.toBe('');
      }
    }
  });
});
