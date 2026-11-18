import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Catalogue } from './catalogue';
import { ProduitApi } from '../../services/produit-api';
import { Panier } from '../../services/panier';

describe('Catalogue', () => {
  let component: Catalogue;
  let fixture: ComponentFixture<Catalogue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Catalogue],
      providers: [
        provideRouter([]),
        { provide: ProduitApi, useValue: { getProduits: () => of({ total: 0, page: 1, pages: 1, resultats: [] }) } },
        { provide: Panier, useValue: { lignes$: of([]), nombreArticles: 0, ajouter: () => undefined } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Catalogue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
