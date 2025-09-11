import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewUserScreem } from './new-user-screen.component';

describe('NewUserScreem', () => {
  let component: NewUserScreem;
  let fixture: ComponentFixture<NewUserScreem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewUserScreem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewUserScreem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});