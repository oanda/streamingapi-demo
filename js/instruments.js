var currencies = [ "XAU", "XAG", "USD", "MXN", "CAD", "GBP", "EUR", "CHF", "SEK", "HUF", "TRY", "ZAR", "INR", "CNY", "HKD", "SGD", "JPY", "AUD", "NZD" ];

var availablePairs = [];

function splitName ( displayName )
{
   if (displayName.length != 7 ) return [];
  
   if (displayName.charAt(3) != '/') return [];

   return [ displayName.substr(0,3), displayName.substr(4,3) ];
}

function getInstruments( debug ) {
  
   var myinitrequest=new XMLHttpRequest();

   myinitrequest.onreadystatechange = function() {
   
      if (myinitrequest.readyState!=4 || myinitrequest.status!=200 ) return;

      var currencyData = JSON.parse(myinitrequest.responseText);
      
      //for ( var instrument in currencyData.instruments)
      //  if (currencyData.instruments.hasOwnProperty(instrument))

      for(var i = 0; i < currencyData.instruments.length; i++)
      {
          var pairName = currencyData.instruments[i].displayName;
            
          var pair = splitName(pairName);

          if ( pair.length != 2 ) continue;

          if ( currencies.indexOf(pair[0]) < 0 || currencies.indexOf(pair[1]) < 0 ) continue;

          availablePairs.push(pairName);
         
          if ( debug )
          {
              var listItem = document.createElement("li");
              listItem.innerHTML = pair[0] + "/" + pair[1];
              document.getElementById("initlist").appendChild(listItem);
          }
      }
   }

   myinitrequest.open("GET", "http://api-sandbox.oanda.com/v1/instruments", true);   
   myinitrequest.send(null);
}
