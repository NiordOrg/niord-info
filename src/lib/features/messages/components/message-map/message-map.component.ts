import {
  Component,
  ChangeDetectionStrategy,
  input,
  inject,
  signal,
  computed,
  effect,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  NgZone,
  viewChild,
} from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { take } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';
import { MessageIdBadgeComponent } from '../message-id-badge/message-id-badge.component';
import { MapService } from '../../../../core/services/map.service';
import { MessageService } from '../../../../core/services/message.service';
import { LanguageService } from '../../../../core/services/language.service';
import { AppConfigService } from '../../../../core/services/app-config.service';
import { MessageVo, AreaVo } from '../../../../core/models/message.model';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import OSM from 'ol/source/OSM.js';
import TileWMS from 'ol/source/TileWMS.js';
import Collection from 'ol/Collection.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import { Circle as CircleStyle, Fill, Icon, Stroke, Style, Text } from 'ol/style.js';
import { fromLonLat, toLonLat } from 'ol/proj.js';
import { createEmpty, extend, isEmpty } from 'ol/extent.js';
import { defaults as defaultControls } from 'ol/control/defaults.js';
import { defaults as defaultInteractions } from 'ol/interaction/defaults.js';

@Component({
  selector: 'app-message-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoPipe, SafeHtmlPipe, MessageIdBadgeComponent],
  host: { style: 'display: block;' },
  template: `
    <div #mapContainer style="width: 100%; height: 100%"></div>

    <div #tooltipEl class="map-tooltip" style="display: none"></div>

    @if (showDebug()) {
      <div class="map-debug-box">
        <strong>Map Debug (new)</strong><br/>
        Zoom: {{ debugZoom() }}<br/>
        Center: {{ debugCenter() }}<br/>
        Map size: {{ debugMapSize() }}<br/>
        maxZoom (input): {{ maxZoom() }}<br/>
        fitExtent: {{ fitExtent() }}<br/>
        rootArea: {{ debugRootArea() }}<br/>
        NW features: {{ debugNwCount() }}<br/>
        NM features: {{ debugNmCount() }}<br/>
        Last fitExtent zoom: {{ debugFitZoom() }}
      </div>
    }

    @if (layerSwitcherLayers().length > 0) {
      <div class="map-layer-switcher">
        <ul>
          @for (l of layerSwitcherLayers(); track l.name) {
            <li>
              <label>
                <input type="checkbox" [checked]="l.visible" (change)="toggleLayerVisibility(l)" />
                &nbsp;<span [innerHTML]="l.name | safeHtml"></span>
              </label>
            </li>
          }
        </ul>
      </div>
    }

    @if (showNoPosMessages() && noPosMessages().length > 0) {
      <div class="message-map-general-messages">
        <div>
          <h4>
            {{ 'NO_POS_MSGS' | transloco }}
            <span class="float-end message-map-general-messages-link">
              <button type="button" class="btn btn-link p-0" style="font-size: 10px"
                      (click)="toggleMinimize()">
                @if (minimizeNoPosMessages()) {
                  {{ 'MAXIMIZE' | transloco }}
                } @else {
                  {{ 'MINIMIZE' | transloco }}
                }
              </button>
            </span>
          </h4>
        </div>
        @if (!minimizeNoPosMessages()) {
          @for (msg of noPosMessages(); track msg.id) {
            <div class="compact-message-list clickable"
                 (click)="openMessageDialog(msg.id)"
                 (keydown.enter)="openMessageDialog(msg.id)"
                 role="button" tabindex="0">
              <app-message-id-badge [msg]="msg" [showStatus]="true" />
              @if (msg.descs) {
                <strong>{{ msg.descs[0].title }}</strong>
              }
            </div>
          }
        }
      </div>
    }
  `,
})
export class MessageMapComponent implements AfterViewInit, OnDestroy {
  private readonly mapService = inject(MapService);
  private readonly messageService = inject(MessageService);
  private readonly transloco = inject(TranslocoService);
  private readonly languageService = inject(LanguageService);
  private readonly appConfig = inject(AppConfigService);
  private readonly modal = inject(NgbModal);
  private readonly ngZone = inject(NgZone);
  private readonly elRef = inject(ElementRef);

  readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  readonly tooltipEl = viewChild.required<ElementRef<HTMLDivElement>>('tooltipEl');

