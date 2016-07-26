// fix jquery vs chrome bug "event.layerX & event.layerY will be removed from WebKit soon"
var i;
if ( ~(i = $.inArray('layerX', $.event.props)) ) {
    $.event.props.splice(i, 2);
}

function initRaphael ( divTag )
{
    var _paper = Raphael( document.getElementById( divTag ), 750, 330 );

    // The Raphael SVG canvas.
    var _canvas = _paper.canvas;

    // The HTML element that contains the canvas.
    var _container = $(_canvas).parent();

    var _rectValues = _paper.rect(0, 0, 330, 285, 3).attr({
                    stroke: "none",
                    fill: "#FFFFFF"
                  });

    var squares = {};

    for ( var i = 0; i < currencies.length; i++)
    {
        _paper.text( 25, i*15 + 7, currencies[i] );

        for ( var p = 0; p < currencies.length; p++ )
        {
            //var fill = Raphael.rgb( p*200/currencies.length + 50, i*200/currencies.length + 50, 128 );
            var nextRect = _paper.rect( 50 + p*14, i*15, 14, 15, 1 ).attr({
                               stroke: "none",
                               fill:   "#CCCCCC"
                           });

            squares[ currencies[i]+"/"+currencies[p] ] = nextRect;
        }
    }

    return squares;
}

var squaresStream = {};
var squaresPoll   = {};

var oldValuesStream = {};
var oldValuesPoll   = {};

var oldTimeStream = 0;
var oldTimePoll = 0;

function onTickStream ( data )
{
  console.log("Stream tick:" + data.instrument + " " + data.bid);

  var pair  = data.instrument;
  var instr = pair.replace("_","/");

  var fill     = "#AAAAAA";
  var nextFill = "#999999";
  if ( oldValuesStream[data.instrument]  != undefined )
  {
    if ( data.bid > oldValuesStream[data.instrument] ) { fill = "#00FF00"; nextFill = "#00CC00"; }
    if ( data.bid < oldValuesStream[data.instrument] ) { fill = "#FF0000"; nextFill = "#CC0000"; }
  }
  oldValuesStream[instr] = data.bid;

  var rect = squaresStream[instr];
  rect.attr({ "fill": fill });

  if ( instr == "EUR/USD" )
  {
     oldTimeStream = data.timestamp*1000000 + data.timeusec;
  }

  setTimeout( function() { rect.attr({ "fill": nextFill }); }, 90 );
}

function onTickPoll ( data )
{
  for ( var i = 0; i < data.prices.length; i++)
  {
     var pair  = data.prices[i].instrument;
     var instr = pair.replace("_","/");
     var bid   = data.prices[i].bid;
     console.log("Poll tick:" + pair + " " + bid);

     var fill     = "#AAAAAA";
     var nextFill = "#999999";
     if ( oldValuesPoll[instr]  != undefined )
     {
       if ( bid > oldValuesPoll[instr] ) { fill = "#00FF00"; nextFill = "#00CC00"; }
       if ( bid < oldValuesPoll[instr] ) { fill = "#FF0000"; nextFill = "#CC0000"; }
     }
     oldValuesPoll[instr] = bid;

     if ( instr == "EUR/USD" )
     {
       oldTimePoll = data.prices[i].time * 1000000;
     }

     var rect = squaresPoll[instr];
     rect.attr({ "fill": fill });
     setTimeout( function() {
                   var _rect = rect;
                   var _fill = nextFill;
                   return function() {
                     _rect.attr({ "fill": _fill });
                   }
                 }(), 90 );
  }
}


function checkPollDelay ()
{
  str = "";
  if (oldTimePoll != oldTimeStream )
  {
     if ( oldTimeStream > oldTimePoll )
       str = "EUR/USD: Streamign newer by " + (oldTimeStream - oldTimePoll) + " usec";
     else
       str = "EUR/USD: polling is newer by " + (oldTimePoll - oldTimeStream) + " usec";
  }

  document.getElementById("comparision").innerHTML = str;

  //setTimeout( checkPollDelay , 15 );
}

function startUI ( checkboxPoll, checkboxStream, ratePick, pollRate ) {

   $(checkboxPoll).click(function() {
     if($(this).is(":checked")) { startPolling( onTickPoll ); } else { endPolling(); }
   });

   $(checkboxStream).click(function() {
     if($(this).is(":checked")) { startStreaming( onTickStream ); } else { endStreaming(); }
   });

   $(ratePick).change(function() {
      allRates = !allRates;
      if ( allRates ) console.log("getting all rates"); else console.log("getting EUR/USD only");

      if ( $(checkboxStream).is(":checked") )
      {
        endStreaming();
        startStreaming( onTickStream );
      }

   });

   $(pollRate).change(function() {
     var selected = $(pollRate + " input[type='radio']:checked");
     pollingTimeout = selected.val();
   });

   squaresStream = initRaphael( "streamAPI" );
   squaresPoll   = initRaphael( "restAPI" );

   //checkPollDelay();
}
