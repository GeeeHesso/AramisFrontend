import {Injectable} from '@angular/core';
import {environment} from "../../../environment";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, Observable, Subject, throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApiManagementService {

  constructor(private http: HttpClient) {

}
  private baseUrl: string = environment.JULIA_BACKEND_BASE_URL;

  private _initialGridData = new Subject<any>();
  private _algorithmResults = new Subject<any>();
  private _realNetworkData = new Subject<any>();
  initialGridData$ = this._initialGridData.asObservable();
  algorithmResults$ = this._algorithmResults.asObservable();
  realNetworkData$ = this._realNetworkData.asObservable();

  getInitialGrid(): void {
    this.http.get<any>(`${this.baseUrl}/initial_network`).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (data) => {
        this._initialGridData.next(data);
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  postAlgorithmResults(data: any): void {
    this.http.post<any>(`${this.baseUrl}/algorithms`, data).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (response) => {
        this._algorithmResults.next(response);
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }


  postRealNetwork(data: any): void {
    this.http.post<any>(`${this.baseUrl}/real_network`, data).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (response) => {
        this._realNetworkData.next(response);
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `A client-side or network error occurred: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request: The server could not understand the request.';
          break;
        case 401:
          errorMessage = 'Unauthorized: Access is denied due to invalid credentials.';
          break;
        case 403:
          errorMessage = 'Forbidden: You do not have the necessary permissions.';
          break;
        case 404:
          errorMessage = 'Not Found: The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'Internal Server Error: An error occurred on the server.';
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
