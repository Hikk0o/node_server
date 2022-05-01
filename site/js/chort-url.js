function getUrl() {
    let url = document.getElementById("url").value;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '?shorten=true&url=' + url, false);
    xhr.send();
    // <p>Короткая ссылка: <input value="asdasdas"></p>
    if (xhr.status === 200) {
        if (xhr.responseText === 'client_error') {
            alert( 'Некорректная ссылка, попробуйте ещё раз' )
        } else {
            let res = document.getElementById("form")
            res.innerHTML =
                "<p>Короткая ссылка: <input onFocus=\"this.select()\" id=\"input\" style=\"width: 200px\" value=\""+ xhr.responseText +"\" readonly></p>" +
                "<p><div onclick=\"window.location.reload()\" style=\"cursor: pointer; user-select: none; border: 1px solid black; border-radius: 3px; width: 100px; text-align: center\">Вернуться</div></p>";
        }
    } else {
        alert( 'Error' );
    }
}
