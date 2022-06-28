const https = require('https');
const fs = require('fs');
const requestIp = require('request-ip');
const url = require('url');
const html_pages = require('./src/modules/html-pages');
const validator = require('validator');
const path = require('path');
const axios = require('axios');
const busboy = require('busboy');
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
    // const parts = url.parse(req.url,true);


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
            // console.log(req)
            let body = ''
            req.on('data', (data) => {
                body += data
            });
            req.on('end', async () => {
                // console.log(body)
                if (!body.startsWith("data:image")) return res.end("WrongData")
                const config = { headers: { 'Content-Type': 'application/json' } };
                let data = body.replace(/^data:image\/png;base64,/, '');
                let img = Buffer.from(data, 'base64');
                await sharp(img)
                    .png({ quality: 85, compressionLevel: 3, progressive: true })
                    .toBuffer()
                    .then(async function(outputBuffer) {
                        let outputBody = await Buffer.from(outputBuffer).toString('base64')
                        await axios.post("https://hikk0o.dev:2096/api/redirect/img", outputBody, config).then(function (response) {
                            // console.log(response.data);
                            res.end(response.data)
                        }).catch(function (e) {
                            console.error("Error: ", e)
                            res.end("ServerError")
                        })

                    }).catch(function (e) {
                        console.error("Error: ", e)
                        res.end("ServerError")
                    });
                // console.log(body)
            });
        } catch (e) {
            consoleLog(req, e)
            console.error(e)
            res.end('Server error!')
        }
    }
    else if (req_url.endsWith('favicon.ico')) {
        res.end()
    } else if (req_path[0] === 'short-url' && req.method === 'POST') {
        try {
            // console.log(req)
            let body = ''
            req.on('data', (data) => {
                body += data
            });
            req.on('end', () => {
                // console.log(body)
                const config = { headers: { 'Content-Type': 'application/json' } };
                axios.post("https://hikk0o.dev:2096/api/redirect/", body, config).then(function (response) {
                    // console.log(response.data);
                    res.end(response.data)

                }).catch(function (e) {
                    consoleLog(req, e)
                    // console.error(e)

                })
            });
        } catch (e) {
            consoleLog(req, e)
            console.error(e)
            res.end('Server error!')
        }    } else if (req_url.endsWith('.html')) {
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
    } else if (req_path[0] === 's' && req.method === 'GET') {
        console.log("Check redirect")
        axios.get('https://hikk0o.dev:2096/api/redirect/' + req_path[1])
            .then(response => {
                console.log(response.data);
                let pathUrl = response.data;
                if (pathUrl === "NotFound") {
                    html_pages.openHtml404(res)
                } else {
                    res.writeHead(301, {
                        Location: pathUrl
                    });
                    consoleLog(req, 'Redirect to ' + pathUrl)
                    res.end()

                }
            })
            .catch(error => {
                console.log(error);
            })
    } else if (req_path[0] === 'i' && req.method === 'GET') {
        console.log("Check redirect")
        axios.get('https://hikk0o.dev:2096/api/redirect/img/' + req_path[1])
            .then(response => {
                // console.log(response.data);
                let imgData = response.data;
                if (imgData === "NotFound") {
                    html_pages.openHtml404(res)
                } else {
                    consoleLog(req, 'Open img')
                    let data = imgData.replace(/^data:image\/png;base64,/, '');
                    let img = Buffer.from(data, 'base64');
                    res.setHeader("Pragma", 'public');
                    res.setHeader("Cache-Control", 'max-age=25920000');
                    res.setHeader("Content-Type", 'image/png');
                    res.setHeader("Expires", new Date(Date.now() + 25920000000).toUTCString());
                    res.writeHead(200);
                    res.end(img)
                    // sharp(img)
                    //     .png({ quality: 85, progressive: true, force: false })
                    //     .toBuffer()
                    //     .then(function(outputBuffer) {
                    //         res.end(outputBuffer)
                    //     });
                }
            })
            .catch(error => {
                console.log(error);
            })
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