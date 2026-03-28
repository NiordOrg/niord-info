import { Component, ChangeDetectionStrategy, DestroyRef, inject, signal, computed, effect, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, Subscription } from 'rxjs';
import { MessageFilterComponent } from './components/message-filter/message-filter.component';
import { LanguageService } from '../../core/services/language.service';
import { MessageService } from '../../core/services/message.service';
import { AppConfigService } from '../../core/services/app-config.service';
import { MessageVo, AreaVo } from '../../core/models/message.model';

@Component({
  selector: 'app-messages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, MessageFilterComponent],
  template: `
    <app-message-filter
      [areaRoots]="areaRoots()"
      [rootArea]="rootArea()"
      [subAreas]="subAreas()"
      [mainTypes]="mainTypes()"
      [activeNow]="activeNow()"
      (rootAreaChange)="updateRootArea($event)"
      (mainTypesChange)="updateMainTypes($event)"
      (activeNowChange)="toggleActiveNow()"
      (subAreaToggle)="toggleSubArea($event)"
      (printRequested)="pdf()"
    />
    <router-outlet />
  `,
})
export class MessagesComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly languageService = inject(LanguageService);
  private readonly messageService = inject(MessageService);
  private readonly appConfig = inject(AppConfigService);
  private messagesSub?: Subscription;

  constructor() {
    // Re-fetch messages when language changes externally (e.g. from the menu)
    let initialSkip = true;
    effect(() => {
      this.languageService.language();
      if (initialSkip) {
        initialSkip = false;
        return;
      }
      this.refreshMessages();
    });
  }

  readonly areaRoots = signal<AreaVo[]>([]);
  readonly rootArea = signal<AreaVo | undefined>(undefined);
  readonly mainTypes = signal<{ NW: boolean; NM: boolean }>({
    NW: localStorage.getItem('NW') !== 'false',
    NM: localStorage.getItem('NM') !== 'false',
  });
  readonly activeNow = signal(false);
  readonly areaMessages = signal<MessageVo[]>([]);
  readonly subAreas = signal<AreaVo[]>([]);
  readonly loading = signal(true);

  readonly messages = computed(() => {
    const selectedAreaIds = this.subAreas()
      .filter((area) => area.selected)
      .map((area) => area.id);
    return this.messageService.filterByAreaIds(this.areaMessages(), selectedAreaIds);
  });

  ngOnInit(): void {
    const specs = this.appConfig.rootAreaSpecs();
    if (specs.length === 0) {
      this.loading.set(false);
      return;
    }

    const requests = specs.map((spec) =>
      this.http.get<AreaVo>(`/api/rest/public/v1/area/${encodeURIComponent(spec.areaId)}`),
    );

    forkJoin(requests)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (areas) => {
          const roots = areas.map((area, i) => ({
            ...area,
            latitude: specs[i].latitude,
            longitude: specs[i].longitude,
            zoomLevel: specs[i].zoomLevel,
          }));
          this.areaRoots.set(roots);
          if (roots.length > 0) {
            const savedId = localStorage.getItem('rootAreaId');
            const match = roots.find((a) => a.id === savedId || a.mrn === savedId);
            this.updateRootArea(match || roots[0]);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  updateRootArea(area: AreaVo): void {
    this.rootArea.set(area);
    localStorage.setItem('rootAreaId', area.id);
    this.refreshMessages();
  }

  updateMainTypes(types: { NW: boolean; NM: boolean }): void {
    this.mainTypes.set(types);
    localStorage.setItem('NW', String(types.NW));
    localStorage.setItem('NM', String(types.NM));
    this.refreshMessages();
  }

  toggleActiveNow(): void {
    this.activeNow.update((v) => !v);
    this.refreshMessages();
  }

  toggleSubArea(area: AreaVo): void {
    this.subAreas.update((areas) =>
      areas.map((a) => (a.id === area.id ? { ...a, selected: !a.selected } : a)),
    );
  }

  pdf(): void {
    const types = this.mainTypes();
    const root = this.rootArea();
    const active = this.activeNow();
    const params = new URLSearchParams();

    if (types.NW) params.append('mainType', 'NW');
    if (types.NM) params.append('mainType', 'NM');
    if (root) params.append('areaId', root.id);
    if (active) params.append('active', 'true');

    for (const area of this.subAreas()) {
      if (area.selected) {
        params.append('subAreaId', area.id);
      }
    }

    window.open(`/messages/print?${params.toString()}`, '_blank');
  }

  refreshMessages(): void {
    const language = this.languageService.language();
    const types = this.mainTypes();
    const activeNow = this.activeNow();
    const rootArea = this.rootArea();
    if (!rootArea) return;

    let params = `language=${language}`;
    if (activeNow) params += '&active=true';
    if (types.NW) params += '&mainType=NW';
    if (types.NM) params += '&mainType=NM';
    params += `&areaId=${rootArea.id}`;

    this.messagesSub?.unsubscribe();
    this.messagesSub = this.http
      .get<MessageVo[]>(`/api/rest/public/v1/messages?${params}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (messages) => {
          const sorted = messages.map((m) => this.messageService.sortDescs(m, language));
          this.checkGroupByArea(sorted);
          this.areaMessages.set(sorted);
        },
      });
  }

  private checkGroupByArea(messages: MessageVo[]): void {
    this.messageService.addAreaHeadings(messages);
    const newSubAreas = messages
      .filter((msg) => msg.areaHeading?.parent)
      .map((msg) => msg.areaHeading!);
    this.subAreas.set(newSubAreas);
  }
}
