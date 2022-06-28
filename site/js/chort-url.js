function getUrl() {
    let url = document.getElementById("url").value;
    const form = document.getElementById("form")
    if (url.length === 0) return alert("Поле исходной ссылки не может быть пустым")
    sendOnServer(url)
    function sendOnServer(url) {
        const config = { headers: { 'Content-Type': 'text/plain' } };
        // let fd = new FormData();
        // fd.append('text', file)
        document.getElementById("url").value = "Loading..."
        axios.post("/short-url", url, config).then(function (response) {
            if (response.data === "WrongUrl") {
                document.getElementById("url").value = url
                return alert("Неверный формат ссылки")
            }
            if (response.data === "ServerError") return alert("Произошла внутренняя ошибка сервера")
            // handle success
            form.innerHTML =
                "<div style=\"display: flex; flex-direction: column; align-items: center; padding: 30px 0 30px 0\">" +
                "<div style=\"display: flex; align-items: center;\"><label for=\"url\" style=\"margin-right: 10px\">Короткая ссылка:</label><div style=\"border: 1px solid rgb(255,255,255,0.65); border-radius: 3px; padding: 3px; background-color: rgba(145,145,180,0.53)\"><input onFocus=\"this.select()\" id=\"input\" style=\"outline:none; color: white; width: 200px; background-color: rgba(0,0,0,0); border: 1px solid rgba(255,255,255,0)\" value=\"hikk0o.dev/s/"+ response.data +"\" readonly></div></div>" +
                "<div onclick=\"window.location.reload()\" style=\"background-color: white; color: #1e1f2a; text-shadow: none; margin-top: 15px; cursor: pointer; user-select: none; border: 1px solid rgba(255,255,255,0.65); border-radius: 3px; box-shadow: 0 0 2px rgba(255,255,255,0.76); padding: 0 10px 0 10px; text-align: center; font-size: 15px\">Вернуться</div>" +
                "</div>";
            console.log(response.data);
        })
    }
}
