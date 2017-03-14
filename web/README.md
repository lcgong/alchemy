


遇到TypeScript类型解析错误时，可以使用tsc的
[```--traceResolution```](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
参数


### Angular测试

#### 单元测试
采用karma测试框架，karma自行打开服务和浏览器，并将测试自动放置在


运行单元
```
npm test
```

有选择的运行
```
npm test -- --grep SomeComponent
```
> * ```--``` 表示后面的参数传递给karma
> * ```--grep``` 按正则匹配测试的路径和名字




 参考[Angular Tesing](https://angular.io/docs/ts/latest/guide/testing.html)

#### 系统集成测试
