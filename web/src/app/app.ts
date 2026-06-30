import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommandPaletteComponent } from './command-palette';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommandPaletteComponent],
  templateUrl: './app.html',
})
export class App {}
