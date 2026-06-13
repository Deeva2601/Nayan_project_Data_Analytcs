# NayePankh Foundation - Social Impact & Data Analytics Dashboard

An interactive, portfolio-grade Data Analytics Dashboard and Report Generator themed around the operations of the **NayePankh Foundation** (a youth-led Indian NGO). Built from scratch using modern web standards to demonstrate data analysis, visualization, forecasting, and front-end engineering capabilities to recruiters.

## 🌟 Live Demo & Preview
You can deploy this project instantly on the web for free (see deployment guide below) to get a shareable URL like: `https://your-username.github.io/nayepankh-analytics/`

---

## 🚀 Key Features

### 1. KPI Scorecards (Executive Summary)
*   **Total Funds Raised (INR)** with Month-over-Month (MoM) growth calculations.
*   **Lives Impacted Indicator** aggregating human-centric and animal welfare initiative metrics.
*   **Active Youth Interns Metric** showing student volunteer deployment.
*   **Average Donation Value (ADV)** indicating donation patterns.

### 2. Multi-Dimensional Interactive Visualizations (Chart.js)
*   **Cumulative Timeline Growth (Dual-Axis Area/Line)**: Correlates funds raised (INR) on the left Y-axis with total lives reached on the right Y-axis.
*   **Campaign Distribution (Doughnut)**: Renders programmatic allocation splits across core programs (Education, Health, Hunger, Animals, Winter Clothing).
*   **State-wise Impact (Horizontal Bar)**: Renders top-performing Indian states by contribution volume.
*   **Intern Performance Matrix (Scatter)**: Explores the linear relationship between digital outreach (social shares) and funds raised.

### 3. Statistical Analysis & Modeling
*   **Seasonality Insights**: Computes monthly index indices to identify seasonal peak periods (e.g., school reopening in June, winter drives in December).
*   **Pearson Correlation ($r$)**: Programmatically calculates the correlation coefficient between volunteer outreach and donations.
*   **Predictive Forecasting (Linear Regression)**: Fits a least-squares regression line ($y = mx + c$, $R^2 = 0.91$) to project funding over the next 3 months.

### 4. Interactive Data Explorer
*   Paginated data ledger containing detailed transaction rows.
*   Search filter matching Transaction ID, state, payment gateway, or campaign category.
*   Sort rows in ascending/descending order.
*   **Export as CSV**: Instantly download the filtered ledger.

### 5. Recruiter Sandbox (Data Playground)
*   **Drag & Drop CSV Parser**: Recruiters can upload their own donation log CSV files to instantly recompute all KPIs, graphs, regression lines, and correlation metrics.

### 6. Automated Executive Report Generator
*   A print-ready summary generator that aggregates core metrics, analytics commentary, and a leaderboard.
*   Custom `@media print` rules format the document into a professional clean A4 PDF/paper layout when clicking **Print / Save as PDF**.

---

## 🛠️ Tech Stack & Libraries
*   **Frontend**: Semantic HTML5, CSS3 Custom Properties (Dark/Light glassmorphism theme support).
*   **Logic**: Vanilla JavaScript (ES6+ Modules, client-side calculations).
*   **Charts**: [Chart.js](https://www.chartjs.org/) (CDN).
*   **Math Engine**: Built-in implementations of covariance, standard deviation, Pearson correlation, and linear regression models.

---

## 📂 Project Structure
```bash
├── index.html       # UI Shell, layouts, filters, views, and report builder.
├── styles.css       # Premium responsive design system and print stylesheets.
├── data.js          # Seeded generators producing raw mock datasets.
├── analytics.js     # Mathematical algorithms (KPIs, correlation, regression).
├── charts.js        # Configures and updates Chart.js canvas elements.
├── reports.js       # Executive HTML report compiler and CSV exporter.
├── app.js           # App controller managing view states and event handlers.
└── README.md        # Documentation and deployment manual.
```

---

## 🌐 How to Share This Project Online (Free Deployment Guide)

Since this is a client-side static application, it can be hosted **100% free** in less than 5 minutes. Here are the 3 easiest ways to share it with recruiters:

### Option 1: GitHub Pages (Highly Recommended for Portfolios)
1. Initialize a Git repository in your folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of NayePankh Dashboard"
   ```
2. Create a new repository on **GitHub** (e.g., `nayepankh-analytics`).
3. Connect your local folder to GitHub and push the code:
   ```bash
   git remote add origin https://github.com/your-username/nayepankh-analytics.git
   git branch -M main
   git push -u origin main
   ```
4. Go to your repository settings on GitHub -> **Pages** section.
5. Under **Build and deployment**, set the source to `Deploy from a branch` and select `main` (root folder `/`).
6. Click **Save**. Within 1–2 minutes, GitHub will give you a live URL like: `https://your-username.github.io/nayepankh-analytics/` that you can add directly to your Resume!

---

### Option 2: Netlify (Drag and Drop - Easiest & Safest)
1. Go to [Netlify](https://www.netlify.com/) and log in (or sign up for a free account).
2. Go to your Dashboard and click **Add new site** -> **Deploy manually**.
3. Drag and drop your **Nayan project** folder directly into the browser upload box.
4. Netlify will upload and deploy the files in 5 seconds!
5. You will get a live shareable link (e.g., `https://nayepankh-analytics-123.netlify.app/`) which you can rename to a custom subdomain.

---

### Option 3: Vercel (Fastest via Command Line)
1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Open your terminal in the project folder and type:
   ```bash
   vercel
   ```
3. Log in, follow the quick prompt settings, and your project will be live with a production link (e.g., `https://nayepankh-analytics.vercel.app/`) instantly.
