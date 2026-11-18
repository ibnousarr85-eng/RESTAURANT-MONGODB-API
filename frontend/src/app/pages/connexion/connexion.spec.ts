import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { Connexion } from './connexion';
import { cleApiInterceptor } from '../../interceptors/cle-api-interceptor';

describe('Connexion', () => {
  let component: Connexion;
  let fixture: ComponentFixture<Connexion>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Connexion],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([cleApiInterceptor])),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Connexion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sends the login request with cookies and navigates to the dashboard on success', () => {
    component.nomUtilisateur = 'admin-test';
    component.motDePasse = 'mot-de-passe-factice';
    const navigation = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.seConnecter();

    const request = httpMock.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({
      username: 'admin-test',
      password: 'mot-de-passe-factice'
    });

    request.flush({
      message: 'Connexion rÃ©ussie.',
      user: { username: 'admin-test', role: 'admin' }
    });

    expect(navigation).toHaveBeenCalledWith(['/dashboard']);
    expect(component.chargement).toBe(false);
    expect(component.motDePasse).toBe('');
    httpMock.verify();
  });
});
