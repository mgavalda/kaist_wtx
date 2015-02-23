(function () {

    function draw_globe( lat, long) {
        var planet = planetaryjs.planet();
        planet.projection.center( [0, 0]).rotate( [lat, long, 0]).scale( 200).translate( [200, 200]);
        var canvas = document.getElementById('globe');
        planet.draw(canvas);
    }
    
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
                //console.log("lat: " + lat + "; long: " + long);
                lat_long = {'lat':lat, 'long':long};
                draw_globe( lat, long);
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
                date_str = (new Date( local_time_s * 1000)).toString();
                console.log( 'Date string: ' + date_str);

                // Tue Feb 24 2015 07:04:29 GMT+0900 (KST)
                parts = date_str.split(' ');
                hour_str = parts[ 4].substring( 0, 2);
                min_str = parts[ 4].substring( 3, 5);
                hour_int = parseInt( hour_str,10);
                am_pm = 'AM';
                if( hour_int > 12) {
                    hour_str = (hour_int - 12).toString();
                    am_pm = 'PM';
                }
                msg = 'It is now ' + hour_str + ' ' + min_str + ' ' + am_pm;
                console.log( msg);
                speak( msg);


                return raw_offset_s;
            },
        });
    }

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
     
    $(document).ready( function() {
        recognition.start();
    
    });
   
}());
