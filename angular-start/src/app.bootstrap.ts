// 下面这三个包必须开始就加载
import "reflect-metadata";
import "shim";
import "zone.js";

import {enableProdMode} from '@angular/core';

declare var wepappEnviroment: any;
if (!wepappEnviroment.debug) {
  enableProdMode();
}



//----------------------------------------------------------------------------
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { MainModule } from 'app/main.module';
platformBrowserDynamic().bootstrapModule(MainModule);
