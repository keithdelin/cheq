# CHEQ.ai Technical Assignment: Traffic Quality Dashboard

## Overview
Welcome to the CHEQ Customer Success Engineering technical assignment. This assignment simulates a real-world scenario where you'll build a **Traffic Quality Dashboard** that analyzes web traffic data and flags potential bot or fraudulent activity.

## Your Mission
A client has integrated CHEQ's JavaScript tag on their website and is collecting traffic data. Your job is to build a dashboard that:

1. **Fetches and parses CSV data** containing raw traffic data
2. **Analyzes traffic patterns** to detect suspicious behavior
3. **Visualizes the data** with clear metrics and insights
4. **Flags high-risk traffic** based on fraud detection rules
5. **Provides actionable recommendations** for the client

## Background: What is CHEQ?
CHEQ is a fraud detection and bot mitigation platform that protects websites, ads, and data from invalid traffic. Our Customer Success Engineering team implements CHEQ solutions for enterprise clients, debugging technical issues and ensuring accurate bot detection.

## The Assignment

### Part 1: Fetch Traffic Data from CSV (30 minutes)
You'll work with a CSV file containing simulated traffic data with the following columns:
- `timestamp` - When the visit occurred
- `session_id` - Unique session identifier
- `ip_address` - Visitor IP address
- `user_agent` - Browser user agent string
- `page_url` - Page visited
- `time_on_page` - Seconds spent on page
- `clicks` - Number of clicks during session
- `form_submitted` - Boolean (true/false)
- `referrer` - Traffic source
- `country` - Visitor country
- `device_type` - Desktop, Mobile, or Tablet

**Your Task:** Fetch the CSV data from the provided URL and parse it to display in your dashboard.

**Data URL:** `https://cheq.free.nf/sample-traffic-data.csv`

### Part 2: Implement Fraud Detection Logic (45 minutes)
Based on industry best practices and CHEQ's approach, implement detection rules to flag suspicious traffic:

**High-Risk Indicators:**
- Sessions with 0 seconds time on page but form submissions
- More than 10 page views from the same IP in under 60 seconds
- User agents that don't match standard browser patterns
- Sessions with identical user agents and IPs within 5 minutes
- Click rates > 50 per minute (inhuman speed)
- Traffic from high-risk countries on a provided blocklist

**Your Task:** 
1. Analyze each session/event
2. Assign a **Risk Score** (0-100)
3. Flag sessions as: `Clean`, `Suspicious`, or `Bot`
4. Document your detection logic

### Part 3: Build the Dashboard UI (45 minutes)
Create a clean, professional web interface that displays:

**Key Metrics (Top Cards):**
- Total Sessions
- Bot Detection Rate (% flagged as bots)
- Average Risk Score
- Form Submissions from Clean vs Bot Traffic

**Visualizations:**
- Bar chart: Traffic by Country (with risk levels color-coded)
- Line chart: Traffic volume over time
- Pie chart: Device Type distribution
- Table: High-risk sessions with details (IP, User Agent, Risk Score, Flags)

**Filters:**
- Date range picker
- Risk level filter (Clean/Suspicious/Bot)
- Country filter

### Part 4: Technical Implementation & Deployment (30 minutes)
**Requirements:**
- Use vanilla JavaScript, React, or any framework you prefer
- Responsive design (mobile-friendly)
- Deploy to Vercel, Netlify, GitHub Pages, or similar
- Include error handling for data fetching
- Provide a README with setup instructions

**Bonus Points:**
- Add a "block list" feature where you can add IPs/user agents to flag
- Implement real-time detection simulation (animate new traffic coming in)
- Add export functionality (CSV/JSON) for flagged traffic
- Add a feature to upload custom CSV files for analysis
- Add GTM (Google Tag Manager) integration suggestions for the client
- Implement local storage to save detection rules/settings

## Deliverables

Please submit:

1. **Live Demo Link** - Deployed application URL
2. **GitHub Repository** - Source code (public or share access)
3. **Google Sheet** - Share the sheet with your risk analysis results
4. **Brief Write-up** (500 words max):
   - Your fraud detection approach and reasoning
   - Technical decisions you made
   - How you'd improve this with more time
   - One real-world challenge you foresee in bot detection

## Evaluation Criteria

We'll assess:

✅ **Technical Execution (40%)**
- Code quality, structure, and best practices
- CSV data fetching and parsing
- Error handling and edge cases
- Performance optimization

✅ **Fraud Detection Logic (30%)**
- Sophistication of detection rules
- Understanding of bot behavior patterns
- Accuracy of risk scoring

✅ **UI/UX Design (20%)**
- Visual clarity and professional appearance
- Intuitive navigation and filtering
- Data visualization effectiveness

✅ **Problem Solving (10%)**
- Creative solutions and bonus features
- Documentation quality
- Your write-up insights

## Timeline
Please complete this assignment within **10 days** of receiving it.


---

**Good luck! We're excited to see your solution.** 🚀

This assignment reflects the real work our Customer Success Engineering team does daily - analyzing traffic patterns, implementing fraud detection, and providing actionable insights to clients. We value creativity, technical depth, and practical thinking.

