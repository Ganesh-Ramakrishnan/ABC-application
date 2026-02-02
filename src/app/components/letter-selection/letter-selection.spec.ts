import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterSelection } from './letter-selection';

describe('LetterSelection', () => {
  let component: LetterSelection;
  let fixture: ComponentFixture<LetterSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetterSelection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LetterSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
