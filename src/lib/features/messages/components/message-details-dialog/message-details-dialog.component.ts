import { Component, ChangeDetectionStrategy, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslocoPipe } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';
import { MessageDetailCardComponent } from '../message-detail-card/message-detail-card.component';
import { MessageMapComponent } from '../message-map/message-map.component';
import { MessageService } from '../../../../core/services/message.service';
import { LanguageService } from '../../../../core/services/language.service';
import { MessageVo } from '../../../../core/models/message.model';

@Component({
  selector: 'app-message-details-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, SafeHtmlPipe, MessageDetailCardComponent, MessageMapComponent],
  template: `
    <div class="modal-body print" style="padding: 0">
      <div class="message-details-dialog-banner">
        @if (msg(); as m) {
          <span [innerHTML]="'MENU_' + m.mainType | transloco | safeHtml"></span>
        }
        &nbsp;
        <button type="button" class="btn-close float-end" aria-label="Close"
                (click)="activeModal.dismiss()"></button>
      </div>

      <div style="padding: 15px">
        @if (warning(); as w) {
          <div class="message-details-dialog-error">
            <p>
              <span class="bi bi-exclamation-triangle"></span>
              <span [innerHTML]="w | safeHtml"></span>
            </p>
          </div>
        }

        @if (msg(); as m) {
          @if (hasGeometry() && showMap()) {
            <div class="message-details-map">
              <app-message-map
                class="message-map"
                [message]="m"
                [fitExtent]="true"
                [showNoPosMessages]="false"
                maxZoom="12"
              />
            </div>
          }

          <app-message-detail-card
            [msg]="m"
            format="details"
            (showDetails)="selectMessage($event)"
          />
        }

        <div class="row no-print" style="margin-top: 24px">
          <div class="col-8" style="text-align: left">
            @if (pushedMessageIds().length === 1 && showNavigation()) {
              <div class="btn-group">
                <button type="button" class="btn btn-primary btn-sm" (click)="selectPrev()"
                        [disabled]="currentIndex() < 1" aria-label="Previous message">
                  <span class="bi bi-chevron-left"></span>
                </button>
                <button type="button" class="btn btn-primary btn-sm" (click)="selectNext()"
                        [disabled]="currentIndex() >= messageIds.length - 1" aria-label="Next message">
                  <span class="bi bi-chevron-right"></span>
                </button>
              </div>
            }

            @if (pushedMessageIds().length > 1) {
              <div class="btn-group" style="margin-left: 6px">
                <button type="button" class="btn btn-primary btn-sm" (click)="back()">
                  <span class="bi bi-skip-backward"></span> back
                </button>
              </div>
            }

            @if (msg()) {
              <button type="button" class="btn btn-primary btn-sm" style="margin-left: 6px"
                      (click)="printMessage()" aria-label="Print message">
                <span class="bi bi-printer"></span>
              </button>
            }
          </div>

          <div class="col-4" style="text-align: right">
            <button type="button" class="btn btn-primary btn-sm" (click)="activeModal.dismiss()">
              {{ 'BTN_CLOSE' | transloco }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MessageDetailsDialogComponent implements OnInit {
  readonly activeModal = inject(NgbActiveModal);
  private readonly messageService = inject(MessageService);
  private readonly languageService = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);

  messageId!: string;
  messageIds: string[] = [];

  readonly msg = signal<MessageVo | undefined>(undefined);
  readonly warning = signal<string | undefined>(undefined);
  readonly pushedMessageIds = signal<string[]>([]);
  readonly showMap = signal(true);
  readonly currentIndex = signal(-1);

  readonly showNavigation = computed(() => this.currentIndex() >= 0);
  readonly hasGeometry = computed(() => this.messageService.featuresForMessage(this.msg()).length > 0);

  ngOnInit(): void {
    this.pushedMessageIds.set([this.messageId]);
    this.currentIndex.set(this.messageIds.indexOf(this.messageId));
    this.loadMessageDetails();
  }

  selectPrev(): void {
    const idx = this.currentIndex();
    if (this.pushedMessageIds().length === 1 && idx > 0) {
      this.currentIndex.set(idx - 1);
      this.pushedMessageIds.set([this.messageIds[idx - 1]]);
      this.loadMessageDetails();
    }
  }

  selectNext(): void {
    const idx = this.currentIndex();
    if (this.pushedMessageIds().length === 1 && idx >= 0 && idx < this.messageIds.length - 1) {
      this.currentIndex.set(idx + 1);
      this.pushedMessageIds.set([this.messageIds[idx + 1]]);
      this.loadMessageDetails();
    }
  }

  selectMessage(messageId: string): void {
    this.pushedMessageIds.update((ids) => [...ids, messageId]);
    this.loadMessageDetails();
  }

  back(): void {
    if (this.pushedMessageIds().length > 1) {
      this.pushedMessageIds.update((ids) => ids.slice(0, -1));
      this.loadMessageDetails();
    }
  }

  printMessage(): void {
    const id = this.currentMessageId();
    window.open(`/messages/print?messageId=${encodeURIComponent(id)}`, '_blank');
  }

  private currentMessageId(): string {
    const ids = this.pushedMessageIds();
    return ids[ids.length - 1];
  }

  private loadMessageDetails(): void {
    const id = this.currentMessageId();
    const lang = this.languageService.language();
    this.messageService.getMessageDetails(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.warning.set(data ? undefined : `Message ${id} is not available`);
        this.msg.set(data ? this.messageService.sortDescs(data, lang) : undefined);
        this.showMap.set(true);
        if (data?.attachments) {
          const above = data.attachments.filter((a) => a.display === 'ABOVE');
          if (above.length > 0) this.showMap.set(false);
        }
      },
      error: () => {
        this.msg.set(undefined);
        this.warning.set(`Message ${id} is not available`);
      },
    });
  }
}
