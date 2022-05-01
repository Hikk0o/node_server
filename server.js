const https = require('https');
const fs = require('fs');
const requestIp = require('request-ip');
const url = require('url');
const html_pages = require('./src/modules/html-pages');
const validator = require('validator');

const options = {
    key: fs.readFileSync('ssl/apache2.key'),
    cert: fs.readFileSync('ssl/apache2.cert')
};

const sitePath = './site'


https.createServer(options, function (req, res) {

    // start URL QUERY
    const req_URL = new URL('https://hikk0o.dev' + req.url);
    let redirects
    const parts = url.parse(req.url,true);
    if (parts.query['shorten'] === 'true') {
        if (parts.query['url'] !== undefined && validator.isURL(parts.query['url'])) {
            try { redirects = JSON.parse(fs.readFileSync('./src/redirects.json', 'utf8')); } catch (e) {/* pass */}
            let longUrl = parts.query['url']
            let shortUrl = generateUrl(redirects)
            redirects[shortUrl] = longUrl
            try { fs.writeFileSync('./src/redirects.json', JSON.stringify(redirects)); } catch (e) {
                res.end('Server error!')
            }
            res.end('https://' + req.headers.host + '/' + shortUrl + '/')
        } else {
            res.end('Try https://' + req.headers.host + '/?shorten=true&url=[url]')
        }
        return
    }
    // end URL QUERY

    let req_url = req_URL.pathname
    consoleLog(req, 'URL: ' + req_url)

    // start REDIRECT
    try { redirects = JSON.parse(fs.readFileSync('./src/redirects.json', 'utf8')); } catch (e) {/* pass */}
    let req_path = req_URL.pathname.split('/')
    req_path.shift()
    if (redirects[req_path[0]] !== undefined) {
        res.writeHead(301, {
            Location: redirects[req_path[0]]
        });
        consoleLog(req, 'Redirect to ' + redirects[req_path[0]])
        res.end()
    }
    // end REDIRECT

    // start HTML
    else if (req_path.length === 1) {
        if (req_path[0] === '') {
            html_pages.openHtmlFile(res, req_url + '/index.html')
        } else if (req_path[0] === 'favicon.ico') {
            res.end()
        } else if (req_url.endsWith('.html')) {
            html_pages.openHtmlFile(res, req_url)
        } else {
            html_pages.openHtml404(res)
        }
    } else {
        if (req_url.endsWith('.html')) {
            html_pages.openHtmlFile(res, req_url)
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
                    html_pages.openHtml404(res)
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
            html_pages.openHtml404(res)
        }
    }
    // end HTML
}).listen(443, '0.0.0.0');

function consoleLog(req, msg) {
    let now = new Date();
    let time = '[' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + ']'
    console.log(time + ' ' + requestIp.getClientIp(req) + ' ' + msg)
}

function generateUrl(redirects) {
    let length = 6,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    if (redirects[retVal] === undefined) {
        return retVal;
    } else {
        return generateUrl(redirects)
    }
}