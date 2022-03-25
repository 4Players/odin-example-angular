import { TestBed } from '@angular/core/testing';
import { OdinService } from './odin.service';

describe('OdinService', () => {
  let service: OdinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OdinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
