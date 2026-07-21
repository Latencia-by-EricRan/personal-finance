import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarNavComponent } from './components';

@Component({
  selector: 'app-norte',
  imports: [RouterOutlet, SidebarNavComponent],
  templateUrl: './norte.component.html',
  styleUrl: './norte.component.scss',
})
export class NorteComponent {}
