import { Injectable } from '@angular/core';

import {MessageService} from "app/utils/messagebar/message.service";
import {ServiceClient} from "app/utils/service/client";

@Injectable()
export class AuthService {

  constructor(private service: ServiceClient){
  }

  /**
  * 检查用户名是否可用
  * @param {string} userName 用户名
  * @return 异步返回，用户名合法且没有被占用返回true，否则返回false.
  */
  checkUserName(userName: string) {
    return this.service.post('/users/username:check', {
      query : {username: userName}
    }).map((resp) => resp)
  }

  registerNewUser(user: any) {

  }

  // getUser(): {
  //
  // }

  // isLoggedIn(): boolean {
  //   return this.getUser() !== null;
  // }
  //
  // login(user: string, password: string): boolean {
  //   if (user === 'user' && password === 'password') {
  //     localStorage.setItem('username', user);
  //     return true;
  //   }
  //
  //   return false;
  // }

  // logout(): any {
  //   localStorage.removeItem('username');
  // }
  //
  // getUser(): any {
  //   return localStorage.getItem('username');
  // }

  // isLoggedIn(): boolean {
  //   return this.getUser() !== null;
  // }
}

export var AUTH_PROVIDERS: Array<any> = [
  { provide: AuthService, useClass: AuthService }
];
