import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';


import  {MarkdownEngine}  from "./engine";
import {plugin as questionMarkdownPlugin} from "./qmark_plugin";

describe('CaptionComponent', function () {
  let de: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: []
    })
    .compileComponents();
  });

  let engine : MarkdownEngine;

  beforeEach(() => {
    engine = new MarkdownEngine();

  });

  // it('should create component', () => expect(comp).toBeDefined() );

  it('Example1', () => {
    engine.parse(`
      ##1 单选题
      为验证程序模块A是否正确实现了规定的功能，需要进行 __(1)__；
      为验证模块A能否与其他模块按照规定方式正确工作，需要进行__(2)__。

      (A): 单元测试
      (B): 集成测试
      (C): 确认测试
      (D): 系统测试

      %%% 答案 1. (A) ; 2. (B)
    `, 10);

    expect(engine.tokens.length).toEqual(41);

    console.log(engine.questions);

    // By.css('h1')

    // fixture.detectChanges();
    // const h1 = de.nativeElement;
    // expect(h1.innerText).toMatch(/angular/i,
    //   '<h1> should say something about "Angular"');
  });
});
