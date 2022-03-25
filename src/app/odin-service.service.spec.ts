import { TestBed } from '@angular/core/testing';

import { OdinServiceService } from './odin-service.service';

describe('OdinServiceService', () => {
  let service: OdinServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OdinServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
