/**
 * NayePankh Foundation - Data Analytics Dashboard
 * App Controller (app.js)
 * 
 * Orchestrates:
 * 1. App State & Filter Management
 * 2. View Switching & UI Binding
 * 3. Table Rendering, Sorting, Pagination, Search
 * 4. CSV File Import (Sandbox Playground) & Exports
 * 5. Theme Toggling & Initialization
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check global dependencies
    if (typeof NayePankhData === 'undefined' || typeof NayePankhAnalytics === 'undefined' || typeof NayePankhCharts === 'undefined' || typeof NayePankhReports === 'undefined') {
        console.error('Core modules failed to load. Ensure data.js, analytics.js, charts.js, and reports.js are loaded before app.js.');
        return;
    }

    // ==========================================================================
    // 1. App State Configuration
    // ==========================================================================
    const state = {
        theme: 'dark',
        currentView: 'dashboard',
        
        // Active Datasets (can be overwritten by CSV Playground upload)
        donations: [...NayePankhData.donations],
        interns: [...NayePankhData.interns],
        impactHistory: [...NayePankhData.impactHistory],

        // Current Active Filters
        filters: {
            campaign: 'All',
            location: 'All',
            donorType: 'All',
            startDate: '2025-01-01'
        },

        // Data Table Configuration
        table: {
            currentPage: 1,
            rowsPerPage: 10,
            sortColumn: 'dateString',
            sortOrder: 'desc',
            searchQuery: ''
        }
    };

    // DOM Elements
    const elements = {
        themeToggle: document.getElementById('theme-toggle'),
        navItems: document.querySelectorAll('.nav-item'),
        views: document.querySelectorAll('.view-panel'),
        viewTitle: document.getElementById('view-title'),
        viewDesc: document.getElementById('view-desc'),
        
        // Filters
        filterCampaign: document.getElementById('filter-campaign'),
        filterState: document.getElementById('filter-state'),
        filterDonor: document.getElementById('filter-donor'),
        filterStartDate: document.getElementById('filter-start-date'),
        btnResetFilters: document.getElementById('btn-reset-filters'),
        
        // Actions
        btnExportAll: document.getElementById('btn-export-all'),
        btnImportToggle: document.getElementById('btn-import-toggle'),
        playgroundUpload: document.getElementById('playground-upload-zone'),
        dropZone: document.getElementById('drop-zone'),
        fileUploader: document.getElementById('file-uploader'),

        // KPIs
        kpiFunds: document.getElementById('kpi-funds'),
        kpiFundsPct: document.getElementById('kpi-funds-pct'),
        kpiImpact: document.getElementById('kpi-impact'),
        kpiImpactPct: document.getElementById('kpi-impact-pct'),
        kpiAvg: document.getElementById('kpi-avg'),
        kpiInterns: document.getElementById('kpi-interns'),

        // Explorer View
        tableBody: document.getElementById('table-body'),
        tableSearch: document.getElementById('table-search'),
        tableHeaders: document.querySelectorAll('#donations-table th'),
        paginationLabel: document.getElementById('pagination-label'),
        btnPrevPage: document.getElementById('btn-prev-page'),
        btnNextPage: document.getElementById('btn-next-page'),

        // Trends View
        peakMonthName: document.getElementById('peak-month-name'),
        peakMonthVal: document.getElementById('peak-month-val'),
        subPeakMonth: document.getElementById('sub-peak-month'),
        correlationValue: document.getElementById('correlation-value'),
        corrNarrativeVal: document.getElementById('corr-narrative-val'),
        rSquaredVal: document.getElementById('r-squared-val'),
        forecastTableContainer: document.getElementById('forecast-table-container'),
        forecastSlope: document.getElementById('forecast-slope'),
        forecastIntercept: document.getElementById('forecast-intercept'),

        // Reports View
        reportCampaign: document.getElementById('report-campaign'),
        btnCompileReport: document.getElementById('btn-compile-report'),
        btnPrintReport: document.getElementById('btn-print-report'),
        reportPrintContainer: document.getElementById('report-print-container')
    };

    // ==========================================================================
    // 2. Initial Setup and Theme
    // ==========================================================================
    function initializeApp() {
        // Theme initialization
        document.documentElement.setAttribute('data-theme', state.theme);
        
        // Populate Indian States Filter Dropdown
        NayePankhData.states.sort().forEach(stateName => {
            const opt = document.createElement('option');
            opt.value = stateName;
            opt.textContent = stateName;
            elements.filterState.appendChild(opt);
        });

        // Initialize Chart.js styling variables
        NayePankhCharts.initDefaults();

        // Attach All Core UI Listeners
        setupEventListeners();

        // Run Initial Calculations & Render View
        updateDashboardView();
        compileExecutiveReport();
    }

    // ==========================================================================
    // 3. Filtering Logic
    // ==========================================================================
    function getFilteredDonations() {
        return state.donations.filter(d => {
            // Campaign Match
            if (state.filters.campaign !== 'All' && d.campaign !== state.filters.campaign) return false;
            
            // Location Match
            if (state.filters.location !== 'All' && d.location !== state.filters.location) return false;
            
            // Donor Segment Match
            if (state.filters.donorType !== 'All' && d.donorType !== state.filters.donorType) return false;
            
            // Date Match
            if (state.filters.startDate) {
                const limitDate = new Date(state.filters.startDate);
                if (new Date(d.date) < limitDate) return false;
            }
            return true;
        });
    }

    // ==========================================================================
    // 4. View Controllers & Chart Updates
    // ==========================================================================
    function updateDashboardView() {
        const filteredData = getFilteredDonations();
        
        // 1. Calculate and Update KPI values
        const kpis = NayePankhAnalytics.calculateDonationKPIs(filteredData);
        
        // Set values with animations or clean formatting
        elements.kpiFunds.textContent = '₹' + kpis.totalRaised.toLocaleString('en-IN');
        elements.kpiAvg.textContent = '₹' + kpis.avgDonation.toLocaleString('en-IN');
        elements.kpiImpact.textContent = kpis.totalImpact.toLocaleString();
        
        // Count active unique interns in filtered dataset
        const activeCampaignId = NayePankhData.campaigns.find(c => c.name === state.filters.campaign)?.id || 'All';
        const filteredInterns = state.interns.filter(i => activeCampaignId === 'All' || i.campaignId === activeCampaignId);
        elements.kpiInterns.textContent = filteredInterns.length;

        // Extract MoM Growth percentages from static timeline calculations
        const growthMetrics = NayePankhAnalytics.calculateMoMGrowth(state.impactHistory);
        elements.kpiFundsPct.textContent = (growthMetrics.fundsGrowth >= 0 ? '+' : '') + growthMetrics.fundsGrowth + '%';
        elements.kpiImpactPct.textContent = (growthMetrics.impactGrowth >= 0 ? '+' : '') + growthMetrics.impactGrowth + '%';

        // 2. Render and refresh charts
        if (state.currentView === 'dashboard') {
            // Render Timeline Growth
            NayePankhCharts.renderTimelineChart('chart-timeline', state.impactHistory);
            
            // Render Campaign Allocation Doughnut
            NayePankhCharts.renderCampaignChart('chart-campaign', filteredData);
            
            // Render State-wise Bar Chart
            NayePankhCharts.renderStateChart('chart-state', filteredData);
            
            // Render Intern Outreach Scatter Matrix
            NayePankhCharts.renderInternChart('chart-intern', filteredInterns);
        }

        // 3. Update Table Explorer (if active)
        if (state.currentView === 'explorer') {
            renderExplorerTable(filteredData);
        }

        // 4. Update Trend Analytics (if active)
        if (state.currentView === 'trends') {
            updateTrendsPanel(filteredInterns);
        }
    }

    // ==========================================================================
    // 5. Data Table Explorer (Pagination, Search, Sorting)
    // ==========================================================================
    function renderExplorerTable(filteredData) {
        // Apply Search Input Filter
        let displayData = [...filteredData];
        if (state.table.searchQuery) {
            const query = state.table.searchQuery.toLowerCase();
            displayData = displayData.filter(d => 
                d.id.toLowerCase().includes(query) ||
                d.location.toLowerCase().includes(query) ||
                d.campaign.toLowerCase().includes(query) ||
                d.donorType.toLowerCase().includes(query) ||
                d.paymentMethod.toLowerCase().includes(query)
            );
        }

        // Apply Sorting
        const col = state.table.sortColumn;
        const order = state.table.sortOrder === 'asc' ? 1 : -1;
        displayData.sort((a, b) => {
            let valA = a[col];
            let valB = b[col];
            if (typeof valA === 'string') {
                return valA.localeCompare(valB) * order;
            }
            return (valA - valB) * order;
        });

        // Paginate Data
        const totalRows = displayData.length;
        const totalPages = Math.ceil(totalRows / state.table.rowsPerPage) || 1;
        
        // Keep current page inside boundaries
        if (state.table.currentPage > totalPages) state.table.currentPage = totalPages;
        if (state.table.currentPage < 1) state.table.currentPage = 1;

        const startIdx = (state.table.currentPage - 1) * state.table.rowsPerPage;
        const endIdx = Math.min(startIdx + state.table.rowsPerPage, totalRows);
        const paginatedData = displayData.slice(startIdx, endIdx);

        // Render rows
        elements.tableBody.innerHTML = '';
        if (paginatedData.length === 0) {
            elements.tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:40px;">No transaction records matched the current criteria.</td></tr>`;
        } else {
            paginatedData.forEach(row => {
                const tr = document.createElement('tr');
                
                // Style campaign badge class
                const badgeClass = `badge-${row.campaignId}`;
                
                tr.innerHTML = `
                    <td><strong>${row.id}</strong></td>
                    <td>${row.dateString}</td>
                    <td><span class="badge ${badgeClass}">${row.campaign}</span></td>
                    <td>${row.donorType}</td>
                    <td style="text-align:right; font-weight:700;">₹${row.amount.toLocaleString('en-IN')}</td>
                    <td>${row.location}</td>
                    <td>${row.paymentMethod}</td>
                    <td style="text-align:right; font-weight:600; color:var(--primary-light);">${row.impactUnits} ${row.unitName.split(' ')[0]}</td>
                `;
                elements.tableBody.appendChild(tr);
            });
        }

        // Update pagination labels & buttons
        elements.paginationLabel.textContent = totalRows > 0 
            ? `Showing ${startIdx + 1} to ${endIdx} of ${totalRows} entries`
            : `Showing 0 to 0 of 0 entries`;
            
        elements.btnPrevPage.disabled = state.table.currentPage === 1;
        elements.btnNextPage.disabled = state.table.currentPage === totalPages;
    }

    // ==========================================================================
    // 6. Trends & Analytical Projections Engine
    // ==========================================================================
    function updateTrendsPanel(filteredInterns) {
        // A. Seasonality calculations
        const seasonality = NayePankhAnalytics.analyzeSeasonality(state.impactHistory);
        elements.peakMonthName.textContent = seasonality.peakMonth;
        elements.peakMonthVal.textContent = seasonality.peakIndexValue + 'x';
        elements.subPeakMonth.textContent = seasonality.troughMonth + ' (Trough: ' + seasonality.troughIndexValue + 'x)';

        // B. Outreach Correlation calculations
        if (filteredInterns.length > 0) {
            const shares = filteredInterns.map(i => i.socialShares);
            const funds = filteredInterns.map(i => i.fundsRaised);
            const rVal = NayePankhAnalytics.calculateCorrelation(shares, funds);
            
            elements.correlationValue.textContent = rVal;
            elements.corrNarrativeVal.textContent = rVal;
        } else {
            elements.correlationValue.textContent = 'N/A';
            elements.corrNarrativeVal.textContent = '0.0';
        }

        // C. Forecasting calculations
        const forecastObj = NayePankhAnalytics.forecastTrends(state.impactHistory);
        elements.rSquaredVal.textContent = forecastObj.rSquared;
        elements.forecastSlope.textContent = '₹' + Math.round(forecastObj.slope).toLocaleString('en-IN');
        elements.forecastIntercept.textContent = '₹' + Math.round(forecastObj.intercept).toLocaleString('en-IN');

        // Build Forecasting Table
        let tableHtml = `
            <table style="width: 100%; font-size:12px; margin-top:12px;">
                <thead>
                    <tr style="background:var(--bg-darker); border-bottom:1px solid var(--border-color);">
                        <th style="padding: 10px;">Forecast Period</th>
                        <th style="padding: 10px; text-align:right;">Projected Fundraising</th>
                        <th style="padding: 10px; text-align:right;">Target Beneficiaries</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        forecastObj.forecasts.forEach(f => {
            // Estimate lives reached from general average conversion (approx 1 live reached per 80 INR raised)
            const estImpact = Math.round(f.projectedFunds / 76);
            tableHtml += `
                <tr style="border-bottom:1px solid var(--border-color);">
                    <td style="padding: 10px;"><strong>${f.label}</strong> (Projected)</td>
                    <td style="padding: 10px; text-align:right; font-weight:700; color:var(--primary-light);">₹${f.projectedFunds.toLocaleString('en-IN')}</td>
                    <td style="padding: 10px; text-align:right; font-weight:600;">~${estImpact.toLocaleString()} individuals</td>
                </tr>
            `;
        });
        tableHtml += `</tbody></table>`;
        elements.forecastTableContainer.innerHTML = tableHtml;
    }

    // ==========================================================================
    // 7. Executive Report Generation
    // ==========================================================================
    function compileExecutiveReport() {
        const campaignFilter = elements.reportCampaign.value;
        
        // Filter donations for reporting scope
        const reportDonations = state.donations.filter(d => 
            campaignFilter === 'All' || d.campaign === campaignFilter
        );

        const reportHtml = NayePankhReports.generateExecutiveReport(
            { campaign: campaignFilter },
            reportDonations,
            state.interns,
            NayePankhAnalytics
        );

        elements.reportPrintContainer.innerHTML = reportHtml;
    }

    // ==========================================================================
    // 8. CSV Parsing / Playground Sandboxing
    // ==========================================================================
    function processUploadedCSV(text) {
        try {
            const lines = text.split('\n');
            if (lines.length < 2) throw new Error("File empty or invalid format.");
            
            const rawDonations = [];
            const header = lines[0].split(',').map(h => h.trim().toLowerCase());
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                // Basic CSV line parser handling double-quotes
                const row = [];
                let inQuotes = false;
                let current = '';
                
                for (let c = 0; c < line.length; c++) {
                    const char = line[c];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        row.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                row.push(current.trim());

                if (row.length < 4) continue; // Skip incomplete records

                // Map fields to donation properties
                const dateVal = new Date(row[0] || '2025-01-01');
                const campaignName = row[1] || 'Education for All';
                
                // Derive campaign ID helper
                let campaignId = 'edu';
                if (campaignName.includes('Hygiene') || campaignName.includes('Health')) campaignId = 'health';
                else if (campaignName.includes('Hunger') || campaignName.includes('Meals')) campaignId = 'hunger';
                else if (campaignName.includes('Animal') || campaignName.includes('Stray')) campaignId = 'animals';
                else if (campaignName.includes('Winter') || campaignName.includes('Blanket')) campaignId = 'winter';

                rawDonations.push({
                    id: `TXN-PLAY-${999000 + i}`,
                    date: dateVal,
                    dateString: isNaN(dateVal.getTime()) ? '2025-01-01' : dateVal.toISOString().split('T')[0],
                    campaign: campaignName,
                    campaignId: campaignId,
                    donorType: row[2] || 'Individual',
                    amount: parseFloat(row[3]) || 500,
                    location: row[4] || 'Maharashtra',
                    paymentMethod: row[5] || 'UPI/Google Pay',
                    impactUnits: parseInt(row[6]) || 1,
                    unitName: row[7] || 'Beneficiary Units'
                });
            }

            if (rawDonations.length === 0) {
                alert("Could not extract any valid rows from CSV. Check headers and structure.");
                return;
            }

            // Successfully parsed! Set state donations
            state.donations = rawDonations;
            state.table.currentPage = 1;
            
            // Re-render
            updateDashboardView();
            compileExecutiveReport();
            
            // Success indicator
            alert(`Playground updated successfully with ${rawDonations.length} transactions!`);
        } catch (err) {
            console.error(err);
            alert("Failed to parse CSV file: " + err.message);
        }
    }

    // ==========================================================================
    // 9. Event Listeners Registry
    // ==========================================================================
    function setupEventListeners() {
        // Theme Switcher
        elements.themeToggle.addEventListener('click', () => {
            state.theme = state.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', state.theme);
        });

        // View Switching Sidebar Links
        elements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update nav classes
                elements.navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Get target view
                const viewName = item.getAttribute('data-view');
                state.currentView = viewName;
                
                // Update view headers
                let title = 'Performance Analytics';
                let desc = 'Aggregated operational metrics for NayePankh social initiatives.';
                
                if (viewName === 'explorer') {
                    title = 'Data Ledger Explorer';
                    desc = 'Sort, search, and audit raw transaction histories.';
                } else if (viewName === 'trends') {
                    title = 'Trends & Statistical Modeling';
                    desc = 'Pearson correlations, seasonal indexing, and linear regressions.';
                } else if (viewName === 'reports') {
                    title = 'Executive Report Builder';
                    desc = 'Generate formatted, print-ready compliance reports.';
                }
                
                elements.viewTitle.textContent = title;
                elements.viewDesc.textContent = desc;

                // Show target panel
                elements.views.forEach(view => {
                    view.classList.remove('active-view');
                    if (view.id === `${viewName}-view`) {
                        view.classList.add('active-view');
                    }
                });

                // Trigger re-render to load widgets
                updateDashboardView();
            });
        });

        // Filter Inputs Changes
        const triggerFiltersUpdate = () => {
            state.filters.campaign = elements.filterCampaign.value;
            state.filters.location = elements.filterState.value;
            state.filters.donorType = elements.filterDonor.value;
            state.filters.startDate = elements.filterStartDate.value;
            
            // Reset to page 1 in explorer
            state.table.currentPage = 1;
            
            // Update UI
            updateDashboardView();
        };

        elements.filterCampaign.addEventListener('change', triggerFiltersUpdate);
        elements.filterState.addEventListener('change', triggerFiltersUpdate);
        elements.filterDonor.addEventListener('change', triggerFiltersUpdate);
        elements.filterStartDate.addEventListener('change', triggerFiltersUpdate);

        // Clear / Reset Filters
        elements.btnResetFilters.addEventListener('click', () => {
            elements.filterCampaign.value = 'All';
            elements.filterState.value = 'All';
            elements.filterDonor.value = 'All';
            elements.filterStartDate.value = '2025-01-01';
            triggerFiltersUpdate();
        });

        // Export Filtered Table as CSV
        elements.btnExportAll.addEventListener('click', () => {
            const currentFiltered = getFilteredDonations();
            NayePankhReports.exportToCSV(currentFiltered, 'nayepankh_donations_filtered.csv');
        });

        // Playground toggle panel
        elements.btnImportToggle.addEventListener('click', () => {
            const disp = elements.playgroundUpload.style.display;
            elements.playgroundUpload.style.display = disp === 'none' ? 'block' : 'none';
        });

        // Drag & Drop File Upload listeners
        const dropZone = elements.dropZone;
        
        dropZone.addEventListener('click', () => {
            elements.fileUploader.click();
        });

        elements.fileUploader.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => processUploadedCSV(evt.target.result);
                reader.readAsText(file);
            }
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => processUploadedCSV(evt.target.result);
                reader.readAsText(file);
            }
        });

        // Search Explorer Data Table
        elements.tableSearch.addEventListener('input', (e) => {
            state.table.searchQuery = e.target.value;
            state.table.currentPage = 1;
            renderExplorerTable(getFilteredDonations());
        });

        // Sorting in Data Table Columns
        elements.tableHeaders.forEach(th => {
            th.addEventListener('click', () => {
                const sortField = th.getAttribute('data-sort');
                if (!sortField) return;

                if (state.table.sortColumn === sortField) {
                    // Toggle order
                    state.table.sortOrder = state.table.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    state.table.sortColumn = sortField;
                    state.table.sortOrder = 'asc';
                }

                // Re-sort and render
                renderExplorerTable(getFilteredDonations());
            });
        });

        // Pagination buttons
        elements.btnPrevPage.addEventListener('click', () => {
            if (state.table.currentPage > 1) {
                state.table.currentPage--;
                renderExplorerTable(getFilteredDonations());
            }
        });

        elements.btnNextPage.addEventListener('click', () => {
            state.table.currentPage++;
            renderExplorerTable(getFilteredDonations());
        });

        // Executive Report Build triggers
        elements.btnCompileReport.addEventListener('click', compileExecutiveReport);
        elements.reportCampaign.addEventListener('change', compileExecutiveReport);
        
        elements.btnPrintReport.addEventListener('click', () => {
            window.print();
        });
    }

    // Trigger initialization
    initializeApp();
});
