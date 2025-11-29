/*** CHEQ Traffic Quality Dashboard ***/

// Configuration
const CONFIG = {
    // CSV data source
    DATA_URL: 'https://cheq.free.nf/sample-traffic-data.csv',
    //DATA_URL: 'assets/sample-traffic-data.csv',
};

// State
let trafficData;
let filteredData = [];
let countryChart = null;
let deviceChart = null;

const botUserAgents = [
    "curl",
    "python-requests",
    "scrapy",
    "apache-httpclient",
    "go-http-client",
    "headlesschrome",
    "googlebot",
    "bingbot",
    "zoominfobot"
    ];

const HIGH_RISK_COUNTRIES = [
    "China",
    "Russia",
    "Ukraine",
    "Vietnam",
    "India",
    "Brazil",
    "Indonesia",
    "Nigeria",
    "Bangladesh"
    ];

const MEDIUM_RISK_COUNTRIES = [
    "Turkey",
    "Argentina",
    "Mexico",
    "Philippines",
    "Thailand",
    "Pakistan",
    "South Africa"
    ];

/** Fetch and return csv data using PapaParse */
async function fetchTrafficData() {
    try {
        console.log("Fetching traffic data from CSV from " + CONFIG.DATA_URL);

        return new Promise((resolve, reject) => {
        Papa.parse(CONFIG.DATA_URL, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                resolve(results.data);   // <-- THIS RETURNS TO await fetchTrafficData()
            },
            error: function (err) {
                console.error("PapaParse error:", err);
                reject(err);
            },
        });
        });
        
    } catch (error) {
        console.error('Error fetching traffic data:', error);
        alert('Failed to load traffic data. Check console for details.');
        return [];
    }
}

/**
 * TODO: Implement fraud detection logic
 * Analyze each session and assign risk scores
 * 
 * High-Risk Indicators:
 * - 0 seconds on page but form submitted
 * - >10 page views from same IP in <60 seconds
 * - Suspicious user agents (bots, scrapers)
 * - High click rate (>50 clicks/minute)
 * - High-risk countries
 * 
 * Return object with: { riskScore: 0-100, classification: 'clean'|'suspicious'|'bot', flags: [] }
 */
function analyzeSession(session, ipData) {
    let riskScore = 0;
    const flags = [];

    // Normalize types from csv
    const timeOnPage = Number(session.time_on_page);
    const clicks = Number(session.clicks);
    const formSubmitted = session.form_submitted === "true" || session.form_submitted === true;

    // High Risk detection rules

    // Rule 1: Form spam
    if (timeOnPage === 0 && formSubmitted) {
        //console.log('Form Spam Detected - ', session)
        riskScore += 40;
        flags.push("Form spam (0 seconds)");
    }


    // Rule 2: >10 page views from same IP in <60 seconds
    const ip = session.ip_address;
    const currentTime = new Date(session.timestamp).getTime();
    const timestamps = ipData[ip] || [];
    const WINDOW_MS = 60 * 1000;

    // Count how many events from this IP occurred in the 60s window ending at currentTime
    const countInWindow = timestamps.filter(t => t >= currentTime - WINDOW_MS && t < currentTime + WINDOW_MS).length;

    if (countInWindow > 10) {
        //console.log('High Traffic Detected - ', session)
        riskScore += 50;
        flags.push(`High frequency: ${countInWindow} pageviews from IP ${ip} within 60s`);
    }
    

    // Rule 3: Suspicious user agents (bots, scrapers)
    const ua = session.user_agent.toLowerCase();
    
    if (botUserAgents.some(sig => ua.includes(sig))) {
        //console.log('Bot Detected - ', session)
        riskScore += 80;
        flags.push('Bot-like user agent detected');
    }

    // Rule 4: High click rate (>50 clicks/minute)
    if (clicks > 50) {
        //console.log('High Click Rate - ', session)
        riskScore += 70;
        flags.push("High Click Rate");
    }

    // Rule 5: High-risk countries
    const country = (session.country || "").trim();

    if (HIGH_RISK_COUNTRIES.includes(country)) {
        //console.log('High Risk Country - ', session);
        riskScore += 40;
        flags.push(`High-risk country: ${country}`);
    } else if (MEDIUM_RISK_COUNTRIES.includes(country)) {
        //console.log('High Risk Country - ', session);
        riskScore += 30;
        flags.push(`Medium-risk country: ${country}`);
    // check if High Risk and Bot, add additional risk factor
    } else if (HIGH_RISK_COUNTRIES.includes(country) && botUserAgents.some(sig => ua.includes(sig))) {
        riskScore += 30; // stack bonus
        flags.push("High-risk country + bot-like user agent");
    }
    
    // Classify based on score
    let classification = 'clean';
    if (riskScore >= 70) {
        classification = 'bot';
    } else if (riskScore >= 30) {
        classification = 'suspicious';
    }
    
    // Cap Risk at 100
    if (riskScore > 100) { riskScore = 100 };
    
    return { riskScore, classification, flags };
}

/** Process raw data and add risk analysis  */

function processData(rawData) {
    // Build a map: ip_address -> [list of timestamps in ms]
    const ipMap = {};

    rawData.forEach(session => {
        const ip = session.ip_address;
        const ts = new Date(session.timestamp).getTime(); // convert to ms

        if (!ipMap[ip]) ipMap[ip] = [];
        ipMap[ip].push(ts);
    });

    // Sort timestamps per IP so we can do window checks reliably
    for (const ip in ipMap) {
        ipMap[ip].sort((a, b) => a - b);
    }

    // Now analyze each session with access to the ipMap
    return rawData.map(session => {
        const analysis = analyzeSession(session, ipMap);
        return {
            ...session,
            ...analysis
        };
    });
    }

