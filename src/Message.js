define(function () {
    return {
        encode: function (data) {
            return 'Hello World';
        },
        decode: function (message) {
            return 'Hello World';
        },
        hex2a: function (hexx) {
          var hex = hexx.toString();//force conversion
          var str = '';
          for (var i = 0; i < hex.length; i += 2)
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
          return str;
        },
        a2hex: function (str) {
          var arr = [];
          for (var i = 0, l = str.length; i < l; i ++) {
          var hex = Number(str.charCodeAt(i)).toString(16);
          arr.push(hex);
          }
          return arr.join('');
        }
    };
});
