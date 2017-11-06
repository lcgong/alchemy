import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubquestionComponent } from './subquestion.component';

describe('SubquestionComponent', () => {
  let component: SubquestionComponent;
  let fixture: ComponentFixture<SubquestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubquestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubquestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
