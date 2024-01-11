// set map options
var mapOptions = {
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};

// create map
var map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

// create a DirectionsService object to use the route method and get a result for our request
var directionsService = new google.maps.DirectionsService();

// create a DirectionsRenderer object which we will use to display the route
var directionsDisplay = new google.maps.DirectionsRenderer();

// bind the DirectionsRenderer to the map
directionsDisplay.setMap(map);

// define calcRoute function
function calcRoute() {
    // create request
    var request = {
        origin: document.getElementById("from").value,
        destination: document.getElementById("to").value,
        travelMode: google.maps.TravelMode.DRIVING, // WALKING, BYCYCLING, TRANSIT
        unitSystem: google.maps.UnitSystem.METRIC // Change unit system to METRIC for kilometers
    };

    // pass the request to the route method
    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            // Get distance and time
            const distanceInMeters = result.routes[0].legs[0].distance.value;
            const distanceInKilometers = distanceInMeters / 1000;

            const output = document.querySelector('#output');

            // Calculate transport cost
            const costPerKilometer = 400; // Set the cost per kilometer in Rwandan Francs
            const first2KmCost = 400; // Cost for the first 2 kilometers
            let transportCost;

            if (distanceInKilometers <= 2) {
                transportCost = first2KmCost;
            } else {
                transportCost = first2KmCost + (distanceInKilometers - 2) * costPerKilometer;
            }

            output.innerHTML = "<div class='alert-info'>From: " + document.getElementById("from").value + ".<br />To: " + document.getElementById("to").value + ".<br /> Driving distance <i class='fas fa-road'></i> : " + result.routes[0].legs[0].distance.text + " (" + distanceInKilometers.toFixed(2) + " km).<br />Duration <i class='fas fa-hourglass-start'></i> : " + result.routes[0].legs[0].duration.text + ".<br />Transport cost: " + transportCost.toFixed(2) + " RWF.</div>";

            // display route
            directionsDisplay.setDirections(result);
        } else {
            // delete route from map
            directionsDisplay.setDirections({ routes: [] });

            // show error message
            output.innerHTML = "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Could not retrieve driving distance. Please enable location services and try again.</div>";

            // Prompt user to try again
            if (confirm("Location access is required. Do you want to enable location services and try again?")) {
                centerMapAtUserLocation();
            }
        }
    });
}

// center the map at the user's location
function centerMapAtUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var userLatLng = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            map.setCenter(userLatLng);

            // Optionally, you can add a marker at the user's location
            var userMarker = new google.maps.Marker({
                position: userLatLng,
                map: map,
                title: 'Your Location'
            });
        }, function () {
            handleLocationError(true, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, map.getCenter());
    }
}

// handle location errors
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    // Default location (you can change this to a specific location)
    var defaultLatLng = { lat: -1.9403, lng: 29.8739 };

    map.setCenter(defaultLatLng);

    // Display an error message
    output.innerHTML = browserHasGeolocation ?
        "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i>Error: Please enable location services and try again.</div>" :
        "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Error: Your browser doesn't support geolocation.</div>";

    // Prompt user to try again
    if (confirm("Location access is required. Please enable location and try again!")) {
        centerMapAtUserLocation();
    }
}

// create autocomplete objects for all inputs.
var options = {
    types: ['(cities)']
};

var input1 = document.getElementById("from");
var autocomplete1 = new google.maps.places.Autocomplete(input1, options);

var input2 = document.getElementById("to");
var autocomplete2 = new google.maps.places.Autocomplete(input2, options);

// Center the map at the user's location when the page loads
centerMapAtUserLocation();
