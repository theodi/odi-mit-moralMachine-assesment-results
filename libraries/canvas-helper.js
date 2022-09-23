function drawLine(c,ctx,x,label,labelPos) {
  if (x>95) { x=x-1.5; } 
  else if (x<50) { x=x+0.5; }
  else { x=x-0.75; }
  var width = c.offsetWidth;
  var height = c.offsetHeight;
  var halfheight = height/2;
  ctx.beginPath();
  ctx.scale(1, 1);
  ctx.lineWidth = 5;
  ctx.moveTo((width/100)*x,halfheight/2)
  ctx.lineTo((width/100)*x,(halfheight/2)+halfheight)
  ctx.strokeStyle = "#ff0000";
  var labelY = 58;
  if (labelPos == "top") {
    labelY=12;
  }
  var textPosition = (width/100)*x+3;
  if (x>20 && x<80) {
    textPosition = textPosition-(label.length*4);
  }
  if (x>80) {
     textPosition = textPosition-(label.length*10);
  }
  ctx.font = "14px Arial";
  ctx.fillText(label,textPosition, labelY);
  
  
	ctx.stroke();
}
function drawTemplate(c,ctx) {
  var width = c.offsetWidth;
  var height = c.offsetHeight;
  var halfheight = height/2;
  var middle = width/2;
  ctx.beginPath();
 	ctx.scale(1, 1);
 	ctx.lineWidth = 5;
   //Middle long line
 	ctx.moveTo(0,(height/2)-1)
 	ctx.lineTo(width,(height/2)-1)
   //Left bar
  ctx.moveTo(2,halfheight/2)
  ctx.lineTo(2,(halfheight/2)+halfheight)
  //Right bar
  ctx.moveTo(width-4,halfheight/2)
  ctx.lineTo(width-4,(halfheight/2)+halfheight)
  //Middle bar
  ctx.moveTo(middle-2,halfheight/2)
  ctx.lineTo(middle-2,(halfheight/2)+halfheight)
  ctx.strokeStyle = "#4d4d4d";
	ctx.stroke();
}
