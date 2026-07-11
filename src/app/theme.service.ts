import { Injectable, effect, signal } from '@angular/core';

const STORAGE_KEY = 'senai-gpt-theme';

/*
  Serviço de tema compartilhado entre login, cadastro e chat.
  Aplica a classe "dark-theme" no <html> e lembra a preferência no
  localStorage, então o tema persiste entre as telas mesmo com
  `window.location.href` (navegação com recarregamento completo),
  que é como o app troca de tela hoje.
*/
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const dark = this.isDark();
      document.documentElement.classList.toggle('dark-theme', dark);
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.isDark.set(!this.isDark());
  }

  private getInitialTheme(): boolean {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) {
      return salvo === 'dark';
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
