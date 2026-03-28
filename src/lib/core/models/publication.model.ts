import { DescVo } from './message.model';

export interface PublicationCategoryVo {
  categoryId: string;
  descs?: DescVo[];
}

export interface PublicationDescVo {
  lang: string;
  title?: string;
  link?: string;
  name?: string;
}

export interface PublicationVo {
  publicationId: string;
  type?: string;
  category?: PublicationCategoryVo;
  descs?: PublicationDescVo[];
  // UI state
  categoryHeading?: PublicationCategoryVo;
}
