var mygetrequest;

function startStreaming ( onTickFunction )
{
  mygetrequest=new XMLHttpRequest();

  mygetrequest.onreadystatechange = function() {
      if (mygetrequest.readyState<3 || mygetrequest.status!=200 ) return;

      var lines = mygetrequest.responseText.split('\n')
      for (var i = 0; i < lines.length; i++)
      {
        if (lines[i].length > 0) {
          var data = JSON.parse(lines[i]);
          if (data.tick) {
            onTickFunction(data.tick);
          }
        }
      }
  };

  var req = "EUR_USD";
  if (allRates)
  {
     req = "";
     for(var i = 0; i < availablePairs.length; i++)
     {
       if ( req.length > 0 ) req += "%2C";
       var pair = availablePairs[i];
       var splitp = splitName( pair )
       req += splitp[0] + "_" + splitp[1];
     }
  }

  mygetrequest.open("GET", "https://stream-fxpractice.oanda.com/v1/prices?accountId=" + account + "&instruments=" + req, true);
  mygetrequest.setRequestHeader('Authorization', 'Bearer ' + token);
  mygetrequest.send(null);

}

function endStreaming ()
{
  mygetrequest.abort();
}
