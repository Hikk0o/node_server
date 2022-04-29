const https = require('https');
const fs = require('fs');
const requestIp = require('request-ip');

const options = {
    key: fs.readFileSync('ssl/apache2.key'),
    cert: fs.readFileSync('ssl/apache2.cert')
};

const sitePath = './site/';

https.createServer(options, function (req, res) {
    consoleLog(req, 'URL: ' + req.url)
    let redirects = JSON.parse(fs.readFileSync('./redirects.json', 'utf8'));
    let url = req.url
    url = url.split('/')
    url.shift()
    if (url.length == 1) {
        if (url[0] == '' || url[0] == 'index.html') {
            fs.readFile(sitePath + 'index.html', null, function (error, html) {
                if (error) {
                    page404(res)
                } else {
                    res.writeHead(200,{
                        'Content-Type': 'text/html'
                    });
                    res.write(html);
                    res.end();
                }
            });
        } else if (url[0] == 'favicon.ico') {
            res.end()
        } else if (redirects[url[0]] !== undefined) {
            res.writeHead(301, {
                Location: redirects[url[0]]
            });
            consoleLog(req, 'Redirect to ' + redirects[url[0]])
            res.end()
        } else {
            page404(res)
        }
    } else {
        if (req.url.endsWith('.js') || req.url.endsWith('.css') || req.url.endsWith('.png')) {
            let contentType = ''
            if (req.url.endsWith('.js')) {
                contentType = 'text/javascript'
            }
            if (req.url.endsWith('.css')) {
                contentType = 'text/css'
            }
            if (req.url.endsWith('.png')) {
                contentType = 'image/png'
            }
            fs.readFile(sitePath + req.url, null, function (error, html) {
                if (error) {
                    page404(res)
                } else {
                    res.writeHead(200, {
                        'Content-Type': contentType,
                        'Cache-Control': 'max-age=31536000'
                    });
                    res.write(html);
                    res.end();
                }
            });
        } else {
            page404(res)
        }
    }
}).listen(443, '0.0.0.0');

function page404(res) {
    fs.readFile(sitePath + 'errors/404.html', null, function (error, html) {
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

function consoleLog(req, msg) {
    let now = new Date();
    let time = '[' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + ']'
    console.log(time + ' ' + requestIp.getClientIp(req) + ' ' + msg)
}