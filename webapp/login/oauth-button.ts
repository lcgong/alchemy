import { NgModule, Component } from "@angular/core";

@Component({
  selector: 'oauth-button',
  template: `
    <div>
      This is a button
    </div>
  `,
})
export class OAuthButton {
  name: string = '';

  constructor() {

  }
};
