import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TabBarComponent, FabComponent } from './components';
import { ToastComponent } from '../../shared/ui';

@Component({
    selector: 'app-main-container',
    imports: [RouterOutlet, TabBarComponent, FabComponent, ToastComponent],
    templateUrl: './main-container.component.html',
    styleUrl: './main-container.component.scss'
})
export class MainContainerComponent {
}
