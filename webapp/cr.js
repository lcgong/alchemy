
var crypto = require('crypto')

var signature = crypto.createSign('RSA-SHA256')



let PRIVATE_KEY = 'MIIEpAIBAAKCAQEAo0MbI2VdcZ0/psla+iKmmPcGnQt8PBjpIUnTY4wi97jr3rISU0qn+mpF3jI7cWWO3zHZFcd88pwXbylbAqHoRYhCg9MTeEQ/GPFFi8Z/qiRom945ZG3yUdOz4pCIfLlWYcUaDIsZA65s7A02zpzvR4ZJHdETtWzJkEigEgyL3lQTsQkfP3G4BBTlKr55//AR7p3zR0u/78Q/tIXcBW8Mvieo0ywbjP7XciegOYwiUjY+GLiJxFMunuclN+GNJcgZi0IOU3elWstIAMxdFUMcyyiesqAyypF4OJqvFCazVeAVX2RoHq9qpYuwKKBBrHglUIXQ5q/wfEJkQf9vp/UdswIDAQABAoIBAASqeU8UqYwCs3v/yzLU5LAAd1brqhxJlfgWlQ0GR0WPKmaN7kolGxHkEaUdCGfgQCoO0aZ2shJ49Y5+vxQfLnU2RLhhwu+v+6Gp25P4E1P4gGjb/AXrwn4mL8Ds4om1/ksDCBCNtSROytwgMI3NHGWN5+8LN6X6uvP9r110sFalQs3tr+WBDY6jyJnxlXTmlTManFKRPlKW8G5yOtwWlAiOufrTcYsebfi5EVFVAuwIncJ886Oe1zOPGIA32sBy0tzNqk8OyVmSeUezo3ITPF9Rvm0aSVv9Pd2zVyDOWVFGczyqeVC9fG3xyw/eOzgO/rY2ED94e4+ejsUYg+8VxqkCgYEA0rk11E8pVUgMlaG2cCmhxfVvroU6szrWI1r/qjbUDn4UtM6FIYe9l37AmKR06imQ+XoNkQGNT3e0uUt4V1V1HtuOItUB2yHf59xRQvLHzx1UFOTiPm/vwzUO1oR7FY3/HpPC9PtLfoKaU3mcbd1itQK3gTPZmk+2JBx6dHKM3F8CgYEAxldMARsR+qCDbPVkg/ZIiuN5hT8M9txlBMnItymS6Zfa12BxWRKENdDROUdpdylkX6sCJ9ZAoka6rrd3s8peR/YFOohJuTmgft8PGv5xIMW7so4Wu5gxGnAKkibFtIVZCPU4e5VFa3ZsX1OsV0Eue3vCxHx5zO8pptcG0ohpPy0CgYEAxjTH2SeMrVbT33r4a4/9RoKRxgozKJrTCPZzPNvNosQdHeSTfPJ89p6W8fzeq9LlNoQDdr2K+ZCTQScnzp3nSFsj2seYs1Gtlh25octS/hGMIQsZc7k+QNMLXePHEoM50L0Tx/MHE7wtBQ+CgCSYz8H6cWEf8PHBVT4kQJvuuukCgYEApOuluS2nL30Uix8o60l4XHR1cURSJVpxbR/UE+kvzaiFQZ1h4qyw3oa50iT9HyZ93ca2TiWrLMQfKnRHxmm5J6D8DAWTN78hIx2a09lKe/Ou9PONF4OfINqVD53Juyc+N2KgCrK+PHMF/eX3Yb5DRk5MT1EpfixHuAEIHTtsOCkCgYAtQwKAUUEWzMIobyD2EPV09jwiAQQhfyaj4n4D8qGkKyQEpgWKmKnZbk0NHCQG4lPnqBqLo5MneZHi8OZsuogXg916p7E406jG6+mfJWmSQ5EyaLQoVsFjn2I7+Xcmx8KwtQ8pmSvVe7XJRYlqJCJQpF7mzSbXIolsFo9+GI//SA==';

let PUBLIC_KEY ='MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAo0MbI2VdcZ0/psla+iKmmPcGnQt8PBjpIUnTY4wi97jr3rISU0qn+mpF3jI7cWWO3zHZFcd88pwXbylbAqHoRYhCg9MTeEQ/GPFFi8Z/qiRom945ZG3yUdOz4pCIfLlWYcUaDIsZA65s7A02zpzvR4ZJHdETtWzJkEigEgyL3lQTsQkfP3G4BBTlKr55//AR7p3zR0u/78Q/tIXcBW8Mvieo0ywbjP7XciegOYwiUjY+GLiJxFMunuclN+GNJcgZi0IOU3elWstIAMxdFUMcyyiesqAyypF4OJqvFCazVeAVX2RoHq9qpYuwKKBBrHglUIXQ5q/wfEJkQf9vp/UdswIDAQAB';

//将RSA公私钥转换为PEM格式
var privateKey = '-----BEGIN PRIVATE KEY-----\n' + PRIVATE_KEY + '\n-----END PRIVATE KEY-----';
var aliPublicKey = '-----BEGIN PUBLIC KEY-----\n' + PUBLIC_KEY + '\n-----END PUBLIC KEY-----';

function alipaySign(appId, code) {
  var params = {
    app_id: appId,
    method: 'alipay.system.oauth.token',
    grant_type: 'authorization_code',
    timestamp: '2017-3-12 18:00:00',
    sign_type: 'RSA2',
    charset:'utf-8',
    version: '1.0',
    code='4b203fe6c11548bcabd8da5bb087a83b',
  }

  for(let key of Object.keys(params).sort()){
    if(!requestParams[key] || key=='sign'){
            continue;
    }
    keySet.push(key);
  }

  var preStr='';
  var keySet=[];
  for(var key of Object.keys(requestParams).sort()){
          if(!requestParams[key] || key=='sign'){
                  continue;
          }
          keySet.push(key);
  }
  for(var i=0; i<keySet.length; i++){
          var key=keySet;
          var value = requestParams[key];
          if(i==keySet.length-1){
                  preStr = preStr + key + '=' + value + '';
          }else{
                  preStr = preStr + key + '=' + value + '&';
          }
  }
}
