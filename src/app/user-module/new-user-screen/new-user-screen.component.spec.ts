import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewUserScreenComponent } from './new-user-screen.component';

describe('NewUserScreenComponent', () => {
  let component: NewUserScreenComponent;
  let fixture: ComponentFixture<NewUserScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewUserScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewUserScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
