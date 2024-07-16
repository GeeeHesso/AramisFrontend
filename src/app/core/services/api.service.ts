import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pantagruel } from '@core/models/pantagruel';
import {
  algorithmsParameters,
  targetsParameters,
  timeParameters,
} from '@core/models/parameters';
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
    return this.http.get<Pantagruel>(`${this.baseUrl}/initial_network`);
  }

  postAttackedNetwork(data: targetsParameters) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': '*/*'
    });
    console.log("postAttackedNetwork")
    console.log(data)
    return this.http.post<Pantagruel>(`${this.baseUrl}/attacked_network`, data, { headers });
  }

  postRealNetwork(data: timeParameters) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': '*/*'
    });
    console.log("postRealNetwork")
    console.log(data)
    return this.http.post<Pantagruel>(`${this.baseUrl}/real_network`, data, { headers });
  }

  postAlgorithmResults(data: algorithmsParameters) {
    return this.http.post<any>(`${this.baseUrl}/algorithms`, data);
  }

  //@TODO: check how to reuse this
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
