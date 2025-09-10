import { Routes } from '@angular/router';
import { LoginScreenComponent } from './user-module/login-screen/login-screen.component';
import { ChatScreenComponent } from './chat-screen/chat-screen.component';
import { authGuard } from './auth.guard';
import { NewUserScreenComponent } from './user-module/new-user-screen/new-user-screen.component';

export const routes: Routes = [
    
    {
        path: "login",
        loadComponent: () => LoginScreenComponent
    },
    {
        path: "chat",
        loadComponent: () => ChatScreenComponent,
        canActivate: [authGuard]
    },
    {
        path: "usuario",
        loadComponent: () => NewUserScreenComponent
    }
];