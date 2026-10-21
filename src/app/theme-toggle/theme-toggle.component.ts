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
      border: 1px solid var(--line);
      background-color: var(--surface);
      color: var(--ink-muted);
      font-size: 16px;

      transition: background-color .2s ease, color .2s ease, border-color .2s ease;
    }

    .theme-toggle:hover {
      background-color: var(--surface-raised);
      color: var(--ink);
    }
  `]
})
export class ThemeToggleComponent {
  constructor(public theme: ThemeService) {}
}
