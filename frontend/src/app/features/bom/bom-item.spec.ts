import { TestBed } from '@angular/core/testing';

import { BomItem } from './bom-item';

describe('BomItem', () => {
  let service: BomItem;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BomItem);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