  // Inputs
  messages = input<MessageVo[] | undefined>(undefined);
  message = input<MessageVo | undefined>(undefined);
  fitExtent = input(false);
  rootArea = input<AreaVo | undefined>(undefined);
  showNoPosMessages = input(false);
  maxZoom = input('10');
  osm = input<string>('');
  readOnly = input(false);
  centerPointZoomLevel = input(12);

  // State
  readonly showDebug = computed(() => this.appConfig.executionMode() === 'DEVELOPMENT');
  readonly noPosMessages = signal<MessageVo[]>([]);
  readonly minimizeNoPosMessages = signal(false);
  readonly layerSwitcherLayers = signal<{ name: string; layer: TileLayer<TileWMS> | VectorLayer<VectorSource>; visible: boolean }[]>([]);

  // Debug signals
  readonly debugZoom = signal<string>('—');
  readonly debugCenter = signal<string>('—');
  readonly debugMapSize = signal<string>('—');
  readonly debugNwCount = signal<number>(0);
  readonly debugNmCount = signal<number>(0);
  readonly debugFitZoom = signal<string>('—');
  readonly debugRootArea = signal<string>('none');

  private map!: Map;
  private nwLayer!: VectorLayer<VectorSource>;
  private nmLayer!: VectorLayer<VectorSource>;
  private labelLayer?: VectorLayer<VectorSource>;
  private osmSource?: OSM;
  private updateTimer: ReturnType<typeof setTimeout> | null = null;
  private mapSizeTimer: ReturnType<typeof setTimeout> | null = null;
  private resizeObserver?: ResizeObserver;

  private nwStyle!: Style;
  private nmStyle!: Style;
  private messageDetailsStyle!: Style;
  private bufferedStyle!: Style;

  private get detailsMap(): boolean {
    return this.message() !== undefined;
  }

