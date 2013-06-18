var doPolling = false;
var pollingTimeout = 200;

function startPolling ( onTickFunction )
{
  doPolling = true;
  onePollingCycle( onTickFunction )
}

function onePollingCycle ( onTickFunction )
{
  var mygetrequest=new XMLHttpRequest();
  
  mygetrequest.onreadystatechange = function() {
      if (mygetrequest.readyState!=4 || mygetrequest.status!=200 ) return;        

      var data = JSON.parse(mygetrequest.responseText);
    
      onTickFunction(data);
  };
            
  var req = "EUR_USD";
  if (allRates)
  {
     req = "";
     for(var i = 0; i < availablePairs.length; i++)
     {
       if ( req.length > 0 ) req += ",";
       var pair = availablePairs[i];
       var splitp = splitName( pair )
       req += splitp[0] + "_" + splitp[1];
     }
  }
  
  mygetrequest.open("GET", "http://api-sandbox.oanda.com/v1/quote?instruments=" + req, true);
  mygetrequest.send(null);
                          
  if ( doPolling )  
  {
    setTimeout( function() { onePollingCycle(onTickFunction); }, pollingTimeout );
  }
}


function endPolling ()
{
  doPolling = false;
}
