import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountNewStoreComponent } from './account-new-store.component';

describe('AccountNewStoreComponent', () => {
  let component: AccountNewStoreComponent;
  let fixture: ComponentFixture<AccountNewStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountNewStoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountNewStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
