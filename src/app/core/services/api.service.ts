import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'app/environment';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  //@TODO: no httpclient here ! https://angular.dev/guide/http/setup
  constructor(private http: HttpClient) {}

  private baseUrl: string = environment.JULIA_BACKEND_BASE_URL;

  getInitialGrid() {
    console.log('Called getInitialGrid');
    return this.http.get<any>(`${this.baseUrl}/initial_network`);
  }

  //@TODO: no any !! define interface in core models
  postRealNetwork(data: any) {
    return this.http.post<any>(`${this.baseUrl}/real_network`, data);
  }

  //@TODO: no any !!
  postAlgorithmResults(data: any) {
    return this.http.post<any>(`${this.baseUrl}/algorithms`, data);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `A client-side or network error occurred: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage =
            'Bad Request: The server could not understand the request.';
          break;
        case 401:
          errorMessage =
            'Unauthorized: Access is denied due to invalid credentials.';
          break;
        case 403:
          errorMessage =
            'Forbidden: You do not have the necessary permissions.';
          break;
        case 404:
          errorMessage = 'Not Found: The requested resource was not found.';
          break;
        case 500:
          errorMessage =
            'Internal Server Error: An error occurred on the server.';
          break;
        default:
          errorMessage = `Backend returned code ${error.status}: ${error.message}`;
          break;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
