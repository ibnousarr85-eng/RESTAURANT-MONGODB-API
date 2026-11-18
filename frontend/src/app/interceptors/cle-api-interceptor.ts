import { HttpInterceptorFn } from '@angular/common/http';

export const cleApiInterceptor: HttpInterceptorFn = (req, next) => {
  const requeteAvecCookies = req.clone({
    withCredentials: true
  });

  return next(requeteAvecCookies);
};
