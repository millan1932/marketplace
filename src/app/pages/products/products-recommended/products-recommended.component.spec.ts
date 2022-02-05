import { ComponentFixture, TestBed } from '@angular/core/testing';


import { ProductsRecommendedComponent } from './products-recommended.component';

describe('ProductsRecommendedComponent', () => {
  let component: ProductsRecommendedComponent;
  let fixture: ComponentFixture<ProductsRecommendedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductsRecommendedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsRecommendedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
