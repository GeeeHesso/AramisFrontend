import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'app/environment';
import { Subject, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  //@TODO: no httpclient here ! https://angular.dev/guide/http/setup
  constructor(private http: HttpClient) {}

  private baseUrl: string = environment.JULIA_BACKEND_BASE_URL;

  // why create observable in two steps ? + we don't need observable I think
  // see documentation of behavior subject and signal
  private _initialGridData = new Subject<any>();
  private _algorithmResults = new Subject<any>();
  private _realNetworkData = new Subject<any>();
  initialGridData$ = this._initialGridData.asObservable();
  algorithmResults$ = this._algorithmResults.asObservable();
  realNetworkData$ = this._realNetworkData.asObservable();

  getInitialGrid() {
    console.log('Called getInitialGrid');
    this.http.get<any>(`${this.baseUrl}/initial_network`).subscribe({
      next: (data) => {
        this._initialGridData.next(data);
      },
      error: (error) => {
        this.handleError(error);
      },
    });
  }

  //@TODO: no any !! define interface in core models
  postRealNetwork(data: any): any {
    this.http.post<any>(`${this.baseUrl}/real_network`, data).subscribe({
      next: (data) => {
        this._realNetworkData.next(data);
      },
      error: (error) => {
        this.handleError(error);
      },
    });
  }

  //@TODO: no any !!
  postAlgorithmResults(data: any): any {
    this.http.post<any>(`${this.baseUrl}/algorithms`, data).subscribe({
      next: (response) => {
        this._algorithmResults.next(response);
      },
      error: (error) => {
        this.handleError(error);
      },
    });
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
