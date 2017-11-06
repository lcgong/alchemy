import { Component, ElementRef, Input } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { OnInit, AfterViewInit } from '@angular/core';
import { ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { ViewContainerRef, ViewChild } from '@angular/core';

import { NgModule, Compiler, ComponentFactory } from '@angular/core';
import { QuestionModule } from "./question.module";

import { Http } from '@angular/http';
import { QmarkService } from './qmark.service';


@Component({
    selector: 'qmark,[qmark]',
    template: '<div #contentView></div>',
    styleUrls: ['./qmark.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QmarkComponent implements OnInit, AfterViewInit {
    private markdownContent: string;

    @ViewChild('contentView', { read: ViewContainerRef })
    contentView: ViewContainerRef;

    constructor(
        private qmarkService: QmarkService,
        private el: ElementRef,
        private compiler: Compiler
    ) {
    }

    ngOnInit() {

    }
    
    ngAfterViewInit() {

    }

    @Input()
    set data(value: string) {
        if(value){
            this.markdownContent = value;
            this.render();
        }
    }

    render() {
        if (this.markdownContent) {
            let html = this.qmarkService.compile(this.markdownContent);
            this.contentView.clear();
            this.contentView.createComponent(this.getComponentFactory(html));
        } else {
            this.contentView.clear();
        }
    }

    public getComponentFactory(template: string) : ComponentFactory<any> {
    
        @Component({
            template: template
        })
        class DynamicComp {
            name: string = 'Denys'
        };

        @NgModule({
            imports: [QuestionModule],
            declarations: [DynamicComp]
        })
        class CompModule {
        }

        let module = this.compiler.compileModuleAndAllComponentsSync(CompModule);
        let factories = module.componentFactories;
        for (let i = factories.length -1; i >=0; i--) {
            let factory = factories[i];
            if (factory.componentType === DynamicComp) {
                return factory;
            }                      
        }

        return null;
    }    
}
