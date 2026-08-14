(function () {
  "use strict";

  var flightsDb = {
    "UA123": { airline: "United Airlines", from: "Chicago (ORD)", to: "Panama City (PTY)", fromPoint: [41.98, -87.90], toPoint: [9.07, -79.38], dep: "08:15", delay: 10, reason: "Ground services / refueling issue" },
    "AA456": { airline: "American Airlines", from: "New York (JFK)", to: "Bogotá (BOG)", fromPoint: [40.64, -73.78], toPoint: [4.70, -74.15], dep: "10:40", delay: 4, reason: "Crew / airline operations" },
    "DL789": { airline: "Delta Air Lines", from: "Atlanta (ATL)", to: "San José (SJO)", fromPoint: [33.64, -84.43], toPoint: [9.99, -84.21], dep: "12:05", delay: 7, reason: "Weather conditions" },
    "BA222": { airline: "British Airways", from: "London (LHR)", to: "Lima (LIM)", fromPoint: [51.47, -0.45], toPoint: [-12.02, -77.11], dep: "15:30", delay: 12, reason: "Technical issue with the aircraft" },
    "LH334": { airline: "Lufthansa", from: "Frankfurt (FRA)", to: "Panama City (PTY)", fromPoint: [50.04, 8.56], toPoint: [9.07, -79.38], dep: "09:50", delay: 3, reason: "Airport congestion" },
    "IB616": { airline: "Iberia", from: "Madrid (MAD)", to: "Panama City (PTY)", fromPoint: [40.49, -3.57], toPoint: [9.07, -79.38], dep: "14:20", delay: 9, reason: "Refueling / ground services" }
  };

  var nextFlights = {
    "Chicago (ORD)": [
      { time: "10:30", airline: "United Airlines", status: "On time", note: "Direct" },
      { time: "12:45", airline: "American Airlines", status: "On time", note: "1 stop" },
      { time: "16:20", airline: "Avianca", status: "On time", note: "1 stop" }
    ],
    "New York (JFK)": [
      { time: "12:10", airline: "American Airlines", status: "On time", note: "Direct" },
      { time: "15:35", airline: "Copa Airlines", status: "On time", note: "1 stop" }
    ],
    "Atlanta (ATL)": [
      { time: "14:00", airline: "Delta Air Lines", status: "On time", note: "Direct" },
      { time: "17:25", airline: "Avianca", status: "On time", note: "1 stop" }
    ],
    "London (LHR)": [
      { time: "19:15", airline: "British Airways", status: "On time", note: "Direct" },
      { time: "21:05", airline: "Iberia", status: "On time", note: "1 stop" }
    ],
    "Frankfurt (FRA)": [
      { time: "11:40", airline: "Lufthansa", status: "On time", note: "Direct" },
      { time: "15:10", airline: "Air Europa", status: "On time", note: "1 stop" }
    ],
    "Madrid (MAD)": [
      { time: "17:00", airline: "Iberia", status: "On time", note: "Direct" },
      { time: "19:40", airline: "Air Europa", status: "On time", note: "1 stop" }
    ]
  };

  var defaultNext = [
    { time: "13:15", airline: "Air Europa", status: "On time", note: "Direct" },
    { time: "17:40", airline: "Iberia", status: "On time", note: "1 stop" }
  ];

  var hotels = [
    { name: "Marriott Courtyard Airport", dist: "1.2 km from terminal", price: "$89/night", rating: "4.6", am: "Free airport shuttle", review: "Very clean, quiet rooms and a fast shuttle.", author: "Maya R." },
    { name: "Holiday Inn Express", dist: "2.0 km from terminal", price: "$76/night", rating: "4.4", am: "Complimentary breakfast", review: "Helpful staff and an easy overnight stay.", author: "Daniel K." },
    { name: "Hotel Suites La Guácima", dist: "3.5 km from terminal", price: "$64/night", rating: "4.2", am: "Pool & restaurant", review: "Good value and a comfortable bed after a delay.", author: "Sofia L." }
  ];

  var restaurants = [
    { name: "Café del Aire", dist: "In terminal, Gate C", price: "$12–18", type: "Local cuisine" },
    { name: "Sabor Típico", dist: "1.0 km via shuttle", price: "$10–15", type: "Traditional dishes" },
    { name: "La Parada 24/7", dist: "0.8 km via shuttle", price: "$8–14", type: "Open all night" }
  ];

  var transport = [
    { name: "Official Airport Taxi", time: "5 min wait", price: "$15 flat to city", note: "Safe & regulated" },
    { name: "Hotel Shuttle", time: "Free with hotel", price: "$0", note: "From your hotel" },
    { name: "Uber / Cabify", time: "8 min pickup", price: "$10–20", note: "Door to door" }
  ];

  var attractions = [
    { name: "Museo de Arte Contemporáneo", time: "3–4 hours", price: "$8", type: "Museum" },
    { name: "Parque La Sabana", time: "2–3 hours", price: "Free", type: "Park" },
    { name: "Mercado Central", time: "2 hours", price: "Free", type: "Local market" },
    { name: "Teatro Nacional", time: "1.5 hours", price: "$12", type: "Historic tour" }
  ];

  var refundGuide = {
    "Weather conditions": { chance: "Likely — usually travel insurance covers it", note: "Airlines rarely pay cash compensation for weather, but most will rebook free." },
    "Technical issue with the aircraft": { chance: "High — you may be entitled to compensation", note: "Most jurisdictions require airlines to provide meals, hotel, and rebooking. Cash compensation may apply." },
    "Crew / airline operations": { chance: "High — you may be entitled to compensation", note: "This is the airline's responsibility. You are typically owed care (meals/hotel) and possibly compensation." },
    "Airport congestion": { chance: "Medium — depends on airline policy", note: "You are generally entitled to care like meals and rebooking, but cash compensation is less common." },
    "Refueling / ground services": { chance: "Medium — check with your airline", note: "Usually treated as an airline-side issue. Ask for meals and hotel, and request rebooking at no cost." }
  };

  var hash = function (str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) % 1000;
    }
    return h;
  };

  var pick = function (arr, seed, offset) {
    return arr[(seed + offset) % arr.length];
  };

  var flightBanner = document.getElementById("flight-banner");
  var delayCard = document.getElementById("delay-card");
  var planSections = document.getElementById("plan-sections");
  var originSelect = document.getElementById("origin-country");
  var destinationSelect = document.getElementById("destination-country");
  var stuckSelect = document.getElementById("stuck-country");
  var featuredSelect = document.getElementById("featured-route");
  var featuredList = document.getElementById("featured-route-list");
  var flightInput = document.getElementById("flight-input");
  var routeMap;
  var routeLayer;
  var realPlacesCache = {};

  populateWorldwideRoutes();

  document.getElementById("plan-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var code = flightInput.value.trim().toUpperCase();
    var flight = buildWorldwideFlight(originSelect.value, destinationSelect.value);
    if (!flight) {
      alert("Choose two different countries to generate your flight.");
      return;
    }
    flight.code = code;
    flight.stuckCountry = findCountry(stuckSelect.value) || null;
    if (flight.stuckCountry && flight.stuckCountry.code === flight.destinationCountry.code) flight.stuckCountry = null;

    var cause = document.getElementById("cause-select").value;
    var needs = [];
    document.querySelectorAll('input[name="need"]:checked').forEach(function (cb) {
      needs.push(cb.value);
    });

    if (needs.length === 0) {
      alert("Select at least one need to generate your plan.");
      return;
    }

    renderResult(flight, cause, needs);
    document.getElementById("screen-input").classList.add("hidden");
    document.getElementById("screen-result").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("reset-btn").addEventListener("click", function () {
    document.getElementById("screen-result").classList.add("hidden");
    document.getElementById("screen-input").classList.remove("hidden");
    flightInput.value = "";
    originSelect.value = "";
    destinationSelect.value = "";
    stuckSelect.value = "";
    featuredSelect.value = "";
    setFeaturedListDisabled(false);
    featuredList.querySelectorAll(".flight-pick.selected").forEach(function (item) {
      item.classList.remove("selected");
      item.setAttribute("aria-selected", "false");
    });
    originSelect.disabled = false;
    destinationSelect.disabled = false;
    stuckSelect.disabled = false;
    featuredSelect.disabled = false;
    document.querySelector('#plan-form button[type="submit"]').textContent = "Generate my plan";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("edit-needs-btn").addEventListener("click", function () {
    document.getElementById("screen-result").classList.add("hidden");
    document.getElementById("screen-input").classList.remove("hidden");
    originSelect.disabled = true;
    destinationSelect.disabled = true;
    stuckSelect.disabled = true;
    featuredSelect.disabled = true;
    setFeaturedListDisabled(true);
    document.querySelector('#plan-form button[type="submit"]').textContent = "Update my plan";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function populateWorldwideRoutes() {
    if (!window.COUNTRIES || !window.FEATURED_FLIGHTS) return;
    window.COUNTRIES.forEach(function (country) {
      var label = country.name + " — " + country.capital;
      originSelect.add(new Option(label, country.code));
      destinationSelect.add(new Option(label, country.code));
      stuckSelect.add(new Option(country.name + " — " + country.capital, country.code));
    });
    window.FEATURED_FLIGHTS.forEach(function (route, index) {
      var from = findCountry(route.from);
      var to = findCountry(route.to);
      featuredSelect.add(new Option((index + 1) + ". " + from.name + " → " + to.name, route.from + ":" + route.to));
      var item = document.createElement("button");
      item.type = "button";
      item.className = "flight-pick";
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", "false");
      item.innerHTML = '<span class="flight-flags">' + countryFlag(from.code) + ' <b>→</b> ' + countryFlag(to.code) + '</span>' +
        '<span class="flight-pick-route"><strong>' + from.name + '</strong><small>to</small><strong>' + to.name + '</strong></span>' +
        '<span class="flight-pick-code">' + generatedCode(from, to) + '</span>';
      item.addEventListener("click", function () {
        featuredList.querySelectorAll(".flight-pick.selected").forEach(function (selected) {
          selected.classList.remove("selected");
          selected.setAttribute("aria-selected", "false");
        });
        item.classList.add("selected");
        item.setAttribute("aria-selected", "true");
        featuredSelect.value = route.from + ":" + route.to;
        originSelect.value = route.from;
        destinationSelect.value = route.to;
        updateGeneratedFlightNumber();
      });
      featuredList.appendChild(item);
    });
    originSelect.value = "US";
    destinationSelect.value = "PA";
    updateGeneratedFlightNumber();
    originSelect.addEventListener("change", updateGeneratedFlightNumber);
    destinationSelect.addEventListener("change", updateGeneratedFlightNumber);
    featuredSelect.addEventListener("change", function () {
      if (!this.value) return;
      var pair = this.value.split(":");
      originSelect.value = pair[0];
      destinationSelect.value = pair[1];
      updateGeneratedFlightNumber();
    });
  }

  function countryFlag(code) {
    if (!code || code.length !== 2) return '<span aria-hidden="true">🌐</span>';
    var lower = code.toLowerCase();
    return '<img class="country-flag" src="https://flagcdn.com/24x18/' + lower + '.png" srcset="https://flagcdn.com/48x36/' + lower + '.png 2x" width="24" height="18" loading="lazy" alt="' + code.toUpperCase() + ' flag">';
  }

  function setFeaturedListDisabled(disabled) {
    featuredList.classList.toggle("disabled", disabled);
    featuredList.querySelectorAll("button").forEach(function (button) { button.disabled = disabled; });
  }

  function findCountry(code) {
    return window.COUNTRIES.find(function (country) { return country.code === code; });
  }

  function updateGeneratedFlightNumber() {
    var from = findCountry(originSelect.value);
    var to = findCountry(destinationSelect.value);
    if (!from || !to || from.code === to.code) {
      flightInput.value = "";
      return;
    }
    flightInput.value = generatedCode(from, to);
  }

  function generatedCode(from, to) {
    var prefixes = { Africa: "AT", Americas: "PA", Asia: "SK", Europe: "EU", Oceania: "OC", Antarctic: "AN" };
    var prefix = prefixes[from.region] || "FT";
    var number = 100 + (hash(from.code + to.code) % 900);
    return prefix + number;
  }

  function buildWorldwideFlight(fromCode, toCode) {
    var from = findCountry(fromCode);
    var to = findCountry(toCode);
    if (!from || !to || from.code === to.code) return null;
    var airlines = { Africa: "Africa Connect", Americas: "Pan-American Airways", Asia: "Sky Asia", Europe: "Euro Wings", Oceania: "Pacific Connect", Antarctic: "Global Air" };
    var code = generatedCode(from, to);
    flightInput.value = code;
    return {
      airline: airlines[from.region] || "FunTheDelay Air",
      from: from.capital + " (" + from.airport + ")",
      to: to.capital + " (" + to.airport + ")",
      fromPoint: [from.lat, from.lon],
      toPoint: [to.lat, to.lon],
      dep: (8 + hash(from.code) % 12).toString().padStart(2, "0") + ":" + (hash(to.code) % 4 * 15).toString().padStart(2, "0"),
      delay: 2 + hash(from.code + to.code) % 11,
      reason: document.getElementById("cause-select").value,
      destinationCountry: to,
      code: code
    };
  }

  function renderResult(flight, cause, needs) {
    var seed = hash(flight.airline + flight.from + cause);

    flightBanner.innerHTML =
      '<div><div class="flight-route">' + flight.from + ' <span class="arrow">✈</span> ' + flight.to + '</div>' +
      '<div class="flight-meta">' + flight.airline + ' · ' + flight.dep + ' scheduled departure</div></div>' +
      '<div class="flight-meta">Flight <strong>' + flight.code + '</strong></div>';

    delayCard.innerHTML =
      '<span class="delay-label">Delayed ' + flight.delay + 'h</span>' +
      '<span class="delay-text">' + cause + ' — your plan is ready below.</span>';

    renderRouteMap(flight);

    var html = "";

    if (needs.indexOf("rebooking") !== -1) {
      var options = nextFlights[flight.from] || defaultNext;
      html += sectionHeader("Rebooking", "Your best next flights, in priority order.");
      html += '<div class="cards" style="display:block">';
      options.forEach(function (o, i) {
        var rec = i === 0 ? " recommended" : "";
        html += '<div class="flight-option' + rec + '">' +
          '<div><div class="time">' + o.time + '</div>' +
          '<div class="airline">' + o.airline + ' · ' + o.note + '</div></div>' +
          '<span class="status">' + o.status + '</span>' +
          (i === 0 ? '<span class="tag rec" style="margin-left:auto">Recommended</span>' : '') +
          '</div>';
      });
      html += "</div>";
    }

    if (needs.indexOf("refund") !== -1) {
      var guide = refundGuide[cause] || refundGuide["Technical issue with the aircraft"];
      html += sectionHeader("Refund & compensation", "What to do and what to expect.");
      html += '<div class="cards"><div class="card recommended">' +
        '<span class="tag rec">Our estimate</span>' +
        '<h3>Refund possibility</h3>' +
        '<p class="row"><span>' + guide.chance + '</span></p>' +
        '<p class="row">' + guide.note + '</p></div>' +
        '<div class="card"><span class="tag">Where to go</span><h3>Request your refund</h3>' +
        '<ul class="steps-list">' +
        '<li><span class="step-num">1</span><div>Open your airline app or website and find "Manage my booking".</div></li>' +
        '<li><span class="step-num">2</span><div>Select the delayed flight and choose "Request refund / compensation".</div></li>' +
        '<li><span class="step-num">3</span><div>Attach your boarding pass and any hotel or meal receipts for care.</div></li>' +
        '</ul></div></div>';
    }

    if (needs.indexOf("overnight") !== -1 || needs.indexOf("transport") !== -1 || needs.indexOf("fun") !== -1) {
      var firstPlaceCountry = flight.stuckCountry || flight.destinationCountry;
      html += sectionHeader("Real places near " + firstPlaceCountry.capital, flight.stuckCountry ? "Useful recommendations for the country where you are currently stuck." : "Live destination recommendations from OpenStreetMap.");
      html += '<div id="real-places" class="real-places-loading"><span class="loading-ring"></span><p>Finding real hotels, food, attractions and transport…</p></div>';
      if (flight.stuckCountry) {
        html += '<div id="destination-places-action" class="destination-places-action"><p>Planning ahead?</p><button type="button" id="destination-places-btn" class="btn btn-outline">Show places for when you get to ' + safeText(flight.destinationCountry.name) + '</button></div>';
      }
    }

    planSections.innerHTML = html;
    if (document.getElementById("real-places")) {
      loadRealPlaces(flight.stuckCountry || flight.destinationCountry, needs);
      var destinationPlacesButton = document.getElementById("destination-places-btn");
      if (destinationPlacesButton) destinationPlacesButton.addEventListener("click", function () {
        var heading = Array.from(planSections.querySelectorAll(".plan-section > h2")).find(function (title) { return title.textContent.indexOf("Real places near ") !== -1; });
        if (heading) heading.innerHTML = '<span class="dot"></span>Real places near ' + safeText(flight.destinationCountry.capital);
        if (heading && heading.nextElementSibling) heading.nextElementSibling.textContent = "Live destination recommendations from OpenStreetMap.";
        document.getElementById("destination-places-action").classList.add("hidden");
        loadRealPlaces(flight.destinationCountry, needs);
      });
    }
  }

  async function loadRealPlaces(country, needs) {
    var target = document.getElementById("real-places");
    if (!target || !country) return;
    target.className = "real-places-loading";
    target.innerHTML = '<span class="loading-ring"></span><p>Finding real hotels, food, attractions and transport…</p>';
    try {
      var places = realPlacesCache[country.code];
      if (!places && window.CACHED_REAL_PLACES && window.CACHED_REAL_PLACES[country.code]) {
        places = categorizePlaces(window.CACHED_REAL_PLACES[country.code].map(function (tags) { return { tags: tags }; }));
        realPlacesCache[country.code] = places;
      }
      if (!places) {
        var lat = Number(country.lat).toFixed(5);
        var lon = Number(country.lon).toFixed(5);
        var data = await fetchPlaceCategories(lat, lon, needs);
        places = categorizePlaces(data.elements || []);
        realPlacesCache[country.code] = places;
      }
      target.className = "real-places-results";
      target.innerHTML = renderRealPlaces(places, needs, country);
    } catch (error) {
      target.className = "real-places-error";
      target.innerHTML = '<p><strong>Live places are temporarily unavailable.</strong><br>Please retry shortly. We do not substitute made-up recommendations.</p>';
    }
  }

  async function fetchPlaceCategories(lat, lon, needs) {
    var specs = [];
    if (needs.indexOf("overnight") !== -1) {
      specs.push({ endpoints: ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"], query: 'node["name"]["tourism"~"hotel|hostel|guest_house"](around:5000,' + lat + ',' + lon + ');out tags 4;' });
      specs.push({ endpoints: ["https://overpass.private.coffee/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter"], query: 'node["name"]["amenity"~"restaurant|cafe|fast_food"](around:2000,' + lat + ',' + lon + ');out tags 4;' });
    }
    if (needs.indexOf("transport") !== -1 || needs.indexOf("overnight") !== -1) {
      specs.push({ endpoints: ["https://overpass.kumi.systems/api/interpreter", "https://overpass-api.de/api/interpreter"], query: 'node["name"]["amenity"~"taxi|bus_station|ferry_terminal"](around:4000,' + lat + ',' + lon + ');out tags 4;' });
    }
    if (needs.indexOf("fun") !== -1) {
      specs.push({ endpoints: ["https://maps.mail.ru/osm/tools/overpass/api/interpreter", "https://overpass.private.coffee/api/interpreter"], query: 'node["name"]["tourism"~"attraction|museum|gallery|viewpoint"](around:4000,' + lat + ',' + lon + ');out tags 4;' });
    }
    var results = await Promise.allSettled(specs.map(function (spec) {
      return fetchPlaceCategoryWithFallback(spec.endpoints, "[out:json][timeout:8];" + spec.query);
    }));
    var elements = [];
    results.forEach(function (result) {
      if (result.status === "fulfilled") elements = elements.concat(result.value.elements || []);
    });
    if (!elements.length) throw new Error("No place server responded");
    return { elements: elements };
  }

  async function fetchPlaceCategoryWithFallback(endpoints, query) {
    var lastError;
    for (var index = 0; index < endpoints.length; index++) {
      try {
        return await fetchOnePlaceCategory(endpoints[index], query);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("No category server responded");
  }

  async function fetchOnePlaceCategory(endpoint, query) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 9000);
    try {
      var response = await fetch(endpoint + "?data=" + encodeURIComponent(query), { signal: controller.signal });
      if (!response.ok) throw new Error("Place server returned " + response.status);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function categorizePlaces(elements) {
    var groups = { hotels: [], food: [], attractions: [], transport: [] };
    var seen = {};
    elements.forEach(function (element) {
      var tags = element.tags || {};
      var name = tags.name;
      if (!name || seen[name.toLowerCase()]) return;
      var group;
      if (/hotel|hostel|guest_house/.test(tags.tourism || "")) group = "hotels";
      else if (/restaurant|cafe|fast_food/.test(tags.amenity || "")) group = "food";
      else if (/attraction|museum|gallery|viewpoint/.test(tags.tourism || "")) group = "attractions";
      else group = "transport";
      if (groups[group].length >= 4) return;
      seen[name.toLowerCase()] = true;
      groups[group].push({ name: name, type: readablePlaceType(tags), address: placeAddress(tags) });
    });
    return groups;
  }

  function readablePlaceType(tags) {
    var value = tags.tourism || tags.amenity || tags.public_transport || "place";
    return value.replace(/_/g, " ").replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
  }

  function placeAddress(tags) {
    return [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean).join(" ") || "Near the destination capital";
  }

  function renderRealPlaces(places, needs, country) {
    var html = "";
    if (needs.indexOf("overnight") !== -1) {
      html += realPlaceGroup("Hotels", places.hotels, "Stay");
      html += realPlaceGroup("Places to eat", places.food, "Food");
      html += realPlaceGroup("Getting there", places.transport, "Transport");
    } else if (needs.indexOf("transport") !== -1) {
      html += realPlaceGroup("Local transport", places.transport, "Transport");
    }
    if (needs.indexOf("fun") !== -1) html += realPlaceGroup("Local attractions", places.attractions, "Explore");
    html += '<p class="places-source">Real place names around ' + safeText(country.capital) + ', sourced live from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>. Availability and opening hours should be verified.</p>';
    return html;
  }

  function realPlaceGroup(title, places, tag) {
    if (!places.length) return '<div class="real-place-group"><h3>' + safeText(title) + '</h3><p class="plan-note">No named places were found in this category.</p></div>';
    return '<div class="real-place-group"><h3>' + safeText(title) + '</h3><div class="cards">' + places.map(function (place) {
      var review = demoPlaceReview(place, tag);
      return '<article class="card real-place-card"><span class="tag">' + safeText(tag) + '</span><h3>' + safeText(place.name) + '</h3><p class="row"><strong>' + safeText(place.type) + '</strong></p><p class="row">' + safeText(place.address) + '</p>' +
        '<div class="place-review"><div class="place-review-score" aria-label="Demo rating ' + review.rating + ' out of 5"><span aria-hidden="true">★★★★★</span><strong>' + review.rating + '</strong></div><p>“' + safeText(review.text) + '”</p><small>Demo traveler review</small></div></article>';
    }).join("") + '</div></div>';
  }

  function demoPlaceReview(place, tag) {
    var reviews = {
      Stay: ["A convenient option for a comfortable overnight stop.", "Guests would appreciate the location and easy check-in.", "A practical place to rest and reset during a delay."],
      Food: ["A welcoming local stop for a relaxed meal.", "A handy choice for tasting something from the area.", "Good for a quick bite before continuing the journey."],
      Transport: ["A useful connection for getting around the city.", "Convenient for continuing the trip from the airport area.", "A practical local transport option for travelers."],
      Explore: ["A memorable way to experience the destination.", "Worth adding to the plan for a taste of local culture.", "A pleasant stop when there is time to explore."]
    };
    var score = 0;
    String(place.name).split("").forEach(function (character) { score += character.charCodeAt(0); });
    return { rating: (4.2 + (score % 7) / 10).toFixed(1), text: (reviews[tag] || reviews.Explore)[score % 3] };
  }

  function safeText(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]; });
  }

  function renderRouteMap(flight) {
    if (!window.L) return;
    if (!routeMap) {
      routeMap = L.map("route-map", { scrollWheelZoom: false, minZoom: 2, attributionControl: false });
      L.imageOverlay("world-map.jpg", [[-85.0511, -180], [85.0511, 180]]).addTo(routeMap);
    }
    if (routeLayer) routeLayer.remove();
    routeLayer = L.layerGroup().addTo(routeMap);
    var from = flight.fromPoint;
    var to = flight.toPoint;
    var middle = [(from[0] + to[0]) / 2 + 8, (from[1] + to[1]) / 2];
    L.circleMarker(from, { radius: 7, color: "#0b1f4b", fillColor: "#fff", fillOpacity: 1, weight: 3 }).bindTooltip(flight.from).addTo(routeLayer);
    L.circleMarker(to, { radius: 7, color: "#e63946", fillColor: "#fff", fillOpacity: 1, weight: 3 }).bindTooltip(flight.to).addTo(routeLayer);
    L.polyline([from, middle, to], { color: "#fff", weight: 8, opacity: 0.9 }).addTo(routeLayer);
    L.polyline([from, middle, to], { color: "#e63946", weight: 4, dashArray: "10 9" }).addTo(routeLayer);
    routeMap.fitBounds(L.latLngBounds([from, to]).pad(0.45), { maxZoom: 4 });
    document.getElementById("route-distance").textContent = "Approx. " + Math.round(mapDistance(from, to)).toLocaleString() + " km";
    document.getElementById("route-cities").innerHTML = '<strong>' + flight.from + '</strong><span>→</span><strong>' + flight.to + '</strong>';
    setTimeout(function () { routeMap.invalidateSize(); }, 50);
  }

  function mapDistance(a, b) {
    var rad = Math.PI / 180;
    var dLat = (b[0] - a[0]) * rad;
    var dLon = (b[1] - a[1]) * rad;
    var value = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  }

  function sectionHeader(title, note) {
    return '<div class="plan-section"><h2><span class="dot"></span>' + title + '</h2>' +
      '<p class="plan-note">' + note + '</p>';
  }
})();
