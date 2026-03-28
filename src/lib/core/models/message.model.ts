export interface DescVo {
  lang: string;
  title?: string;
  description?: string;
  subject?: string;
  details?: string;
  source?: string;
  publication?: string;
  caption?: string;
  name?: string;
}

export interface AreaVo {
  id: string;
  mrn?: string;
  parent?: AreaVo;
  descs?: DescVo[];
  // Extended root area fields
  latitude?: number;
  longitude?: number;
  zoomLevel?: number;
  // UI state
  selected?: boolean;
}

export interface ChartVo {
  chartNumber: string;
  internationalNumber?: number;
}

export interface ReferenceVo {
  messageId: string;
  type: 'REPETITION' | 'REPETITION_NEW_TIME' | 'CANCELLATION' | 'UPDATE' | string;
  descs?: DescVo[];
}

export interface AttachmentVo {
  path: string;
  fileName: string;
  type?: string;
  display?: 'ABOVE' | 'BELOW' | string;
  width?: string;
  height?: string;
  descs?: DescVo[];
}

export interface FeatureVo {
  type: string;
  geometry?: GeometryVo;
  properties?: Record<string, unknown>;
}

export interface GeometryVo {
  type: string;
  coordinates?: unknown;
  features?: FeatureVo[];
  geometries?: GeometryVo[];
}

export interface MessagePartVo {
  type: 'DETAILS' | 'TIME' | 'POSITIONS' | 'NOTE' | 'PROHIBITION' | 'SIGNALS' | string;
  geometry?: GeometryVo;
  descs?: DescVo[];
  hideSubject?: boolean;
}

export interface MessageVo {
  id: string;
  shortId?: string;
  mainType: 'NW' | 'NM';
  type?: string;
  status?: string;
  areas?: AreaVo[];
  charts?: ChartVo[];
  references?: ReferenceVo[];
  attachments?: AttachmentVo[];
  parts?: MessagePartVo[];
  descs?: DescVo[];
  publishDateFrom?: string | number;
  originalInformation?: boolean;
}
