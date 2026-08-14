(function () {
  "use strict";

  var flightsDb = {
    "UA123": { airline: "United Airlines", from: "Chicago (ORD)", to: "Panama City (PTY)", dep: "08:15", delay: 10, reason: "Ground services / refueling issue" },
    "AA456": { airline: "American Airlines", from: "New York (JFK)", to: "Bogotá (BOG)", dep: "10:40", delay: 4, reason: "Crew / airline operations" },
    "DL789": { airline: "Delta Air Lines", from: "Atlanta (ATL)", to: "San José (SJO)", dep: "12:05", delay: 7, reason: "Weather conditions" },
    "BA222": { airline: "British Airways", from: "London (LHR)", to: "Lima (LIM)", dep: "15:30", delay: 12, reason: "Technical issue with the aircraft" },
    "LH334": { airline: "Lufthansa", from: "Frankfurt (FRA)", to: "Panama City (PTY)", dep: "09:50", delay: 3, reason: "Airport congestion" },
    "IB616": { airline: "Iberia", from: "Madrid (MAD)", to: "Panama City (PTY)", dep: "14:20", delay: 9, reason: "Refueling / ground services" }
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
    { name: "Marriott Courtyard Airport", dist: "1.2 km from terminal", price: "$89/night", rating: "4.6", am: "Free airport shuttle" },
    { name: "Holiday Inn Express", dist: "2.0 km from terminal", price: "$76/night", rating: "4.4", am: "Complimentary breakfast" },
    { name: "Hotel Suites La Guácima", dist: "3.5 km from terminal", price: "$64/night", rating: "4.2", am: "Pool & restaurant" }
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

  document.getElementById("plan-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var code = document.getElementById("flight-input").value.trim().toUpperCase();

    var flight = flightsDb[code] || {
      airline: "Copa Airlines",
      from: "Unknown airport",
      to: "Panama City (PTY)",
      dep: "13:00",
      delay: 8,
      reason: document.getElementById("cause-select").value
    };
    flight.code = code;

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
    document.getElementById("flight-input").value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function renderResult(flight, cause, needs) {
    var seed = hash(flight.airline + flight.from + cause);

    flightBanner.innerHTML =
      '<div><div class="flight-route">' + flight.from + ' <span class="arrow">✈</span> ' + flight.to + '</div>' +
      '<div class="flight-meta">' + flight.airline + ' · ' + flight.dep + ' scheduled departure</div></div>' +
      '<div class="flight-meta">Flight <strong>' + flight.code + '</strong></div>';

    delayCard.innerHTML =
      '<span class="delay-label">Delayed ' + flight.delay + 'h</span>' +
      '<span class="delay-text">' + cause + ' — your plan is ready below.</span>';

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

    if (needs.indexOf("overnight") !== -1) {
      html += sectionHeader("Stay overnight", "A hotel, a meal, and a ride — planned together.");
      html += '<h3 style="margin:.4rem 0 .6rem">Hotels</h3>';
      html += '<div class="cards">';
      hotels.forEach(function (h, i) {
        var rec = i === 0 ? " recommended" : "";
        html += '<div class="card' + rec + '">' +
          (i === 0 ? '<span class="tag rec">Recommended</span>' : '<span class="tag">Option</span>') +
          '<h3>' + h.name + '</h3>' +
          '<p class="row"><span>' + h.dist + '</span></p>' +
          '<p class="row">⭐ ' + h.rating + ' · ' + h.am + '</p>' +
          '<p class="row price">' + h.price + '</p></div>';
      });
      html += "</div>";

      html += '<h3 style="margin:1.4rem 0 .6rem">Places to eat</h3>';
      html += '<div class="cards">';
      restaurants.forEach(function (r, i) {
        html += '<div class="card">' +
          '<span class="tag">' + r.type + '</span>' +
          '<h3>' + r.name + '</h3>' +
          '<p class="row"><span>' + r.dist + '</span></p>' +
          '<p class="row price">' + r.price + '</p></div>';
      });
      html += "</div>";

      html += '<h3 style="margin:1.4rem 0 .6rem">Getting there</h3>';
      html += '<div class="cards">';
      transport.forEach(function (t) {
        html += '<div class="card">' +
          '<span class="tag">Transport</span>' +
          '<h3>' + t.name + '</h3>' +
          '<p class="row"><span>' + t.time + '</span></p>' +
          '<p class="row">' + t.note + '</p>' +
          '<p class="row price">' + t.price + '</p></div>';
      });
      html += "</div>";
    }

    if (needs.indexOf("transport") !== -1) {
      html += sectionHeader("City transport", "Move around the city easily.");
      html += '<div class="cards">';
      transport.forEach(function (t) {
        html += '<div class="card">' +
          '<span class="tag">Transport</span>' +
          '<h3>' + t.name + '</h3>' +
          '<p class="row"><span>' + t.time + '</span></p>' +
          '<p class="row">' + t.note + '</p>' +
          '<p class="row price">' + t.price + '</p></div>';
      });
      html += "</div>";
    }

    if (needs.indexOf("fun") !== -1) {
      html += sectionHeader("Local attractions", "Make this stop a mini-vacation while you wait.");
      html += '<div class="cards">';
      attractions.forEach(function (a) {
        html += '<div class="card">' +
          '<span class="tag">' + a.type + '</span>' +
          '<h3>' + a.name + '</h3>' +
          '<p class="row">⏱ ' + a.time + '</p>' +
          '<p class="row price">' + a.price + '</p></div>';
      });
      html += "</div>";
    }

    planSections.innerHTML = html;
  }

  function sectionHeader(title, note) {
    return '<div class="plan-section"><h2><span class="dot"></span>' + title + '</h2>' +
      '<p class="plan-note">' + note + '</p>';
  }
})();
