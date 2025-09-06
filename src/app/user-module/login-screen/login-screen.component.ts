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

  emailErrorMessage: string;
  passwordErrorMessage: string;
  sucessoErrorMessage: string;
  incorretoErrorMessage: string;




  constructor(private fb: FormBuilder) {
    //Quando a tela iniciar.

    //Inicia o formulario.
    //Cria o campo obrigatorio de email.
    //Cria o campo obrigatorio de password.
    this.loginForm = this.fb.group({
      email: ["", [Validators.required]],
      password: ["", [Validators.required]]
    });

    this.emailErrorMessage = "";
    this.passwordErrorMessage = "";
    this.sucessoErrorMessage = "";
    this.incorretoErrorMessage = "";

  }

  async onLoginClick() {
    alert("Botao de login clicado.");

    console.log("Email", this.loginForm.value.email);
    console.log("Password", this.loginForm.value.password);

    if (this.loginForm.value.email == "") {
      this.emailErrorMessage = "O campo de e-mail e obrigatorio.";
      this.passwordErrorMessage = "";
      return;
    }

    if (this.loginForm.value.password == "") {
      this.passwordErrorMessage = "O campo de senha e obrigatorio.";
      this.emailErrorMessage = "";
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
      this.sucessoErrorMessage = "Login realizado com sucesso";
      this.incorretoErrorMessage = ""
    }else {
      this.incorretoErrorMessage = "Login deu errado";
      this.sucessoErrorMessage = ""
    }

  }
}