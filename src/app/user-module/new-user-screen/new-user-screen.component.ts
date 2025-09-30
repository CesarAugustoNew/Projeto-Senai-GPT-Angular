import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-user-screen',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './new-user-screen.component.html',
  styleUrl: './new-user-screen.component.css',
})
export class NewUserScreen {
  loginForm: FormGroup;

  nomeErrorMessage = '';
  emailErrorMessage = '';
  passwordErrorMessage = '';
  sucessMessage = '';
  errorMessage = '';

  private readonly apiUrl = 'https://senai-gpt-api.azurewebsites.net/users';
sucessLogin: any;
errorLogin: any;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      password2: ['', Validators.required],
    });
  }

  private validatePassword(password: string): boolean {
    return password.length >= 6 && /[A-Z]/.test(password);
  }

  private resetMessages() {
    this.nomeErrorMessage = '';
    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
    this.sucessMessage = '';
    this.errorMessage = '';
  }

  async onEnterClick() {
    this.resetMessages();

    if (this.loginForm.invalid) {
      this.showFormErrors();
      return;
    }

    const { nome, email, password, password2 } = this.loginForm.value;

    if (password !== password2) {
      this.passwordErrorMessage = 'As senhas não coincidem';
      return;
    }

    if (!this.validatePassword(password)) {
      this.passwordErrorMessage =
        'A senha deve ter no mínimo 6 caracteres e conter pelo menos uma letra maiúscula.';
      return;
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, password }),
      });

      if (response.ok) {
        this.sucessMessage = 'Usuário criado com sucesso!';
        window.location.href = 'login';
      } else {
        this.errorMessage = 'Erro ao criar usuário. Tente novamente.';
      }
    } catch (err) {
      console.error('Erro de requisição:', err);
      this.errorMessage = 'Erro de conexão. Verifique sua internet.';
    }
  }

  private showFormErrors() {
    const controls = this.loginForm.controls;

    if (controls['nome'].hasError('required')) {
      this.nomeErrorMessage = 'O campo de nome é obrigatório';
    }

    if (controls['email'].hasError('required')) {
      this.emailErrorMessage = 'O campo de e-mail é obrigatório';
    } else if (controls['email'].hasError('email')) {
      this.emailErrorMessage = 'Formato de e-mail inválido';
    }

    if (controls['password'].hasError('required')) {
      this.passwordErrorMessage = 'O campo de senha é obrigatório';
    }

    if (controls['password2'].hasError('required')) {
      this.passwordErrorMessage = 'Confirme a senha';
    }
  }
}
