import { Injectable } from '@angular/core';
import {
  Http,
  Request,
  RequestMethod,
  Response,
  RequestOptions,
  Headers
} from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

interface ServiceArguments {
  query?: any
  data?: any,
}

@Injectable()
export class ServiceClient {

  private baseUrl = 'api/';

  constructor(private http: Http) {
  }

  get(path: string, args?: ServiceArguments) {
    return this.request(RequestMethod.Get, path, args);
  }

  post(path: string, args?: ServiceArguments) {
    return this.request(RequestMethod.Post, path, args);
  }

  private getAuthorizationToken(): string{
    let auth_token:string;
    auth_token = sessionStorage.getItem('__AUTHORIZATION_TOKEN');
    if (auth_token == null) {
      auth_token = localStorage.getItem('__AUTHORIZATION_TOKEN');
    }
    return auth_token;
  }

  private request(
    verb: RequestMethod, path: string, args: ServiceArguments
  ): Observable<any> {

    let request = new Request({
      method: verb,
      url: this.baseUrl + path,
    });

    let auth_token = this.getAuthorizationToken();
    if (auth_token != null) {
      request.headers.set("Authorization", `Bearer ${auth_token}`);
    }

    let params = new URLSearchParams();
    if (typeof args !== 'undefined' && typeof args.query !=='undefined') {
      for (let name of Object.keys(args.query)) {
        params.set(name, args.query[name]);
      }
    }

    let body: any;
    if (typeof args !== 'undefined' && typeof args.data !== 'undefined') {
      body = JSON.stringify(args.data);
    }

    console.log(333, params.toString())

    return this.http.request(request, {
      search: params.toString(),
      body: body
    }).map((response) => {
      console.log(123);
      response.json()
    });
  }


  // makeHeaders(): void {
  //   let headers: Headers = new Headers();
  //   headers.append('X-API-TOKEN', 'ng-book');
  //
  //   let opts: RequestOptions = new RequestOptions();
  //   opts.headers = headers;
  //
  //   this.http.get('http://jsonplaceholder.typicode.com/posts/1', opts)
  //     .subscribe((res: Response) => {
  //       this.data = res.json();
  //     });
  // }

  // private extractData(res: Response) {
  //   let body = res.json();
  //   return body.data || { };
  // }
  //
  // private handleError (error: Response | any) {
  //   // In a real world app, we might use a remote logging infrastructure
  //   let errMsg: string;
  //   if (error instanceof Response) {
  //     const body = error.json() || '';
  //     const err = body.error || JSON.stringify(body);
  //     errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
  //   } else {
  //     errMsg = error.message ? error.message : error.toString();
  //   }
  //   console.error(errMsg);
  //   return Observable.throw(errMsg);
  // }
}
