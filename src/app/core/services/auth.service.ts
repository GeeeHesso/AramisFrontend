import { Injectable } from '@angular/core';
import { environment } from 'app/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;
  private authSecretKey = 'Token';

  constructor() {
    this.isAuthenticated = !!localStorage.getItem(this.authSecretKey);
  }

  login(password: string): boolean {
    if (password === environment.PASSWORD) {
      const authToken = environment.AUTHTOKEN;
      localStorage.setItem(this.authSecretKey, authToken);
      this.isAuthenticated = true;
      return true;
    } else {
      return false;
    }
  }

  isAuthenticatedUser(): boolean {
    return this.isAuthenticated;
  }

  logout(): void {
    localStorage.removeItem(this.authSecretKey);
    this.isAuthenticated = false;
  }
}
