#!/usr/bin/env node

var fs = require('fs');
var cheerio = require('cheerio');
var cleanCss = require('clean-css');
var opener = require("opener");
var htmlFile = process.argv[2] || 'index.html';

fs.readFile(htmlFile, function(err, data) {
    if (err) {
        console.error('警告：你没有指定需要编译的html文件，在' + __dirname + '下也没有找着默认的目标文件index.html');
        return false;;
    }
    var $ = cheerio.load(data.toString(),{decodeEntities: false});

    var cssPath = $('link').attr('href');

    if (!cssPath) {
        console.error('目标文件:' + htmlFile + '下并没有载入任何css文件');
        return false;
    }

    readCss(cssPath, function(err,data) {
        var cssMap = data;
		var src = __dirname + '/parsing.html';

		if(err){
			console.error('404 ! not found '+cssPath);
			return false;
		}

        for (var name in cssMap) {

            var _prefix = $(name).attr('style') ? $(name).attr('style') + ';' : '';

            $(name).attr('style', _prefix + cssMap[name]);
        }

        $('link').remove();

        var _html = $.html()


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
        callback.call(this, err,map);
    });
}
