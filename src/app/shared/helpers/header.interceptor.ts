import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {

    constructor() {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        // Add your headers here
        const headers = request.headers
            .set('ngrok-skip-browser-warning', '69420')
        
        // Clone the request with the updated headers
        const modifiedRequest = request.clone({ headers });
        
        // Pass the modified request to the next interceptor or the HTTP handler
        return next.handle(modifiedRequest);
    }
}