  constructor() {
    this.initStyles();

    effect(() => {
      this.messages();
      this.message();
      this.rootArea();
      this.scheduleUpdate();
    });
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initMap();
      this.initResizeObserver();
      this.scheduleMapSizeUpdate();
    });
  }

  ngOnDestroy(): void {
    if (this.updateTimer) clearTimeout(this.updateTimer);
    if (this.mapSizeTimer) clearTimeout(this.mapSizeTimer);
    this.resizeObserver?.disconnect();
    this.map?.setTarget(undefined);
  }

  private initStyles(): void {
    this.nwStyle = new Style({
      fill: new Fill({ color: 'rgba(255, 255, 255, 0.3)' }),
      stroke: new Stroke({ color: '#8B008B', width: 1 }),
      image: new Icon({ anchor: [0.5, 0.5], scale: 0.3, src: 'assets/img/nw.png' }),
    });

    this.nmStyle = new Style({
      fill: new Fill({ color: 'rgba(255, 0, 255, 0.2)' }),
      stroke: new Stroke({ color: '#8B008B', width: 2 }),
      image: new Icon({ anchor: [0.5, 0.5], scale: 0.3, src: 'assets/img/nm.png' }),
    });

    this.messageDetailsStyle = new Style({
      fill: new Fill({ color: 'rgba(255, 0, 255, 0.2)' }),
      stroke: new Stroke({ color: '#8B008B', width: 2 }),
      image: new CircleStyle({
        radius: 4,
        fill: new Fill({ color: 'rgba(255, 0, 255, 0.2)' }),
        stroke: new Stroke({ color: 'darkmagenta', width: 1 }),
      }),
    });

    this.bufferedStyle = new Style({
      fill: new Fill({ color: 'rgba(100, 50, 100, 0.2)' }),
      stroke: new Stroke({ color: 'rgba(100, 50, 100, 0.6)', width: 1 }),
    });
  }

  private initMap(): void {
    const layers: (TileLayer<OSM | TileWMS> | VectorLayer<VectorSource>)[] = [];
    const switcherLayers: { name: string; layer: TileLayer<TileWMS> | VectorLayer<VectorSource>; visible: boolean }[] = [];

    // OSM layer
    this.osmSource = new OSM();
    if (this.osm() === 'ArcGIS') {
      this.osmSource.setUrl('//services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}');
    }
    // Set default attribution; update with translated values once translations load
    this.osmSource.setAttributions([
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors.',
    ]);
    this.transloco.selectTranslation().pipe(take(1)).subscribe(() => {
      this.osmSource?.setAttributions([
        this.transloco.translate('MAP_ACCESSIBILITY'),
        this.transloco.translate('MAP_COPYRIGHT'),
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors.',
      ]);
    });
    layers.push(new TileLayer({ source: this.osmSource }));

    // WMS layer (only for details map)
    if (this.detailsMap && this.appConfig.wmsLayer()) {
      const wmsLayer = new TileLayer({
        source: new TileWMS({
          url: '/wms/',
          params: { LAYERS: 'cells', TRANSPARENT: 'TRUE' },
          crossOrigin: '',
        }),
        visible: true,
      });
      layers.push(wmsLayer);
      switcherLayers.push({ layer: wmsLayer, name: this.transloco.translate('LAYER_WMS'), visible: true });
    }

    // NW layer
    this.nwLayer = new VectorLayer({
      source: new VectorSource({ features: new Collection(), wrapX: false }),
      style: (feature) => {
        if (feature.get('parentFeatureIds')) return [this.bufferedStyle];
        return [this.detailsMap ? this.messageDetailsStyle : this.nwStyle];
      },
    });
    layers.push(this.nwLayer);

    // NM layer
    this.nmLayer = new VectorLayer({
      source: new VectorSource({ features: new Collection(), wrapX: false }),
      style: (feature) => {
        if (feature.get('parentFeatureIds')) return [this.bufferedStyle];
        return [this.detailsMap ? this.messageDetailsStyle : this.nmStyle];
      },
    });
    layers.push(this.nmLayer);

    // Label layer (only for details map)
    if (this.detailsMap) {
      this.labelLayer = new VectorLayer({
        source: new VectorSource({ features: new Collection(), wrapX: false }),
      });
      layers.push(this.labelLayer);
      switcherLayers.push({ layer: this.labelLayer, name: this.transloco.translate('LAYER_LABELS'), visible: true });
    }

    this.layerSwitcherLayers.set(switcherLayers);

    const mapEl = this.mapContainer().nativeElement;

    // Create map
    const controls = this.readOnly() ? [] : defaultControls({ rotate: false });
    const interactions = this.readOnly() ? [] : defaultInteractions({ altShiftDragRotate: false, pinchRotate: false });

    const view = new View({
      center: fromLonLat([11, 56]),
      zoom: 6,
      constrainResolution: true,
    });

    this.map = new Map({
      target: mapEl,
      layers,
      view,
      controls,
      interactions,
    });

    // Interactive features for message list maps (not details, not read-only)
    if (!this.detailsMap && !this.readOnly()) {
      this.setupInteraction();
    }

    // Debug: update on every map move
    this.map.on('moveend', () => this.updateDebugInfo());
    this.map.getView().on('change:resolution', () => this.updateDebugInfo());

    // Initial update
    setTimeout(() => this.updateMessageLayers(), 100);
  }

  private initResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;
    this.resizeObserver = new ResizeObserver(() => this.scheduleMapSizeUpdate());
    this.resizeObserver.observe(this.mapContainer().nativeElement);
  }

  private scheduleMapSizeUpdate(): void {
    if (this.mapSizeTimer) clearTimeout(this.mapSizeTimer);
    this.mapSizeTimer = setTimeout(() => {
      this.mapSizeTimer = null;
      this.map?.updateSize();
    }, 100);
  }

  private setupInteraction(): void {
    const tooltipNative = this.tooltipEl().nativeElement;

    this.map.on('click', (evt) => {
      const messages = this.getMessagesForPixel(evt.pixel);
      if (messages.length >= 1) {
        tooltipNative.style.display = 'none';
        this.ngZone.run(() => this.openMessageDialog(messages[0].id));
      }
    });

    this.map.on('pointermove', (evt) => {
      if (evt.dragging) {
        tooltipNative.style.display = 'none';
        return;
      }
      const pixel = this.map.getEventPixel(evt.originalEvent);
      const messages = this.getMessagesForPixel(pixel);
      if (messages.length > 0) {
        tooltipNative.innerHTML = this.renderTooltipContent(messages);
        tooltipNative.style.left = pixel[0] + 'px';
        tooltipNative.style.top = (pixel[1] - 15) + 'px';
        tooltipNative.style.display = 'block';
        tooltipNative.style.transform = 'translate(-50%, -100%)';
      } else {
        tooltipNative.style.display = 'none';
      }
    });
  }

  private getMessagesForPixel(pixel: number[]): MessageVo[] {
    const messageIds = new Set<string>();
    const messages: MessageVo[] = [];
    this.map.forEachFeatureAtPixel(pixel, (feature, layer) => {
      const msg = feature.get('message') as MessageVo | undefined;
      if ((layer === this.nwLayer || layer === this.nmLayer) && msg && !messageIds.has(msg.id)) {
        messages.push(msg);
        messageIds.add(msg.id);
      }
    });
    return messages;
  }

  private renderTooltipContent(messages: MessageVo[]): string {
    const maxMessageNo = 3;
    let html = '';
    for (let x = 0; x < Math.min(messages.length, maxMessageNo); x++) {
      const msg = messages[x];
      html += '<div class="compact-message-list">';
      html += this.messageService.messageIdLabelHtml(msg);
      if (msg.descs?.length) {
        html += `<strong>${msg.descs[0].title}</strong>`;
      }
      html += '</div>';
    }
    if (messages.length > maxMessageNo) {
      html += '<div class="compact-message-list" style="text-align: center">';
      html += this.transloco.translate('MORE_MSGS', { messageNo: messages.length - maxMessageNo });
      html += '</div>';
    }
    return html;
  }

  openMessageDialog(messageId: string): void {
    import('../message-details-dialog/message-details-dialog.component').then((m) => {
      const ref = this.modal.open(m.MessageDetailsDialogComponent, { size: 'lg' });
      ref.componentInstance.messageId = messageId;
      const msgs = this.messages();
      ref.componentInstance.messageIds = msgs ? msgs.map((msg) => msg.id) : [messageId];
    });
  }

  toggleMinimize(): void {
    this.minimizeNoPosMessages.update((v) => !v);
  }

  toggleLayerVisibility(l: { name: string; layer: TileLayer<TileWMS> | VectorLayer<VectorSource>; visible: boolean }): void {
    l.visible = !l.visible;
    l.layer.setVisible(l.visible);
    this.layerSwitcherLayers.update((layers) => [...layers]);
  }

  private updateDebugInfo(): void {
    if (!this.map) return;
    const view = this.map.getView();
    const zoom = view.getZoom();
    const center = view.getCenter();
    const size = this.map.getSize();
    const ra = this.rootArea();

    this.ngZone.run(() => {
      this.debugZoom.set(zoom != null ? zoom.toFixed(2) : '—');
      if (center) {
        const lonLat = toLonLat(center);
        this.debugCenter.set(`${lonLat[1].toFixed(3)}, ${lonLat[0].toFixed(3)}`);
      }
      this.debugMapSize.set(size ? `${size[0]}x${size[1]}` : '—');
      this.debugNwCount.set(this.nwLayer?.getSource()?.getFeatures().length ?? 0);
      this.debugNmCount.set(this.nmLayer?.getSource()?.getFeatures().length ?? 0);
      this.debugRootArea.set(ra ? `${ra.id} (${ra.latitude}, ${ra.longitude}, z${ra.zoomLevel})` : 'none');
    });
  }

  private scheduleUpdate(): void {
    if (this.updateTimer) clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(() => this.updateMessageLayers(), 100);
  }

  private updateMessageLayers(): void {
    if (!this.map) return;

    const messageList = this.messages();
    const singleMessage = this.message();
    const allMessages = messageList ?? (singleMessage ? [singleMessage] : []);

    this.nwLayer.getSource()!.clear();
    this.nmLayer.getSource()!.clear();

    const noPos: MessageVo[] = [];
    const maxZoom = parseInt(this.maxZoom(), 10) || 10;

    for (const message of allMessages) {
      const features = this.messageService.featuresForMessage(message);
      if (features.length > 0) {
        const olFeatures: Feature[] = [];
        for (const gjFeature of features) {
          const olFeature = this.mapService.gjToOlFeature(gjFeature);
          olFeature.set('message', message);
          if (message.mainType === 'NW') {
            this.nwLayer.getSource()!.addFeature(olFeature);
          } else {
            this.nmLayer.getSource()!.addFeature(olFeature);
          }
          olFeatures.push(olFeature);
        }

        // Add center point for non-details maps at high zoom levels
        if (!this.detailsMap && this.shouldShowFeatureCenter(olFeatures)) {
          const center = this.mapService.getFeaturesCenter(olFeatures);
          if (center) {
            const centerFeature = new Feature({ geometry: new Point(center) });
            centerFeature.set('message', message);
            if (message.mainType === 'NW') {
              this.nwLayer.getSource()!.addFeature(centerFeature);
            } else {
              this.nmLayer.getSource()!.addFeature(centerFeature);
            }
          }
        }
      } else {
        noPos.push(message);
      }
    }

    this.ngZone.run(() => this.noPosMessages.set(noPos));

    // Update label layer for details maps
    if (this.detailsMap && this.labelLayer && singleMessage) {
      this.updateLabelLayer(singleMessage);
    }

    // Fit extent
    if (this.fitExtent()) {
      const extent = createEmpty();
      const nwExtent = this.nwLayer.getSource()!.getExtent();
      const nmExtent = this.nmLayer.getSource()!.getExtent();
      if (nwExtent && isFinite(nwExtent[0])) extend(extent, nwExtent);
      if (nmExtent && isFinite(nmExtent[0])) extend(extent, nmExtent);

      if (!isEmpty(extent)) {
        this.map.getView().fit(extent, {
          padding: [5, 5, 5, 5],
          size: this.map.getSize(),
          maxZoom,
        });
        const afterZoom = this.map.getView().getZoom();
        this.debugFitZoom.set(afterZoom != null ? afterZoom.toFixed(2) : '—');
      } else {
        const ra = this.rootArea();
        if (ra?.latitude && ra?.longitude && ra?.zoomLevel) {
          this.map.getView().setCenter(fromLonLat([ra.longitude, ra.latitude]));
          this.map.getView().setZoom(ra.zoomLevel);
          this.debugFitZoom.set(`empty→rootArea z${ra.zoomLevel}`);
        } else {
          this.debugFitZoom.set('empty extent, no rootArea');
        }
      }
      this.updateDebugInfo();
    }
  }

  private shouldShowFeatureCenter(features: Feature[]): boolean {
    if (!features.length || this.detailsMap) return false;
    const zoomLevel = this.map.getView().getZoom() ?? 0;
    if (zoomLevel > this.centerPointZoomLevel()) return false;

    return features.some((f) => {
      const g = f.getGeometry();
      return g && g.getType() !== 'Point' && g.getType() !== 'MultiPoint';
    });
  }

  private updateLabelLayer(message: MessageVo): void {
    if (!this.labelLayer) return;
    this.labelLayer.getSource()!.clear();

    const features = this.messageService.featuresForMessage(message);
    if (features.length === 0) return;

    const lang = this.languageService.language();
    let coordIndex = 1;

    for (const gjFeature of features) {
      const olFeature = this.mapService.gjToOlFeature(gjFeature);
      const styles: Style[] = [];
      const props = gjFeature.properties;
      const name = props ? (props[`name:${lang}`] as string | undefined) : undefined;

      if (name) {
        styles.push(
          new Style({
            text: new Text({
              textAlign: 'center',
              font: '11px Arial',
              text: name,
              fill: new Fill({ color: 'darkmagenta' }),
              stroke: new Stroke({ color: 'white', width: 2.0 }),
              offsetY: 5,
            }),
            geometry: () => {
              const point = this.mapService.getGeometryCenter(olFeature.getGeometry()!);
              return point ? new Point(point) : undefined;
            },
          }),
        );
      }

      // Create labels for readable coordinates
      const coords: Array<{ lon: number; lat: number; index: number; name?: string }> = [];
      this.mapService.serializeReadableCoordinates(gjFeature, coords);

      for (const coord of coords) {
        const c = this.mapService.fromLonLat([coord.lon, coord.lat]);

        styles.push(
          new Style({
            text: new Text({
              textAlign: 'center',
              font: '9px Arial',
              text: String(coordIndex),
              fill: new Fill({ color: 'white' }),
            }),
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({ color: 'darkmagenta' }),
              stroke: new Stroke({ color: 'white', width: 2.0 }),
            }),
            geometry: () => new Point(c),
          }),
        );

        if (coord.name) {
          styles.push(
            new Style({
              text: new Text({
                textAlign: 'center',
                font: '11px Arial',
                text: coord.name,
                fill: new Fill({ color: 'darkmagenta' }),
                stroke: new Stroke({ color: 'white', width: 2.0 }),
                offsetY: 14,
              }),
              geometry: () => new Point(c),
            }),
          );
        }
        coordIndex++;
      }

      if (styles.length > 0) {
        olFeature.setStyle(styles);
        this.labelLayer.getSource()!.addFeature(olFeature);
      }
    }
  }
}
