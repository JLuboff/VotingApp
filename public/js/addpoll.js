$(document).ready(function(){
    let optionCount = 2;
  $("#add").click(function(){
    optionCount++;
    //When adding additional fields we look at the meetEventBody div and clone and append our cloned fields after the original field. We clear its contnets (if any) and change its id. We call back to our numOnly function to ensure only numbers and colon are accepted in our fields.
    $(".form").append(`<label class="label">Option ${optionCount}: </label><input class="input is-medium" type="text" name="option${optionCount}">`);
  })



})
