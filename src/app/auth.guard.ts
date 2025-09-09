import { inject } from "@angular/core";
import { Router } from "@angular/router";

export const authGuard = () => {

const router = inject(Router); // Injetando o roteador do projeto.

    const token = localStorage.getItem("meuToken"); // Pega um item do localStorage.
    const userId = localStorage.getItem("meuId");

    if (token != null && userId != null) {

        return true;

    }else {

        router.navigate(["/login"]);
        return false;

    }

}