# Содержание проекта
Проект сервера на NodeJS + сайт

- Основная страница (https://hikk0o.dev/, в разработке)
- Генератор сокращённой ссылки из длинной (https://hikk0o.dev/short-url/) 
- Генератор сокращённой ссылки из фото (https://hikk0o.dev/upload/)
- Отправка 404 страницы при неверном URL

## Backend
Для функционирования генератора коротких URL из длинных URL и фото, сервер делает `GET` и `POST` запросы через библиотеку `axios`, обмениваясь данными с [собственным REST API](https://github.com/Hikk0o/RedirectWebAPI), написанным на C#.

### Получение контента из короткой ссылки
<details>
  <summary>C# код</summary>
  
```js
    const axios = require('axios');
    ...
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
                }
            })
            .catch(error => {
                console.log(error);
            })
    }
    ...
```
</details>

### Генерация коротких ссылок
При отправке фотографий, файл сжимается через библиотеку `sharp`, конвертируется в тектовый формат base64 и вставляется в тело запроса.

<details>
  <summary>C# код</summary>
  
```js
    const sharp = require('sharp');
    const axios = require('axios');
    ...
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
        }
    }
    ...
```
</details>
