const https = require('https');
const fs = require('fs');
const requestIp = require('request-ip');
const url = require('url');
const html_pages = require('./src/modules/html-pages');
const validator = require('validator');
const busboy = require('busboy');
const path = require('path');
const sharp = require("sharp");


const options = {
    key: fs.readFileSync('ssl/apache2.key'),
    cert: fs.readFileSync('ssl/apache2.cert')
};

const sitePath = './site'

https.createServer(options, function (req, res) {

    const req_URL = new URL('https://hikk0o.dev' + req.url);
    let req_url = req_URL.pathname
    consoleLog(req, 'URL: ' + req_url)
    let redirects
    let req_path = req_URL.pathname.split('/')
    req_path.shift()

    // start REDIRECT
    try { redirects = JSON.parse(fs.readFileSync('./src/redirects.json', 'utf8')); } catch (e) {/* pass */}
    if (redirects[req_path[0]] !== undefined) {
        res.writeHead(301, {
            Location: redirects[req_path[0]]
        });
        consoleLog(req, 'Redirect to ' + redirects[req_path[0]])
        res.end()
    }
    // end REDIRECT

    // start HTML
    if (req_path[0] === '') {
        const parts = url.parse(req.url,true);
        try { redirects = JSON.parse(fs.readFileSync('./src/redirects.json', 'utf8')); } catch (e) {/* pass */}

        if (parts.query['file'] !== undefined) {
            fs.readFile('./download/' + parts.query['file'], null, function (error, data) {
                if (error) {
                    html_pages.openHtml404(res)
                } else {
                    res.end(data);
                }
            });
        } else {
            html_pages.openHtmlFile(res, req_url + 'index.html')
        }
    }
    else if (req_path[0] === 'upload' && req.method === 'POST') {
        try {
            let path_to_file = ''
            const bb = busboy({ headers: req.headers });
            let short_path = generateUrl(redirects)
            bb.on('file', (name, file, info) => {
                if (info.filename === undefined) return
                if (!info.mimeType.startsWith('image/')) {
                    res.end('Invalid file!')
                    return;

                }
                if (info.filename.endsWith('.png') || info.filename.endsWith('.jpg') || info.filename.endsWith('.jpeg')) {
                    path_to_file = __dirname + '/download/' + `${short_path}.` + info.mimeType.split('/')[1];
                    const saveTo = path.join(__dirname + '/download/', `${short_path}.` + info.mimeType.split('/')[1]);
                    file.pipe(fs.createWriteStream(saveTo));
                    redirects[short_path] = '/?file=' + `${short_path}.` + info.mimeType.split('/')[1]
                    try { fs.writeFileSync('./src/redirects.json', JSON.stringify(redirects)); } catch (e) {
                        consoleLog(req, e)
                        res.end('Server error!')
                    }
                } else {
                    res.end('Invalid file!')
                }

            }).on('close', () => {
                res.writeHead(200, { 'Connection': 'close' });
                try {
                    setTimeout(() => {
                        sharp(fs.readFileSync(path_to_file))
                            .png({ quality: 85, progressive: true, force: false })
                            .toFile(path_to_file).then().catch()

                        res.end('https://' + req.headers.host + '/' + short_path + '/')
                    }, 500) // ms

                } catch (e) {
                    consoleLog(req, e)
                    res.end('Server error!')
                }
            });
            req.pipe(bb);

        } catch (e) {
            consoleLog(req, e)
            res.end('Server error!')
        }
    }
    else if (req_url.endsWith('favicon.ico')) {
        res.end()
    } else if (req_path[0] === 'short-url') {
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
                res.end('client_error')
            }
        } else {
            html_pages.openHtmlFile(res, '/' + req_path[0] + '.html')
        }
    } else if (req_url.endsWith('.html')) {
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
        html_pages.openHtmlFile(res, req_path[0] + '.html')
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