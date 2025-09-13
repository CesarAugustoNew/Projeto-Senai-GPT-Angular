import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-user-screen',
  imports: [ReactiveFormsModule],
  templateUrl: './new-user-screen.component.html',
  styleUrl: './new-user-screen.component.css',
})
export class NewUserScreen {
  loginForm: FormGroup;
  nomeErrorMessage: string;
  emailErrorMessage: string;
  passwordErrorMessage: string;
  sucessLogin: string;
  errorLogin: string;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      nome: ["", [Validators.required]],
      email: ["", [Validators.required]],
      password: ["", [Validators.required]],
      password2: ["", [Validators.required]]
    });

    this.nomeErrorMessage = "";
    this.emailErrorMessage = "";
    this.passwordErrorMessage = "";
    this.sucessLogin = "";
    this.errorLogin = "";
  }

  // Função para validar a senha
  validatePassword(password: string): boolean {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    return password.length >= minLength && hasUpperCase;
  }

  async onEnterClick() {
    // Limpa mensagens anteriores
    this.nomeErrorMessage = "";
    this.emailErrorMessage = "";
    this.passwordErrorMessage = "";
    this.sucessLogin = "";
    this.errorLogin = "";

    // Pega os dados do formulário
    const nome = this.loginForm.value.nome;
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    const password2 = this.loginForm.value.password2;

    // Validações simples
    if (nome === "") {
      this.nomeErrorMessage = "O campo de nome é obrigatório";
      return;
    }

    if (email === "") {
      this.emailErrorMessage = "O campo de e-mail é obrigatório";
      return;
    }

    if (password === "") {
      this.passwordErrorMessage = "O campo de senha é obrigatório";
      return;
    }

    if (password2 === "") {
      this.passwordErrorMessage = "Confirme a senha";
      return;
    }

    if (password !== password2) {
      this.passwordErrorMessage = "As senhas não coincidem";
      return;
    }

    if (!this.validatePassword(password)) {
      this.passwordErrorMessage = "A senha deve ter no mínimo 6 caracteres e conter pelo menos uma letra maiúscula.";
      return;
    }

    // Envia os dados para a API
    let response = await fetch("https://senai-gpt-api.azurewebsites.net/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome: nome,
        email: email,
        password: password
      })
    });

    console.log("Status code: " + response.status);

    if (response.status >= 200 && response.status <= 299) {
      this.sucessLogin = "Usuário criado com sucesso!";
      this.errorLogin = "";
      let json = await response.json();
      console.log("Resposta da API:", json);
      window.location.href = "login";
    } else {
      this.errorLogin = "Erro ao criar usuário. Tente novamente.";
      this.sucessLogin = "";
    }
  }
}
