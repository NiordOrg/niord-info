import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MainMenuComponent } from './main-menu.component';
import { provideTestNiordConfig, getTranslocoTestingModule } from '../../../testing/test-config';

describe('MainMenuComponent', () => {
  let component: MainMenuComponent;
  let fixture: ComponentFixture<MainMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainMenuComponent, getTranslocoTestingModule()],
      providers: [
        provideTestNiordConfig(),
        provideRouter([]),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(MainMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should expose languages from config', () => {
    expect(component.languages()).toEqual(['en', 'da']);
  });

  it('should expose current language', () => {
    expect(component.currentLang()).toBe('en');
  });

  it('should show DEV badge for DEVELOPMENT mode', () => {
    expect(component.modeText()).toBe('DEV');
  });

  it('should delegate setLanguage to LanguageService', () => {
    component.setLanguage('da');
    expect(component.currentLang()).toBe('da');
  });
});
