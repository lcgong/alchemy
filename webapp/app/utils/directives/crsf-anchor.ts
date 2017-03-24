import { Directive, Input } from '@angular/core';
import { OnInit, ElementRef, ViewChild } from '@angular/core';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

import {Location} from '@angular/common';

@Directive({
	selector : '[crsf]'
})
export class CRSFAnchorDirective {

	@Input('crsf')
	field : string;

	@Input('href')
	href: string;

  ngOnInit() {
    Observable.fromEvent<MouseEvent>(this.button.nativeElement, 'click')
	    .subscribe((event) => {
				event.preventDefault();

				let crsf_token = getCookie('_crsf_token');

				let url = this.href + `&${this.field}=${crsf_token}`;

				console.log('click: ', url);

				window.location.assign(url);

				// this.location.go(url);
			});
  }

	constructor(private button : ElementRef) {
	}

	// protected ngOnChanges() {
	// 	if (this.focus) {
	// 		this.element.nativeElement.focus();
	// 	}
	// }
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
