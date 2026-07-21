import { Component, input, output } from '@angular/core';

export interface ISegmentedControlOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-segmented-control',
  imports: [],
  templateUrl: './segmented-control.component.html',
  styleUrl: './segmented-control.component.scss',
})
export class SegmentedControlComponent {
  readonly options = input.required<ISegmentedControlOption[]>();
  readonly value = input<string>('');

  readonly valueChange = output<string>();

  select(option: ISegmentedControlOption): void {
    if (option.value === this.value()) {
      return;
    }

    this.valueChange.emit(option.value);
  }
}
