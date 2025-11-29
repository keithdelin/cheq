/**
 * CHEQ Traffic Quality Dashboard
 * Starter Template - Complete the TODOs below
 */

// Configuration
const CONFIG = {
    // CSV data source
    DATA_URL: 'https://cheq.free.nf/sample-traffic-data.csv',
    //DATA_URL: 'assets/sample-traffic-data.csv',
};

// State
let trafficData = [];
let filteredData = [];

/**
 * TODO: Implement CSV data fetching
 * Fetch and parse CSV data from the provided URL
 * 
 * Hint: You can use PapaParse library for easy CSV parsing:
 * <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
 * 
 * Or parse manually by splitting on newlines and commas
 */
async function fetchTrafficData() {
    try {
        console.log('Fetching traffic data from CSV from ' + CONFIG.DATA_URL);
        
        // CSV fetch and parse
        const response = await fetch(CONFIG.DATA_URL);
        console.log('my response ', response)
        //const csvText = await response.text();
        // Parse CSV into array of objects with proper column names
        
        // REMOVE THIS - Mock data for testing structure only
        trafficData = generateMockData();
        
        return trafficData;
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
function analyzeSession(session) {
    let riskScore = 0;
    const flags = [];
    
    // TODO: Implement detection rules here
    
    // Example rule: Form spam detection
    if (session.time_on_page === 0 && session.form_submitted) {
        riskScore += 40;
        flags.push('Form spam (0 seconds)');
    }
    
    // TODO: Add more detection rules
    // - Check user agent patterns
    // - Detect IP clustering
    // - Analyze click rates
    // - Check country risk
    
    // Classify based on score
    let classification = 'clean';
    if (riskScore >= 70) classification = 'bot';
    else if (riskScore >= 30) classification = 'suspicious';
    
    return { riskScore, classification, flags };
}

/**
 * TODO: Process raw data and add risk analysis
 */
function processData(rawData) {
    return rawData.map(session => {
        const analysis = analyzeSession(session);
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

/**
 * MOCK DATA GENERATOR (Remove this when implementing real CSV fetching)
 */
function generateMockData() {
    console.warn('Using mock data - Replace with CSV fetch from ' + CONFIG.DATA_URL);
    
    const mockSessions = [];
    const countries = ['United States', 'United Kingdom', 'Germany', 'Russia', 'China'];
    const pages = ['/home', '/products', '/pricing', '/demo', '/contact'];
    
    for (let i = 0; i < 50; i++) {
        mockSessions.push({
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            session_id: `sess_${Math.random().toString(36).substring(7)}`,
            ip_address: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            page_url: pages[Math.floor(Math.random() * pages.length)],
            time_on_page: Math.floor(Math.random() * 300),
            clicks: Math.floor(Math.random() * 20),
            form_submitted: Math.random() > 0.8,
            referrer: 'https://www.google.com/search',
            country: countries[Math.floor(Math.random() * countries.length)],
            device_type: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)]
        });
    }
    
    return mockSessions;
}

// Start the dashboard when page loads
document.addEventListener('DOMContentLoaded', initDashboard);

