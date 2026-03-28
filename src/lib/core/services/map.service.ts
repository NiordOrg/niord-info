import { Injectable, inject } from '@angular/core';
import { fromLonLat, transform, transformExtent } from 'ol/proj.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Feature from 'ol/Feature.js';
import Geometry from 'ol/geom/Geometry.js';
import Point from 'ol/geom/Point.js';
import { createEmpty, extend, getCenter, isEmpty } from 'ol/extent.js';
import { LanguageService } from './language.service';

const PROJ_MERCATOR = 'EPSG:3857';
const PROJ_4326 = 'EPSG:4326';

@Injectable({ providedIn: 'root' })
export class MapService {
  private readonly languageService = inject(LanguageService);
  private readonly geoJsonFormat = new GeoJSON();

  dataProjection(): string {
    return PROJ_4326;
  }

  featureProjection(): string {
    return PROJ_MERCATOR;
  }

  fromLonLat(lonLat: [number, number]): number[] {
    return fromLonLat(lonLat);
  }

  toLonLat(xy: number[]): number[] {
    return transform(xy, PROJ_MERCATOR, PROJ_4326);
  }

  getExtentCenter(extent: number[]): number[] {
    return getCenter(extent);
  }

  /** Returns a "sensible" center point of the geometry */
  getGeometryCenter(g: Geometry): number[] | undefined {
    try {
      switch (g.getType()) {
        case 'MultiPolygon': {
          const mp = g as import('ol/geom/MultiPolygon.js').default;
          const poly = mp.getPolygons().reduce((left, right) =>
            (left.getArea?.() ?? 0) > (right.getArea?.() ?? 0) ? left : right,
          );
          return poly.getInteriorPoint().getCoordinates();
        }
        case 'MultiLineString': {
          const mls = g as import('ol/geom/MultiLineString.js').default;
          const lineString = mls.getLineStrings().reduce((left, right) =>
            (left.getLength?.() ?? 0) > (right.getLength?.() ?? 0) ? left : right,
          );
          return this.getExtentCenter(lineString.getExtent());
        }
        case 'Polygon': {
          const pg = g as import('ol/geom/Polygon.js').default;
          return pg.getInteriorPoint().getCoordinates();
        }
        case 'Point':
          return (g as Point).getCoordinates();
        case 'LineString':
        case 'MultiPoint':
        case 'GeometryCollection':
          return this.getExtentCenter(g.getExtent());
        default:
          return undefined;
      }
    } catch {
      return undefined;
    }
  }

  /** Computes the center for the list of features */
  getFeaturesCenter(features: Feature[]): number[] | null {
    const extent = createEmpty();
    for (const f of features) {
      const geometry = f.getGeometry();
      if (geometry) {
        extend(extent, geometry.getExtent());
      }
    }
    return isEmpty(extent) ? null : getCenter(extent);
  }

  /** Converts a GeoJSON feature to an OL feature */
  gjToOlFeature(feature: unknown): Feature {
    return this.geoJsonFormat.readFeature(feature, {
      dataProjection: PROJ_4326,
      featureProjection: PROJ_MERCATOR,
    }) as Feature;
  }

  /**
   * Serializes the "readable" coordinates of a geometry.
   * Ported from app-service.js MapService.serializeReadableCoordinates
   */
  serializeReadableCoordinates(
    g: unknown,
    coords: Array<{ lon: number; lat: number; index: number; name?: string }>,
    props?: Record<string, unknown>,
    index = 0,
    polygonType?: string,
  ): number {
    props = props || {};
    const language = this.languageService.language();

    if (!g) return index;

    if (Array.isArray(g)) {
      if (g.length >= 2 && typeof g[0] === 'number') {
        const bufferFeature = props['parentFeatureIds'];
        const affectedArea = props['restriction'] === 'affected';
        const includeCoord = polygonType !== 'Exterior';
        if (includeCoord && !bufferFeature && !affectedArea) {
          coords.push({
            lon: g[0],
            lat: g[1],
            index,
            name: props[`name:${index}:${language}`] as string | undefined,
          });
        }
        index++;
      } else {
        for (let x1 = 0; x1 < g.length; x1++) {
          const pt = polygonType === 'Interior' && x1 === g.length - 1 ? 'Exterior' : polygonType;
          index = this.serializeReadableCoordinates(g[x1], coords, props, index, pt);
        }
      }
    } else if (typeof g === 'object' && g !== null) {
      const gObj = g as Record<string, unknown>;
      if (gObj['type'] === 'FeatureCollection') {
        const features = (gObj['features'] as unknown[]) || [];
        for (const feat of features) {
          index = this.serializeReadableCoordinates(feat, coords);
        }
      } else if (gObj['type'] === 'Feature') {
        index = this.serializeReadableCoordinates(
          gObj['geometry'],
          coords,
          gObj['properties'] as Record<string, unknown>,
          0,
        );
      } else if (gObj['type'] === 'GeometryCollection') {
        const geometries = (gObj['geometries'] as unknown[]) || [];
        for (const geom of geometries) {
          index = this.serializeReadableCoordinates(geom, coords, props, index);
        }
      } else if (gObj['type'] === 'MultiPolygon') {
        const coordinates = gObj['coordinates'] as unknown[][][];
        for (const polygon of coordinates) {
          for (let x4 = 0; x4 < polygon.length; x4++) {
            index = this.serializeReadableCoordinates(
              polygon[x4],
              coords,
              props,
              index,
              x4 === 0 ? 'Interior' : 'Exterior',
            );
          }
        }
      } else if (gObj['type'] === 'Polygon') {
        const coordinates = gObj['coordinates'] as unknown[][];
        for (let x5 = 0; x5 < coordinates.length; x5++) {
          index = this.serializeReadableCoordinates(
            coordinates[x5],
            coords,
            props,
            index,
            x5 === 0 ? 'Interior' : 'Exterior',
          );
        }
      } else if (gObj['type']) {
        index = this.serializeReadableCoordinates(gObj['coordinates'], coords, props, index);
      }
    }
    return index;
  }
}
