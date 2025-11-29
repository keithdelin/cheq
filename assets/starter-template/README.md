# CHEQ Traffic Quality Dashboard - Starter Template

## Quick Start

This is your starter template for the CHEQ Traffic Quality Dashboard assignment. The basic UI structure is provided - your job is to implement the core functionality.

### What's Included

✅ **HTML Structure** (`index.html`)
- Dashboard layout with metrics, filters, charts, and table
- Professional design matching CHEQ's brand

✅ **CSS Styling** (`style.css`)
- Complete responsive styling
- Color scheme and components ready to use

✅ **JavaScript Skeleton** (`script.js`)
- Function stubs with TODO comments
- Clear guidance on what to implement
- Mock data generator (remove when you connect to Google Sheets)

### What You Need to Implement

#### 1. CSV Data Fetching
Replace the `fetchTrafficData()` function to:
- Fetch CSV data from: `https://cheq.free.nf/sample-traffic-data.csv`
- Parse the CSV into an array of objects
- Handle errors gracefully (network failures, malformed data)

**Resources:**
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [PapaParse](https://www.papaparse.com/) - Easy CSV parsing library (recommended)
- Or parse manually by splitting lines and columns

#### 2. Fraud Detection Logic
Complete the `analyzeSession()` function to:
- Implement at least 4 detection rules
- Calculate risk scores (0-100)
- Return classification (clean/suspicious/bot) and flags

**Detection Ideas:**
- Form spam: 0 seconds on page but form submitted
- IP clustering: Multiple sessions from same IP
- Bot user agents: Match against known bot patterns
- Superhuman clicks: >50 clicks per minute
- High-risk geos: Russia, China, etc.

#### 3. Data Visualization
Implement the `updateCharts()` function using [Chart.js](https://www.chartjs.org/):

```html
<!-- Add to index.html <head> -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

Create:
- Bar chart: Traffic by country (color-coded by risk)
- Pie chart: Device type distribution
- Bonus: Line chart showing traffic over time

#### 4. Filters
The filter logic is started - enhance it to:
- Filter by risk level
- Filter by country
- Update all metrics/charts/tables when filters change

### Development Workflow

1. **Test Locally First**
   - Open `index.html` in your browser
   - Use the mock data to build your UI
   - Test all functions work correctly

2. **Fetch Real CSV Data**
   - Update `fetchTrafficData()` to fetch from the CSV URL
   - Parse CSV into array of objects (each row = session)
   - Test data fetching works (check browser console)

3. **Implement Fraud Detection**
   - Start with simple rules (form spam)
   - Add complexity (IP analysis, user agent detection)
   - Test with real data patterns

4. **Add Charts**
   - Include Chart.js library (uncommented in index.html)
   - Create chart instances
   - Wire up to filtered data

5. **Deploy**
   - Choose: Vercel, Netlify, GitHub Pages, etc.
   - Test deployed version
   - Share the link

### Deployment Options

**Vercel (Recommended):**
```bash
npm i -g vercel
vercel
```

**Netlify:**
1. Drag & drop folder to [netlify.com/drop](https://app.netlify.com/drop)

**GitHub Pages:**
1. Create repo, push code
2. Settings → Pages → Deploy from main branch

### Tips

- **Start simple**: Get CSV fetching working first with console.log()
- **Use browser DevTools**: Check Network tab for fetch errors
- **CORS**: The CSV is hosted on a public URL, so no CORS issues
- **Test incrementally**: Don't try to build everything at once
- **Document your thinking**: Add comments explaining detection rules
- **Handle edge cases**: What if fetch fails? Malformed CSV?

### Example Detection Rule

```javascript
// Detect form spam
if (session.time_on_page < 2 && session.form_submitted) {
    riskScore += 40;
    flags.push('Form spam - submitted too quickly');
}

// Detect bot user agents
const botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'python'];
const isBotUA = botPatterns.some(pattern => 
    session.user_agent.toLowerCase().includes(pattern)
);
if (isBotUA) {
    riskScore += 50;
    flags.push('Known bot user agent');
}
```

### Questions?

If you get stuck or have questions about:
- **CSV fetching**: Check the Fetch API docs or try PapaParse
- **Assignment requirements**: Re-read the main README.md
- **Technical blockers**: Email with specific error messages

### Example CSV Parsing

**Using PapaParse (Easy):**
```javascript
const response = await fetch(CONFIG.DATA_URL);
const csvText = await response.text();

Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    complete: (results) => {
        trafficData = results.data;
    }
});
```

**Manual Parsing:**
```javascript
const response = await fetch(CONFIG.DATA_URL);
const csvText = await response.text();
const lines = csvText.split('\n');
const headers = lines[0].split(',');

const data = lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, i) => {
        obj[header.trim()] = values[i];
        return obj;
    }, {});
});
```

Good luck! 🚀

