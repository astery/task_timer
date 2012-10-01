function bindReady(handler){

  var called = false

  function ready() { // (1)
    if (called) return
    called = true
    handler()
  }

  if ( document.addEventListener ) { // (2)
    document.addEventListener( "DOMContentLoaded", function(){
      ready()
    }, false )
  } else if ( document.attachEvent ) {  // (3)

    // (3.1)
    if ( document.documentElement.doScroll && window == window.top ) {
      function tryScroll(){
        if (called) return
        if (!document.body) return
        try {
          document.documentElement.doScroll("left")
          ready()
        } catch(e) {
          setTimeout(tryScroll, 0)
        }
      }
      tryScroll()
    }

    // (3.2)
    document.attachEvent("onreadystatechange", function(){

      if ( document.readyState === "complete" ) {
        ready()
      }
    })
  }

  // (4)
    if (window.addEventListener)
        window.addEventListener('load', ready, false)
    else if (window.attachEvent)
        window.attachEvent('onload', ready)
    /*  else  // (4.1)
        window.onload=ready
  */
}

readyList = []

function onReady(handler) {

  if (!readyList.length) {
    bindReady(function() {
      for(var i=0; i<readyList.length; i++) {
        readyList[i]()
      }
    })
  }

  readyList.push(handler)
}

function addEvent(elem, evType, fn) {
  if (elem.addEventListener) {
    elem.addEventListener(evType, fn, false);
  }
  else if (elem.attachEvent) {
    elem.attachEvent('on' + evType, fn)
  }
  else {
    elem['on' + evType] = fn
  }
}

if(document.getElementsByClassName) {

  getElementsByClass = function(classList, node) {    
    return (node || document).getElementsByClassName(classList)
  }

} else {

  getElementsByClass = function(classList, node) {      
    var node = node || document,
    list = node.getElementsByTagName('*'), 
    length = list.length,  
    classArray = classList.split(/\s+/), 
    classes = classArray.length, 
    result = [], i,j
    for(i = 0; i < length; i++) {
      for(j = 0; j < classes; j++)  {
        if(list[i].className.search('\\b' + classArray[j] + '\\b') != -1) {
          result.push(list[i])
          break
        }
      }
    }
  
    return result
  }
}

 /*
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
  var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
    timezoneClip = /[^-+\dA-Z]/g,
    pad = function (val, len) {
      val = String(val);
      len = len || 2;
      while (val.length < len) val = "0" + val;
      return val;
    };

  // Regexes and supporting functions are cached through closure
  return function (date, mask, utc) {
    var dF = dateFormat;

    // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
    if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
      mask = date;
      date = undefined;
    }

    // Passing date through Date applies Date.parse, if necessary
    date = date ? new Date(date) : new Date;
    if (isNaN(date)) throw SyntaxError("invalid date");

    mask = String(dF.masks[mask] || mask || dF.masks["default"]);

    // Allow setting the utc argument via the mask
    if (mask.slice(0, 4) == "UTC:") {
      mask = mask.slice(4);
      utc = true;
    }

    var _ = utc ? "getUTC" : "get",
      d = date[_ + "Date"](),
      D = date[_ + "Day"](),
      m = date[_ + "Month"](),
      y = date[_ + "FullYear"](),
      H = date[_ + "Hours"](),
      M = date[_ + "Minutes"](),
      s = date[_ + "Seconds"](),
      L = date[_ + "Milliseconds"](),
      o = utc ? 0 : date.getTimezoneOffset(),
      flags = {
        d:    d,
        dd:   pad(d),
        ddd:  dF.i18n.dayNames[D],
        dddd: dF.i18n.dayNames[D + 7],
        m:    m + 1,
        mm:   pad(m + 1),
        mmm:  dF.i18n.monthNames[m],
        mmmm: dF.i18n.monthNames[m + 12],
        yy:   String(y).slice(2),
        yyyy: y,
        h:    H % 12 || 12,
        hh:   pad(H % 12 || 12),
        H:    H,
        HH:   pad(H),
        M:    M,
        MM:   pad(M),
        s:    s,
        ss:   pad(s),
        l:    pad(L, 3),
        L:    pad(L > 99 ? Math.round(L / 10) : L),
        t:    H < 12 ? "a"  : "p",
        tt:   H < 12 ? "am" : "pm",
        T:    H < 12 ? "A"  : "P",
        TT:   H < 12 ? "AM" : "PM",
        Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
        o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
        S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
      };

    return mask.replace(token, function ($0) {
      return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
    });
  };
}();

// Some common format strings
dateFormat.masks = {
  "default":      "ddd mmm dd yyyy HH:MM:ss",
  shortDate:      "m/d/yy",
  mediumDate:     "mmm d, yyyy",
  longDate:       "mmmm d, yyyy",
  fullDate:       "dddd, mmmm d, yyyy",
  shortTime:      "h:MM TT",
  mediumTime:     "h:MM:ss TT",
  longTime:       "h:MM:ss TT Z",
  isoDate:        "yyyy-mm-dd",
  isoTime:        "HH:MM:ss",
  isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
  isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
  dayNames: [
    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ],
  monthNames: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
  return dateFormat(this, mask, utc);
};

var diffDuration = function(diff){
   var vdaysdiff; // difference of the dates
   var vhourDiff;
   var vmindiff;
   var vsecdiff;

   vdaysdiff = Math.floor(diff/1000/60/60/24);  // in days
   diff -= vdaysdiff*1000*60*60*24;

   vhourDiff = Math.floor(diff/1000/60/60);  // in hours
   diff -= vhourDiff*1000*60*60;

   vmindiff = Math.floor(diff/1000/60); // in minutes
   diff -= vmindiff*1000*60;

   vsecdiff= Math.floor(diff/1000);  // in seconds

   //Text formatting
   var hourtext = '00';
   if (vhourDiff > 0){ hourtext = String(vhourDiff);}
   if (hourtext.length == 1){hourtext = '0' + hourtext};                                                              

   var mintext = '00';                           
   if (vmindiff > 0){ mintext = String(vmindiff);}
   if (mintext.length == 1){mintext = '0' + mintext};

   var sectext = '00';                           
   if (vsecdiff > 0){ sectext = String(vsecdiff);}
   if (sectext.length == 1){sectext = '0' + sectext};

   if (vdaysdiff > 0)
    duration = vdaysdiff + ' d ' + hourtext + ':' + mintext;
   else
    duration = hourtext + ':' + mintext + ':' + sectext;
   return duration;
}