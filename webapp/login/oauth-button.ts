import { NgModule, Component, Input } from "@angular/core";

declare var LoginSettings: any;

// let foo = new Foo(),
//     x = Object.keys(foo) as (keyof Foo)[];

@Component({
  selector: 'oauth-button',
  template: `
    <div (click)="redirectToOAuthServer()">
      <ng-content></ng-content>
    </div>
  `,
})
export class OAuthButton {
  name: string = '';

  @Input()
  private uri: string;

  constructor() {

  }

  redirectToOAuthServer() {

    // let params = Object.assign({}, LoginSettings[this.vendorId]);
    let crsf_token = getCookie('_crsf_token');

    // console.log(params, this.vendorId)
    let autherize_url = renderRequestURL(params.autherize_url_tmpl, params)

    console.log(autherize_url);
    window.location.assign(autherize_url);
  }
};

function renderRequestURL(template: string, params: any) {
  if (typeof template === 'undefined' ||  template === null)
    return null;

  let app_id = params['app_id'] || '';
  let redirect_uri = params['redirect_uri'] || '';
  let state = params['state'] || '';
  let scope = params['scope'] || '';

  let s = template.replace(/{app_id}/, encodeURIComponent(app_id));
  s = s.replace(/{redirect_uri}/, encodeURIComponent(redirect_uri));
  s = s.replace(/{state}/, encodeURIComponent(state));
  s = s.replace(/{scope}/, encodeURIComponent(scope));

  return s;
}

function getCookie(name: string): string { // 从cookie取数
  for (let cookie of document.cookie.split(';')) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) == 0) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return "";
}
