var typed = new Typed('.element', {
    strings: [
        '<a class="special-color special-font">junior software engineer</a>.',
        '^300 <a class="special-color special-font">student of Russian Technological University</a>.'
    ],
    typeSpeed: 30,
    loop: true,
    contentType: 'html',
    backDelay: 3500,
    startDelay: 300,
    backSpeed: 10
});
console.log(location.search)
console.log(location.pathname)

if (location.pathname.endsWith('/index.html')) {
    history.pushState(null, null, location.pathname.replace('index.html', '') + location.search);
    console.warn('Redirect to /')
}
