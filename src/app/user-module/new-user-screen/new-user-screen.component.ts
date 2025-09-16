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
  nomeErrorMessage = "";
  emailErrorMessage = "";
  passwordErrorMessage = "";
  sucessLogin = "";
  errorLogin = "";

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      nome: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
      password2: ["", Validators.required]
    });
  }

  // Validação da senha: mínimo 6 caracteres e pelo menos uma maiúscula
  private validatePassword(password: string): boolean {
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

    // Verifica se o formulário está inválido
    if (this.loginForm.invalid) {
      const controls = this.loginForm.controls;

      if (controls["nome"].hasError("required")) {
        this.nomeErrorMessage = "O campo de nome é obrigatório";
      }

      if (controls["email"].hasError("required")) {
        this.emailErrorMessage = "O campo de e-mail é obrigatório";
      } else if (controls["email"].hasError("email")) {
        this.emailErrorMessage = "Formato de e-mail inválido";
      }

      if (controls["password"].hasError("required")) {
        this.passwordErrorMessage = "O campo de senha é obrigatório";
      }

      if (controls["password2"].hasError("required")) {
        this.passwordErrorMessage = "Confirme a senha";
      }

      return;
    }

    const { nome, email, password, password2 } = this.loginForm.value;

    // Verifica se as senhas coincidem
    if (password !== password2) {
      this.passwordErrorMessage = "As senhas não coincidem";
      return;
    }

    // Validação personalizada da senha
    if (!this.validatePassword(password)) {
      this.passwordErrorMessage = "A senha deve ter no mínimo 6 caracteres e conter pelo menos uma letra maiúscula.";
      return;
    }

    try {
      const response = await fetch("https://senai-gpt-api.azurewebsites.net/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email, password })
      });

      console.log("Status code: " + response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Resposta da API:", result);
        this.sucessLogin = "Usuário criado com sucesso!";
        this.errorLogin = "";
        window.location.href = "login";
      } else {
        this.errorLogin = "Erro ao criar usuário. Tente novamente.";
      }
    } catch (error) {
      console.error("Erro de requisição:", error);
      this.errorLogin = "Erro de conexão. Verifique sua internet.";
    }
  }
}
