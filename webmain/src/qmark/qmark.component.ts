import { Component, ElementRef, Input } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { OnInit, AfterViewInit } from '@angular/core';

import { Http } from '@angular/http';
import { QmarkService } from './qmark.service';

@Component({
    selector: 'qmark,[qmark]',
    template: '<ng-content></ng-content>',
    styles: [
        `.token.operator, .token.entity, .token.url, .language-css \
            .token.string, .style .token.string {
            background: none;
        }`
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QmarkComponent implements OnInit, AfterViewInit {
    private _data: string;

    constructor(
        private qmarkService: QmarkService,
        private el: ElementRef,
    ) {

    }

    ngOnInit() {

    }
    
    ngAfterViewInit() {

    }

    @Input()
    set data(value: string) {
        if(value){
            this._data = value;
            this.onDataChange(value);
        }
    }

    // on input
    onDataChange(data: string) {

        
        if (data) {
            this.el.nativeElement.innerHTML = this.qmarkService.compile(data);
        } else {
            this.el.nativeElement.innerHTML = '';
        }
    }
}
