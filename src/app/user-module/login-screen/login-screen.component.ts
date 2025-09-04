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

  onLoginClick() {
    alert("Botao de login clicado.");

    console.log("Email", this.loginForm.value.email);
    console.log("Password", this.loginForm.value.password);
    
  }

}
