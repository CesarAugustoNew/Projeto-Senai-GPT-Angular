import { Routes } from '@angular/router';
import { LoginScreenComponent } from './user-module/login-screen/login-screen.component';
import { ChatScreen } from './chat-screen/chat-screen.component';
import { authGuard } from './auth.guard';
import { NewUserScreen } from './user-module/new-user-screen/new-user-screen.component';

export const routes: Routes = [
    
    {
        path: "login",
        loadComponent: () => LoginScreenComponent
    },
    {
        path: "chat",
        loadComponent: () => ChatScreen,
        canActivate: [authGuard]
    },
    {
        path: "usuario",
        loadComponent: () => NewUserScreen
}
];