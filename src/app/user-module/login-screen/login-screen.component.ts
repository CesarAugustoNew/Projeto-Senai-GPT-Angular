import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-screen',
  imports: [ReactiveFormsModule],
  templateUrl: './login-screen.component.html',
  styleUrl: './login-screen.component.css'
})
export class LoginScreenComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    //Quando a tela iniciar.

    //Inicia o formulario.
    //Cria o campo obrigatorio de email.
    //Cria o campo obrigatorio de password.
    this.loginForm = this.fb.group({
      email: ["", [Validators.required]],
      password: ["", [Validators.required]]
    });

  }

  async onLoginClick() {
    alert("Botao de login clicado.");

    console.log("Email", this.loginForm.value.email);
    console.log("Password", this.loginForm.value.password);

    if (this.loginForm.value.email == "") {
      alert("Preencha o campo de e-mail.");
      return;
    }

    if (this.loginForm.value.password == "") {
      alert("Preencha a senha.");
      return;
    }
    
    let response = await fetch("https://senai-gpt-api.azurewebsites.net/login", {
      method: "POST", // Enviar
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      })
    });
    console.log("STATUS CODE", response.status);
    
    if (response.status >= 200 && response.status <= 299) {
      alert("Login com sucesso")
    }else {
      alert("Seu login deu errado")
    }

    let email2 = this.loginForm.value.email;
    let password2 = this.loginForm.value.password;

    if (email2.length === 0) {
      alert("Campo de email obrigatorio")}
      else if (password2.length === 0) {
        alert("Campo de senha obrigatorio")
      }


  }
}
