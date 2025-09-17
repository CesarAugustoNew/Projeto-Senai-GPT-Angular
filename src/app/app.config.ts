import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';

import { routes } from './app.routes';
import { HttpErrorResponse, HttpInterceptor, HttpInterceptorFn, httpResource, provideHttpClient, withInterceptors } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router); //Direciona para as telas.

  return next (req).pipe(

    catchError((err: HttpErrorResponse) => {

      if (err.status == 401) {
        // Token expirou
        localStorage.clear(); // Limpa todos dos dados do localStorage
        router.navigate(['/login']);  // Redireciona para o login.
      }

      return throwError(() => err);

    })
  );

}

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([ AuthInterceptor ])),provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};
