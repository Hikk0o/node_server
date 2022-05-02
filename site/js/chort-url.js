function getUrl() {
    let url = document.getElementById("url").value;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '?shorten=true&url=' + url, false);
    xhr.send();
    if (xhr.status === 200) {
        if (xhr.responseText === 'client_error') {
            alert( 'Некорректная ссылка, попробуйте ещё раз' )
        } else {
            let res = document.getElementById("form")
            res.innerHTML =
                "<div style=\" display: flex; flex-direction: column; align-items: center; padding: 30px 0 30px 0\">" +
                "<div>Короткая ссылка: <input onFocus=\"this.select()\" id=\"input\" style=\"width: 200px\" value=\""+ xhr.responseText +"\" readonly></div>" +
                "<div onclick=\"window.location.reload()\" style=\"margin-top: 10px; cursor: pointer; user-select: none; border: 1px solid black; border-radius: 3px; width: 100px; text-align: center\">Вернуться</div>" +
                "</div>";
        }
    } else {
        alert( 'Error' );
    }
}
