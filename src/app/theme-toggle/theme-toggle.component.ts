import { Component } from '@angular/core';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      class="theme-toggle"
      (click)="theme.toggle()"
      [attr.aria-label]="theme.isDark() ? 'Ativar modo claro' : 'Ativar modo escuro'"
      [title]="theme.isDark() ? 'Modo claro' : 'Modo escuro'"
    >
      <i class="fa-solid" [class.fa-sun]="theme.isDark()" [class.fa-moon]="!theme.isDark()" aria-hidden="true"></i>
    </button>
  `,
  styles: [`
    .theme-toggle {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 40px;
      height: 40px;

      border-radius: 50%;
      border: 1px solid #ccc;
      background-color: transparent;
      color: #525866;
      font-size: 16px;
      cursor: pointer;

      transition: background-color .2s ease, color .2s ease, border-color .2s ease;
    }

    .theme-toggle:hover {
      background-color: rgba(0, 0, 0, 0.06);
    }

    :host-context(.dark-theme) .theme-toggle {
      border-color: #3a3a3a;
      color: #f3f5f8;
    }

    :host-context(.dark-theme) .theme-toggle:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }
  `]
})
export class ThemeToggleComponent {
  constructor(public theme: ThemeService) {}
}
