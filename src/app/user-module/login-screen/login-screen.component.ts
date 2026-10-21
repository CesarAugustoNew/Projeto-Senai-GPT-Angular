import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../../theme-toggle/theme-toggle.component';
import { LogoComponent } from '../../logo/logo.component';

@Component({
  selector: 'app-login-screen',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ThemeToggleComponent, LogoComponent],
  templateUrl: './login-screen.component.html',
  styleUrl: '../auth-screen.css',
})
export class LoginScreenComponent {
  loginForm: FormGroup;

  emailErrorMessage = '';
  passwordErrorMessage = '';
  sucessoMessage = '';
  erroMessage = '';
  enviando = false;

  private readonly apiUrl = 'https://senai-gpt-api.azurewebsites.net/login';

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async onLoginClick() {
    this.resetMessages();

    const { email, password } = this.loginForm.value;

    if (!email) {
      this.emailErrorMessage = 'O campo de e-mail é obrigatório.';
      return;
    }

    if (!password) {
      this.passwordErrorMessage = 'O campo de senha é obrigatório.';
      return;
    }

    this.enviando = true;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const json = await response.json();

        localStorage.setItem('meuToken', json.accessToken);
        localStorage.setItem('meuId', json.user.id);

        this.sucessoMessage = 'Login realizado com sucesso!';
        window.location.href = 'chat';
      } else {
        this.erroMessage = 'E-mail ou senha incorretos.';
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      this.erroMessage = 'Não foi possível conectar ao servidor. Verifique sua internet e tente de novo.';
    } finally {
      this.enviando = false;
    }
  }

  private resetMessages() {
    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
    this.sucessoMessage = '';
    this.erroMessage = '';
  }
}
