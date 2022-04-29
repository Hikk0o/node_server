const https = require('https');
const fs = require('fs');
const requestIp = require('request-ip');
const url = require("url");

const options = {
    key: fs.readFileSync('ssl/apache2.key'),
    cert: fs.readFileSync('ssl/apache2.cert')
};

const sitePath = './site';

https.createServer(options, function (req, res) {
    // GET
    const req_URL = new URL('https://hikk0o.dev' + req.url);
    const parts = url.parse(req.url,true);
    // console.log(parts.query)

    // HTML and REDIRECT
    let req_url = req_URL.pathname
    consoleLog(req, 'URL: ' + req_url)
    let redirects = JSON.parse(fs.readFileSync('./redirects.json', 'utf8'));
    let req_path = req_URL.pathname.split('/')
    req_path.shift()
    if (req_path.length == 1) {
        if (req_path[0] == '') {
            openHtmlFile(res, req_url + '/index.html')
        } else if (req_path[0] == 'favicon.ico') {
            res.end()
        } else if (redirects[req_path[0]] !== undefined) {
            res.writeHead(301, {
                Location: redirects[req_path[0]]
            });
            consoleLog(req, 'Redirect to ' + redirects[req_path[0]])
            res.end()
        } else if (req_url.endsWith('.html')) {
            openHtmlFile(res, req_url)
        } else {
            page404(res)
        }
    } else {
        if (req_url.endsWith('.html')) {
            openHtmlFile(res, req_url)
        } else if (req_url.endsWith('.js') || req_url.endsWith('.css') || req_url.endsWith('.png')) {
            let contentType = ''
            if (req_url.endsWith('.js')) {
                contentType = 'text/javascript'
            }
            if (req_url.endsWith('.css')) {
                contentType = 'text/css'
            }
            if (req_url.endsWith('.png')) {
                contentType = 'image/png'
            }
            fs.readFile(sitePath + req_url, null, function (error, html) {
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

function consoleLog(req, msg) {
    let now = new Date();
    let time = '[' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + ']'
    console.log(time + ' ' + requestIp.getClientIp(req) + ' ' + msg)
}

function openHtmlFile(res, req_url) {
    fs.readFile(sitePath + req_url, null, function (error, html) {
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
}