import { Component } from '@angular/core';
import { ThemeService } from '../theme.service';

/*
  Logo do SenaiGPT que acompanha o tema. O texto "SenaiGPT" da imagem
  original é escuro e sumia no modo escuro; aqui trocamos para a versão
  com texto branco quando o tema escuro está ativo.

  As duas imagens têm a mesma proporção, então a troca não mexe no
  layout. A altura é definida por quem usa: app-logo { height: 32px; }
*/
@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <img
      [src]="theme.isDark() ? 'imgs/logo-escuro.png' : 'imgs/logo-claro.png'"
      alt="SenaiGPT"
    >
  `,
  styles: [`
    :host {
      display: inline-block;
      height: 32px;
    }

    img {
      display: block;
      height: 100%;
      width: auto;
    }
  `]
})
export class LogoComponent {
  constructor(public theme: ThemeService) {}
}
