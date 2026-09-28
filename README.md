# AI BUSINESS NERVOUS SYSTEM

> **“Don't just see your business. See what happens next.”**

An AI-powered operational intelligence platform prototype that integrates business data, detects operational risks, predicts future problems, simulates possible interventions using a Digital Twin, and recommends actionable solutions. 

This repository contains the **fully interactive front-end prototype** designed specifically for hackathon demonstrations. It features a premium, dark-themed enterprise UI reminiscent of high-end platforms like Palantir Foundry or Datadog.

---

## 🚀 The Core Concept: The AI Operational Loop

This platform shifts business management from **reactive** to **proactive**. It operates on a continuous 5-step AI pipeline:

1. **DETECT:** Ingests real-time data from bookings, sensors, and staff to understand the current business state.
2. **PREDICT:** Uses historical patterns to identify what is likely to happen next (e.g., predicting a bottleneck before it occurs).
3. **SIMULATE:** Tests possible interventions using a virtual Digital Twin of the business.
4. **RECOMMEND:** Provides explainable, high-confidence operational recommendations.
5. **ACT:** Supports human decision-making and operational execution.

---

## 🌟 Key Features & Modules

### 1. Business Pulse Dashboard
A mission-control overview displaying real-time KPIs, active alerts, and a "What Happens Next?" timeline that highlights upcoming operational bottlenecks before they occur.

### 2. Operational Digital Twin
A real-time physical SVG representation of the business (e.g., a hotel layout). It highlights rooms, reception areas, and service zones in Green/Amber/Red based on their current operational risk, and visualizes staff moving through the environment.

### 3. What-If Simulator
A powerful interactive engine allowing users to manipulate variables (Occupancy, Staff, Cleaning Times) using sliders. It compares the "Current State" vs. a "Simulated State" side-by-side, projecting how interventions impact backlogs and operational risk.

### 4. Business Knowledge Graph
An interactive node-based network graph (powered by Vis.js) that maps the complex relationships between guests, bookings, rooms, employees, and services. Clicking an entity reveals its dependencies.

### 5. Explainable AI ("Why?")
To ensure the AI doesn't feel like a black box, every prediction features a **"Why?"** button. Clicking it reveals the exact data points and logical steps the AI took to generate the prediction, along with a confidence score.

### 6. Nerva AI Assistant
An integrated chat interface that allows natural language queries about the system's current state, risks, and recommended actions.

### 7. Cross-Industry Adaptability
A top-bar dropdown allows the presenter to instantly switch the mock data context between **Hospitality, Retail, Finance, and Events**, proving the architecture is industry-agnostic.

### 8. ▶️ Run Live Demo Mode
A 1-click sequence designed for presentations. Clicking the "Run Live Demo" button automatically simulates a 20-second incident lifecycle: an alert fires -> the Digital Twin updates -> predictions are generated -> the simulator tests an intervention.

---

## 🛠️ Technology Stack

This is a **static front-end application**. It does not require a backend, database, or API keys, ensuring it never fails during a live pitch due to network issues.

- **Structure:** HTML5
- **Styling:** Custom CSS3 (Glassmorphism, Dark Mode, CSS Animations)
- **Logic & State:** Vanilla JavaScript (ES6+)
- **Charts:** [Chart.js](https://www.chartjs.org/) (Loaded via CDN)
- **Knowledge Graph:** [Vis.js Network](https://visjs.github.io/vis-network/docs/network/) (Loaded via CDN)
- **Icons:** [Lucide Icons](https://lucide.dev/) (Loaded via CDN)

---

## 📂 File Structure

```text
ai_nervous_system/
│
├── index.html              # The main Single Page Application interface
├── README.md               # This documentation file
│
├── css/
│   └── styles.css          # Premium dark-theme styles and layout
│
└── js/
    ├── app.js              # Main routing, UI interactions, and Demo sequence
    ├── data.js             # Mock JSON data for KPIs and cross-industry scenarios
    ├── digital-twin.js     # SVG generation and interaction logic for the Digital Twin
    └── graph.js            # Vis.js initialization and interaction for the Knowledge Graph
```

---

## 💻 How to Run the Prototype

Because this is a completely static prototype, you do not need Node.js, npm, or any build tools.

### Option 1: Direct File Open (Easiest)
Simply double-click the `index.html` file to open it in Chrome, Firefox, Safari, or Edge. The application will run entirely locally in your browser.

### Option 2: Local Web Server (Recommended)
Running via a local server prevents any potential browser CORS restrictions with local files.
If you have Python installed, open your terminal/command prompt, navigate to the folder, and run:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

---

## 🔧 Customizing the Mock Data

To customize the numbers, predictions, and scenarios for your specific hackathon pitch, open `js/data.js` in any text editor.

Inside, you will find the `mockData` object categorized by industry (`hospitality`, `retail`, `finance`, `events`). You can freely edit:
- The KPI values and trends.
- The Prediction titles, probability percentages, impact text, and root causes.
- The AI recommended actions.

To change the relationships in the Knowledge Graph, scroll to the bottom of `js/data.js` and edit the `graphData.nodes` and `graphData.edges` arrays.
