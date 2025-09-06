import { Routes } from '@angular/router';
import { LoginScreenComponent } from './user-module/login-screen/login-screen.component';
import { ChatScreenComponent } from './chat-screen/chat-screen.component';
export const routes: Routes = [
    
    {
        path: "login",
        loadComponent: () => LoginScreenComponent
    },
    {
        path: "chat",
        loadComponent: () => ChatScreenComponent
    }
];
