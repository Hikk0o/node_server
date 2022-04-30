const fs = require('fs');

const sitePath = './site'

let openHtml404 = function(res) {
    fs.readFile(sitePath + '/errors/404.html', null, function (error, html) {
        if (error) {
            res.writeHead(404);
            res.write('Whoops! File not found!');
            res.end()
        } else {
            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Cache-Control': 'max-age=31536000'
            });
            res.write(html);
            res.end()
        }
    });
}
let openHtmlFile = function(res, req_url) {
    fs.readFile(sitePath + req_url, null, function (error, html) {
        if (error) {
            openHtml404(res)
        } else {
            res.writeHead(200,{
                'Content-Type': 'text/html'
            });
            res.write(html);
            res.end();
        }
    });
}

module.exports = { openHtmlFile, openHtml404 };



