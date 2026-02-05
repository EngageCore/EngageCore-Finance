
function updateTimer() {
    future = Date.parse("Dec 19, 2024 11:30:00");
    now = new Date();
    diff = future - now;

    days = Math.floor(diff / (1000 * 60 * 60 * 24));
    hours = Math.floor(diff / (1000 * 60 * 60));
    mins = Math.floor(diff / (1000 * 60));
    secs = Math.floor(diff / 1000);

    d = days;
    h = hours - days * 24;
    m = mins - hours * 60;
    s = secs - mins * 60;

    document.getElementById("timer")
        .innerHTML =
        '<div class=" col-xxl-3 col-lg-12 col-md-3 col-sm-3 col-12"><div class="px-3 py-3 fw-medium bg-primary rounded-2"><h4 class="fw-medium fs-24 op-8 text-white text-center mb-0">' + d + '</h4></div><p class="mt-2 text-dark text-center fs-14 op-7">Days</p></div>' +
        '<div class=" col-xxl-3 col-lg-12 col-md-3 col-sm-3 col-12"><div class="px-3 py-3 fw-medium bg-primary rounded-2"><h4 class="fw-medium fs-24 op-8 text-white text-center mb-0">' + h + '</h4></div><p class="mt-2 text-dark text-center fs-14 op-7">Hours</p></div>' +
        '<div class=" col-xxl-3 col-lg-12 col-md-3 col-sm-3 col-12"><div class="px-3 py-3 fw-medium bg-primary rounded-2"><h4 class="fw-medium fs-24 op-8 text-white text-center mb-0">' + m + '</h4></div><p class="mt-2 text-dark text-center fs-14 op-7">Minutes</p></div>' +
        '<div class=" col-xxl-3 col-lg-12 col-md-3 col-sm-3 col-12"><div class="px-3 py-3 fw-medium bg-primary rounded-2"><h4 class="fw-medium fs-24 op-8 text-white text-center mb-0">' + s + '</h4></div><p class="mt-2 text-dark text-center fs-14 op-7">Seconds</p></div>'
}
setInterval('updateTimer()', 1000);