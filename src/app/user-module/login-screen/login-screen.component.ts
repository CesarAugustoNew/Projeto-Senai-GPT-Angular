import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-screen',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-screen.component.html',
  styleUrl: './login-screen.component.css',
})
export class LoginScreenComponent {
  loginForm: FormGroup;

  emailErrorMessage = '';
  passwordErrorMessage = '';
  sucessoMessage = '';
  erroMessage = '';

  private readonly apiUrl = 'https://senai-gpt-api.azurewebsites.net/login';
incorretoErrorMessage: any;

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
      this.erroMessage = 'Erro ao conectar ao servidor.';
    }
  }

  private resetMessages() {
    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
    this.sucessoMessage = '';
    this.erroMessage = '';
  }
}
