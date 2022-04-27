import * as fs from 'fs'
import * as https from 'https'

const options = {
    key: fs.readFileSync('ssl/apache2.key'),
    cert: fs.readFileSync('ssl/apache2.cert')
};


https.createServer(options, function (req, res) {
    console.log(req.url)
    const sitePath = './site/';
    switch (req.url) {
        case '/favicon.ico':
            res.end()
            break
        case '/index.html':
            res.writeHead(301,{
                Location: '/'
            });
            res.end()
            break
        case '/':
            fs.readFile(sitePath + 'index.html', null, function (error, html) {
                if (error) {
                    res.writeHead(404);
                    res.write('Whoops! File not found!');
                } else {
                    res.writeHead(301, {
                        'Content-Type': 'text/html',
                    });
                    res.write(html);
                }
                res.end();
            });
            break
        default:
            let redirects = JSON.parse(fs.readFileSync('./redirects.json', 'utf8'));
            if (redirects[req.url] !== undefined) {
                res.writeHead(301,{
                    Location: redirects[req.url]
                });
                res.end()
            } else if (req.url.endsWith('.js') || req.url.endsWith('.css')) {
                let contentType = ''
                if (req.url.endsWith('.js')) {
                    contentType = 'text/javascript'
                }
                if (req.url.endsWith('.css')) {
                    contentType = 'text/css'
                }
                fs.readFile(sitePath + req.url, null, function (error, html) {
                    if (error) {
                        res.writeHead(404);
                        res.write('Whoops! File not found!');
                    } else {
                        res.writeHead(200, {
                            'Content-Type': contentType,
                            'Cache-Control': 'max-age=31536000'
                        });
                        res.write(html);
                    }
                    res.end();
                });
            } else {
                fs.readFile(sitePath + 'errors/404.html', null, function (error, html) {
                    if (error) {
                        res.writeHead(404);
                        res.write('Whoops! File not found!');
                    } else {
                        res.writeHead(200, {
                            'Content-Type': 'text/html',
                            'Cache-Control': 'max-age=31536000'
                        });
                        res.write(html);
                    }
                    res.end();
                });
            }
    }
}).listen(443);