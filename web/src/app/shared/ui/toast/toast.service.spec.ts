import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
    });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('has no toast by default', () => {
    expect(service.toast()).toBeNull();
  });

  it('shows a message with a default tone', () => {
    service.show('Saved');

    expect(service.toast()).toEqual({ message: 'Saved', tone: 'default' });
  });

  it('shows a message with an explicit tone', () => {
    service.show('Deleted', 'error');

    expect(service.toast()).toEqual({ message: 'Deleted', tone: 'error' });
  });

  it('auto-clears the toast after ~2500ms', () => {
    jasmine.clock().install();

    service.show('Saved', 'success');
    expect(service.toast()).not.toBeNull();

    jasmine.clock().tick(2500);

    expect(service.toast()).toBeNull();
  });
});
