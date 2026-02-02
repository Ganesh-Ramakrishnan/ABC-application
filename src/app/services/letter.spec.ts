import { TestBed } from '@angular/core/testing';

import { Letter } from './letter';

describe('Letter', () => {
  let service: Letter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Letter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
