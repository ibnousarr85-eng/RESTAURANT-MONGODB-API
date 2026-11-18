import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Administrateur {
  username: string;
  role: 'admin';
}

export interface ReponseConnexion {
  message: string;
  user: Administrateur;
}

export interface ReponseSession {
  authenticated: boolean;
  user: Administrateur;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private apiUrl = '/api/auth';

  connecter(username: string, password: string): Observable<ReponseConnexion> {
    return this.http.post<ReponseConnexion>(
      `${this.apiUrl}/login`,
      { username, password },
      { withCredentials: true }
    );
  }

  verifierSession(): Observable<ReponseSession> {
    return this.http.get<ReponseSession>(
      `${this.apiUrl}/me`,
      { withCredentials: true }
    );
  }

  deconnecter(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    );
  }
}
