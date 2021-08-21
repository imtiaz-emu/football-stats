$(document).ready(function () {
  $("body").removeClass("loading");

  $("#match-fetcher-form").submit(function () {
    $("body").addClass("loading");
  })

  var triggerTabList = [].slice.call(document.querySelectorAll('#matchStats-tab button'))
  triggerTabList.forEach(function (triggerEl) {
    var tabTrigger = new bootstrap.Tab(triggerEl)

    triggerEl.addEventListener('click', function (event) {
      event.preventDefault()
      tabTrigger.show()
    })
  })

});
