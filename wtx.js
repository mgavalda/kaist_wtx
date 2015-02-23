function speak( text) {
    var msg = new SpeechSynthesisUtterance();
    msg.text = text;
    msg.lang = 'en-US';
    speechSynthesis.speak( msg);
}

function process_utterance( transcript) {
    // extract what comes after 'in'
    var place_arr = /in (.+)/.exec(transcript);
    if( place_arr === null) {
        console.log( 'Could not extract location');
        return;
    }
    var place = place_arr[ 1];
    console.log( 'New place: '+ place);
    get_latlong( place);    
}

function get_latlong( place) {
    new_place = place.replace(" ","+");
    url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + new_place
    $.ajax({
        url: url,
        error: function() {
            $('#log').html('<p>An error has occurred</p>');
        },
        dataType: 'json',
        success: function(data) {
            results = data['results'];            
            firstpiece = results[0];            
            geometry = firstpiece['geometry'];            
            latlong = geometry['location'];              
            lat = latlong['lat'];
            long = latlong['lng'];
            console.log(latlong);
            console.log("lat: " + lat + "; long: " + long);
            lat_long = {'lat':lat, 'long':long};
            raw_offset_s = get_timezone( lat_long);
            return lat_long;
        },
    });
}

function get_timezone( lat_long) {
    var lat = lat_long[ 'lat'];
    var long = lat_long[ 'long'];
    url = "https://maps.googleapis.com/maps/api/timezone/json?location=" + lat + ',' + long + '&timestamp=1331161200';
    $.ajax({
        url: url,
        error: function() {
            $('#log').html('<p>An error has occurred</p>');
        },
        dataType: 'json',
        success: function(data) {
            //results = data['results'];
            raw_offset_s = data[ 'rawOffset'];
            console.log( raw_offset_s);
            //raw_offset_h = raw_offset_s / 3600;
            console.log( 'raw offset (s)' + raw_offset_s);
            
            x = new Date()
            utc_now_s = (x.getTime() + x.getTimezoneOffset()*60*1000)/1000;
            
            console.log( 'UTC now:' + utc_now_s);
            local_time_s = utc_now_s + raw_offset_s;
            console.log( 'Local time (s)' + local_time_s);
            date_str = new Date( local_time_s * 1000);
            console.log( 'Date string:' + date_str);
            
            speak( 'It is now ' + date_str);
            
            
            return raw_offset_s;
        },
    });
}


//var lat_long = get_latlong( 'Barcelona');
//console.log( lat_long);

//var raw_offset = get_timezone( lat_long);
//console.log( raw_offset);


var recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';
//recognition.lang = 'ko-KR';

recognition.onerror = function(event) {
    console.log( 'Recognition error: ' + event.error);    
}
recognition.onstart = function() { 
    console.log( 'Recognition started');    
}
recognition.onspeechstart = function() { 
    console.log( 'Speech started');    
}

recognition.onresult = function (event) {
    for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            var transcript = event.results[i][0].transcript;
            $('#transcript').append( '<br/>' + transcript);
            process_utterance( transcript);
        }
    }
};

recognition.start();
//recognition.stop();