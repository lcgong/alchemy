
var wepappEnviroment = {
  typescript: true,
  debug: true,
};

(function(){
  'use strict';

wepappEnviroment.typescript = hasAttrChecked('typescript');
wepappEnviroment.debug = hasAttrChecked('debug');

var prefetchResources = [
  'jspm_packages/system.js', 'jspm.config.js', 'rt.js'
];

if (wepappEnviroment.typescript) {
  prefetchResources = prefetchResources.concat([
    'jspm.config.transpiler.js', 'ts.transpiler.js']
  );
}

setTimeout(function(){
  prefetch(prefetchResources).then(function() {
    importApplicationScripts();
  });
}, 0);


function importApplicationScripts() {

  // 1. 先加载systemjs和及其配置文件
  // 2. 接着加载lib.rt，如果采用动态加载，
  //    先定义transpiler再并行加载lib.rt和lib.ts.transpiler
  // 3. 最后加载angular模块
  importScript('jspm_packages/system.js', true).then(function() {
    var p = importScript('jspm.config.js');

    if (wepappEnviroment.typescript) {
      return p.then(function() {
        return importScript('jspm.config.transpiler.js');
      });
    } else {
      return p;
    }
  }).then(function() {

    if (!wepappEnviroment.debug) {
      System.config({
        production: true,
      });
    }

    if (wepappEnviroment.typescript) {
      // 配置动态ts编译，接着并行加载其所需包
      return Promise.all([
        importScript('rt.js', false),
        importScript('ts.transpiler.js', true),
      ]);

    } else {
      // 加载已编译成js的typescript程序
      return importScript('rt.js', false);
    }
  }).then(function() {
    // return Promise.all([
    //   'reflect-metadata', 'shim', 'zone.js'
    // ].map(function(p) {return System.resolve(p)})).then(function(urls){
    //   console.log();
    //
    //   return importScript(urls[0]).then(function() {
    //     return importScript(urls[1]);
    //   }).then(function() {
    //     return importScript(urls[2]);
    //   });
    // });
    // // return System.import('reflect-metadata');


    // return System.import('reflect-metadata').then(function() {
    //   return System.import('shim');
    // }).then(function() {
    //   return System.import('zone.js');
    // }).then(function() {
    //   return System.import('app.bootstrap');
    // })

    return System.import('app.bootstrap');
  }).catch(function(err){ console.error(err); });
}

//---------------------------------------------------------------------------

function isPreloadSupported() {
  var supp = false;
  try {
    supp = document.createElement("link").relList.supports('preload');
  } catch (e) {
  }

  if (supp) {
    return true;
  }

  console.warn('preload is not supported');
  return false;
}

function prefetch(urls) {
  if (!isPreloadSupported()) {
    return Promise.all([]);
  }

  let promises = [];
  for (let url of urls) {
    promises.push(_prefetch(url));
  }

  return Promise.all(promises);
}

function _prefetch(url) {
  return new Promise(function(resolve, reject) {
    var el = document.createElement("link");
    el.rel = "preload";
    el.as = "script";
    el.href = url;
    el.async = true;

    el.addEventListener('load', function loadHandler(event) {
      event.currentTarget.removeEventListener(event.type, loadHandler);
      resolve(url);
    });

    el.addEventListener('error', function errorHandler(event) {
      event.currentTarget.removeEventListener(event.type, errorHandler);
      resolve('(' + url + ')'); // 地址打上圆括弧表示无法加载该资源
    });

    document.head.appendChild(el);
  });
}

function importScript(url, asyncFlag) {
  return new Promise(function(resolve, reject) {
    var el = document.createElement('script');
    el.src = url;
    el.async = asyncFlag;

    el.addEventListener('load', function loadHandler(event) {
      event.currentTarget.removeEventListener(event.type, loadHandler);
      resolve(url);
    });
    el.addEventListener('error', function errorHandler(event) {
      event.currentTarget.removeEventListener(event.type, errorHandler);
      reject('error in loading: ' + url);
    });
    document.head.appendChild(el);
  });
}

function preloadResources(resources) {
	var document = window.document,
	    body = document.body;

	for (var obj, i = resources.length -1; i >=0; i--) {
		obj = document.createElement('object');
		obj.data = resources[i];
		obj.width = obj.height = 0;
		body.appendChild(obj);
	}
}


function hasAttrChecked(attrName) {
  var htmlEl = document.getElementsByTagName('html')[0];
  var attrValue = htmlEl.getAttribute(attrName);

  return attrValue === '' || attrValue;
}

})();
