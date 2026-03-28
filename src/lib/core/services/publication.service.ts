import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PublicationVo } from '../models/publication.model';

@Injectable({ providedIn: 'root' })
export class PublicationService {
  private readonly http = inject(HttpClient);

  search(params: string): Observable<PublicationVo[]> {
    return this.http.get<PublicationVo[]>(`/api/rest/public/v1/publications?${params}`);
  }

  getPublication(publicationId: string, language: string): Observable<PublicationVo> {
    return this.http.get<PublicationVo>(
      `/api/rest/public/v1/publications/publication/${encodeURIComponent(publicationId)}?language=${language}`,
    );
  }
}