/**
 * TODO: Update dashboard metrics
 */
function updateMetrics(data) {
    const totalSessions = data.length;
    const botSessions = data.filter(s => s.classification === 'bot').length;
    const botRate = ((botSessions / totalSessions) * 100).toFixed(1);
    const avgRisk = (data.reduce((sum, s) => sum + s.riskScore, 0) / totalSessions).toFixed(0);
    const cleanForms = data.filter(s => s.classification === 'clean' && s.form_submitted).length;
    
    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('botRate').textContent = `${botRate}%`;
    document.getElementById('avgRisk').textContent = avgRisk;
    document.getElementById('cleanForms').textContent = cleanForms;
}

/**
 * TODO: Update high-risk sessions table
 */
function updateTable(data) {
    const tbody = document.querySelector('#riskTable tbody');
    
    // Filter to show only suspicious and bot traffic
    const highRisk = data
        .filter(s => s.classification !== 'clean')
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 20); // Top 20
    
    if (highRisk.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No high-risk sessions detected</td></tr>';
        return;
    }
    
    tbody.innerHTML = highRisk.map(session => `
        <tr>
            <td>${new Date(session.timestamp).toLocaleString()}</td>
            <td>${session.ip_address}</td>
            <td>${session.country}</td>
            <td><strong>${session.riskScore}</strong></td>
            <td><span class="risk-badge risk-${session.classification}">${session.classification.toUpperCase()}</span></td>
            <td><small>${session.flags.join(', ')}</small></td>
        </tr>
    `).join('');
}

/**
 * TODO: Create charts using Chart.js or similar library
 * You'll need to include Chart.js in index.html first
 */
function updateCharts(data) {
    // TODO: Implement chart rendering
    // - Bar chart: Traffic by Country
    // - Pie chart: Device distribution
    // - Consider adding: Line chart for traffic over time
    
    console.log('Charts would render here with Chart.js');

    let countryCount = getCountryCount(data);
    let deviceCount = getDeviceCount(data);
    let c_labels = Object.keys(countryCount);
    let c_values = Object.values(countryCount);
    let d_labels = Object.keys(deviceCount);    // e.g. ["Desktop", "Mobile", "Tablet"]
    let d_values = Object.values(deviceCount);  // e.g. [120, 80, 15]
    let ctx_country = document.getElementById('countryChart').getContext('2d');
    let ctx_device = document.getElementById('deviceChart').getContext('2d');

    // Destroy any old charts first
    if (countryChart) { countryChart.destroy(); }
    if (deviceChart) { deviceChart.destroy(); }

    // Pie Chart

  countryChart = new Chart(ctx_country, {
    type: 'bar',
    data: {
      labels: c_labels,
      datasets: [{
        label: 'Traffic by Country',
        data: c_values,
        backgroundColor: '#4e79a7',
        borderColor: '#2f4b7c',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          //text: 'Traffic by Country'
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Country' },
          ticks: { autoSkip: false }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Sessions' }
        }
      }
    }
  });

  // =====================================================
  //   Render Pie Chart: Device Distribution
  // =====================================================

  deviceChart = new Chart(ctx_device, {
    type: 'pie',
    data: {
      labels: d_labels,
      datasets: [{
        label: 'Device Distribution',
        data: d_values,
        backgroundColor: [
          '#4e79a7',
          '#f28e2b',
          '#e15759',
          '#76b7b2',
          '#59a14f',
          '#edc949'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'right' },
        title: {
          display: true,
          //text: 'Device Distribution'
        }
      }
    }
  });  
    
}

/**
 * TODO: Apply filters
 */
function applyFilters() {
    const riskFilter = document.getElementById('riskFilter').value;
    const countryFilter = document.getElementById('countryFilter').value;
    
    filteredData = trafficData.filter(session => {
        const riskMatch = riskFilter === 'all' || session.classification === riskFilter;
        const countryMatch = countryFilter === 'all' || session.country === countryFilter;
        return riskMatch && countryMatch;
    });
    
    updateMetrics(filteredData);
    updateTable(filteredData);
    updateCharts(filteredData);
}

/**
 * TODO: Populate country filter dropdown
 */
function populateFilters(data) {
    const countries = [...new Set(data.map(s => s.country))].sort();
    const countrySelect = document.getElementById('countryFilter');
    
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}

// Get Country Count for Pie Chart
function getCountryCount(data) {
  const countryCount = {};

  data.forEach(session => {
    const country = (session.country || "Unknown").trim();
    if (!countryCount[country]) {
      countryCount[country] = 0;
    }
    countryCount[country]++;
  });

  return countryCount;
}

// Get Devices for Bar Chart
function getDeviceCount(data) {
  const deviceCount = {};

  data.forEach(session => {
    const device = (session.device_type || "Unknown").trim();
    if (!deviceCount[device]) {
      deviceCount[device] = 0;
    }
    deviceCount[device]++;
  });

  return deviceCount;
}

/**
 * Initialize dashboard
 */
async function initDashboard() {
    console.log('Initializing CHEQ Traffic Quality Dashboard...');
    
    // Fetch and process data
    const rawData = await fetchTrafficData();
    trafficData = processData(rawData);
    filteredData = trafficData;
    
    // Setup UI
    populateFilters(trafficData);
    updateMetrics(filteredData);
    updateTable(filteredData);
    updateCharts(filteredData);
    
    // Event listeners
    document.getElementById('refreshBtn').addEventListener('click', initDashboard);
    document.getElementById('riskFilter').addEventListener('change', applyFilters);
    document.getElementById('countryFilter').addEventListener('change', applyFilters);
    
    console.log('✅ Dashboard ready!');
}

// Start the dashboard when page loads
document.addEventListener('DOMContentLoaded', initDashboard);

