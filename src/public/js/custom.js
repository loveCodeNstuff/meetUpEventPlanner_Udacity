'use strict';

var forms = document.getElementsByTagName('form');
  for (var i = 0; i < forms.length; i++) {
    forms[i].addEventListener('invalid', function(e) {
      e.preventDefault();
    }, true);
  }

function checkOutline(elem, errorElem, msg, valid, compare){

  if(compare){
    dateCompare(document.getElementById('startDate').value, document.getElementById('endDate').value);
    msg = 'End Date is Required and Must be after Start Date';
  }

  var element = document.getElementById(elem),
      style = window.getComputedStyle(element),
      outline = style.getPropertyValue('outline');

  if(outline == 'rgb(255, 0, 0) solid 2px' || valid == false){
    var para = document.createElement("P"),
        t = document.createTextNode(msg);
    document.getElementById(errorElem).innerHTML = "";
    para.appendChild(t);
    document.getElementById(errorElem).appendChild(para);

  }else if(outline == 'rgb(124, 193, 249) solid 2px' || valid == true){
    document.getElementById(errorElem).innerHTML = "";
  }
}

function validDates(elem, errorElem, msg, compare){

  var dateTime = document.getElementById(elem).value;
      dateTime= new Date(dateTime).getTime();

  if(Date.now() < dateTime){
    document.getElementById(elem).className = "";
    checkOutline(elem, errorElem, 'nothing', true, compare);
  }else{
    document.getElementById(elem).className = "invalid";
    checkOutline(elem, errorElem, msg, false, compare);
  }
}

function dateCompare(startDate, endDate){

    startDate = new Date(startDate).getTime();
    endDate= new Date(endDate).getTime();

    if(startDate > endDate || startDate == endDate){
      document.getElementById('endDate').className = "invalid"
    }
}
