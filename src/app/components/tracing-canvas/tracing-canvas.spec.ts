import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TracingCanvas } from './tracing-canvas';

describe('TracingCanvas', () => {
  let component: TracingCanvas;
  let fixture: ComponentFixture<TracingCanvas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TracingCanvas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TracingCanvas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
