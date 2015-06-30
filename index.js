var fs = require('fs');
var cheerio = require('cheerio');
var cleanCss = require('clean-css');
var opener = require("opener");
var cssSrc = process.argv[2] || null;

if (!cssSrc) {
    console.error("Can not find any css file");
    console.error("Do you want node index.js demo.css ?");
    return false;;
}

readCss('./demo.css', function(data) {
    var cssMap = data;
    fs.readFile('./index.html', function(err, data) {
        var $ = cheerio.load(data.toString());
        var src = __dirname + '/parsing.html';
        for (var name in cssMap) {

            var _prefix = $(name).attr('style') ? $(name).attr('style')+';' : '';

            $(name).attr('style', _prefix+cssMap[name]);
        }

        $('link').remove();

        var _html = $.html().replace(/\&quot\;/g,'"').replace(/\&apos\;/g,"'").replace(/\&amp\;/g,'&');

        fs.writeFile(src, _html, function(err) {
            if (err) throw err;
            console.log('文件编译成功，编译后的文件路径为:' + src);
            opener(src);
        });
    });
});



function readCss(src, callback) {
    var map = {};
    fs.readFile(src, function(err, data) {
        var minified = new cleanCss().minify(data.toString()).styles;
        if (err) throw err;
        var _cssStr = minified.split('}');
        _cssStr.forEach(function(val, key) {
            var parse = val.split('{');
            var _name = parse[0];
            var _value = parse[1];
            if (/\:hover|\:active|\:link|\:visited/.test(_name)) return;
            map[_name] = _value;
        });
        callback.call(this, map);
    });
}
