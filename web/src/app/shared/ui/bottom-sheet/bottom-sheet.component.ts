import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-bottom-sheet',
  imports: [],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.scss',
})
export class BottomSheetComponent {
  readonly open = input<boolean>(false);

  readonly closed = output<void>();

  onBackdropClick(): void {
    this.closed.emit();
  }
}
