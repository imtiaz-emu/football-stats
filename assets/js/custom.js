$(document).ready(function () {
  $("body").removeClass("loading");

  $("#match-fetcher-form").submit(function () {
    $("body").addClass("loading");
  })
});
