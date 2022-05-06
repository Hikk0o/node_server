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
                "<div style=\"display: flex; flex-direction: column; align-items: center; padding: 30px 0 30px 0\">" +
                "<div style=\"display: flex; align-items: center;\"><label for=\"url\" style=\"margin-right: 10px\">Короткая ссылка:</label><div style=\"border: 1px solid rgb(255,255,255,0.65); border-radius: 3px; padding: 3px; background-color: rgba(145,145,180,0.53)\"><input onFocus=\"this.select()\" id=\"input\" style=\"outline:none; color: white; width: 200px; background-color: rgba(0,0,0,0); border: 1px solid rgba(255,255,255,0)\" value=\""+ xhr.responseText +"\" readonly></div></div>" +
                "<div onclick=\"window.location.reload()\" style=\"background-color: white; color: #1e1f2a; text-shadow: none; margin-top: 15px; cursor: pointer; user-select: none; border: 1px solid rgba(255,255,255,0.65); border-radius: 3px; box-shadow: 0 0 2px rgba(255,255,255,0.76); padding: 0 10px 0 10px; text-align: center; font-size: 15px\">Вернуться</div>" +
                "</div>";
        }
    } else {
        alert( 'Error' );
    }
}
