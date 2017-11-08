import { Component, ElementRef, Input } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { OnInit, AfterViewInit } from '@angular/core';
import { ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { ViewContainerRef, ViewChild } from '@angular/core';
import { Http } from '@angular/http';

import { NgModule, Compiler, ComponentFactory } from '@angular/core';
import { QuestionModule } from "./question.module";
import { ModelService } from "./model.service";

@Component({
    selector: 'qmark,[qmark]',
    template: '<ng-container #contentView></ng-container>',    
    styleUrls: ['./qmark.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ModelService]
})
export class QmarkComponent implements OnInit, AfterViewInit {
    private markdownContent: string;  

    @ViewChild('contentView', { read: ViewContainerRef })
    viewContainer: ViewContainerRef;

    constructor(
        // private viewContainerRef: ViewContainerRef,
        private compiler: Compiler,
        private modelService: ModelService
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
        this.viewContainer.clear();
        
        if (this.markdownContent) {
            let htmlContent = this.modelService.compile(this.markdownContent);
            let factory = this.getComponentFactory(htmlContent);

            this.viewContainer.createComponent(factory);
        }
    }

    public getComponentFactory(template: string) : ComponentFactory<any> {
    
        @Component({
            template: template
        })
        class DynamicComp {
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
