$(document).ready(function(){
  let optionCount = 2;
  $("#add").click(function(){
    optionCount++;
    $(".form").append(`<label class="label option${optionCount}">Option ${optionCount}: </label><input class="input is-medium option${optionCount}" type="text" name="option${optionCount}">`);
    $("#remove").css("visibility", "visible");
  });

  $("#remove").click(function(){
    $(`.option${optionCount}`).remove();
    optionCount--;
    if(optionCount === 2){
      $('#remove').css('visibility', 'hidden');
    }
  });
});
