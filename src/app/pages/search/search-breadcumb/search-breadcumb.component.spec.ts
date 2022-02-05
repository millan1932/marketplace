import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBreadcumbComponent } from './search-breadcumb.component';

describe('SearchBreadcumbComponent', () => {
  let component: SearchBreadcumbComponent;
  let fixture: ComponentFixture<SearchBreadcumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchBreadcumbComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBreadcumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
