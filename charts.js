/**
 * NayePankh Foundation - Data Analytics Dashboard
 * Visualizations Module (charts.js)
 * 
 * Manages the lifetime, styling, and data binding of Chart.js charts:
 * 1. Trend Growth Chart (Dual Axis Area/Line)
 * 2. Campaign Allocation (Doughnut)
 * 3. Regional Outreach (Horizontal Bar)
 * 4. Intern Productivity Matrix (Scatter Plot with trend indicators)
 */

const NayePankhCharts = {
    // Keep track of active chart instances to prevent double rendering/canvas errors
    instances: {},

    // Colors aligned with the CSS design system tokens
    colors: {
        primary: 'rgb(20, 184, 166)',
        primaryGlow: 'rgba(20, 184, 166, 0.15)',
        secondary: 'rgb(249, 115, 22)',
        secondaryGlow: 'rgba(249, 115, 22, 0.15)',
        accent: 'rgb(139, 92, 246)',
        accentGlow: 'rgba(139, 92, 246, 0.15)',
        info: 'rgb(14, 165, 233)',
        infoGlow: 'rgba(14, 165, 233, 0.15)',
        danger: 'rgb(239, 68, 68)',
        dangerGlow: 'rgba(239, 68, 68, 0.15)',
        text: '#94a3b8',
        grid: 'rgba(148, 163, 184, 0.08)'
    },

    /**
     * Set default global chart styles
     */
    initDefaults() {
        if (typeof Chart === 'undefined') return;

        Chart.defaults.color = this.colors.text;
        Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
        Chart.defaults.font.size = 11;
        Chart.defaults.plugins.tooltip.padding = 12;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
    },

    /**
     * 1. Dual-Axis Timeline Growth Chart (Line + Area)
     */
    renderTimelineChart(canvasId, timelineData) {
        this.destroyChart(canvasId);
        
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Create gradients
        const gradFunds = ctx.createLinearGradient(0, 0, 0, 300);
        gradFunds.addColorStop(0, 'rgba(20, 184, 166, 0.25)');
        gradFunds.addColorStop(1, 'rgba(20, 184, 166, 0.0)');

        const gradImpact = ctx.createLinearGradient(0, 0, 0, 300);
        gradImpact.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
        gradImpact.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

        const labels = timelineData.map(d => d.label);
        const funds = timelineData.map(d => d.fundsRaised);
        const impact = timelineData.map(d => d.peopleReached);

        this.instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Funds Raised (INR)',
                        data: funds,
                        borderColor: this.colors.primary,
                        backgroundColor: gradFunds,
                        fill: true,
                        tension: 0.35,
                        borderWidth: 2,
                        yAxisID: 'yFunds'
                    },
                    {
                        label: 'Lives Impacted',
                        data: impact,
                        borderColor: this.colors.accent,
                        backgroundColor: gradImpact,
                        fill: true,
                        tension: 0.35,
                        borderWidth: 2,
                        yAxisID: 'yImpact'
                    }
                ]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { boxWidth: 12, usePointStyle: true }
                    }
                },
                scales: {
                    x: {
                        grid: { color: this.colors.grid },
                        ticks: { maxTicksLimit: 12 }
                    },
                    yFunds: {
                        type: 'linear',
                        position: 'left',
                        grid: { color: this.colors.grid },
                        ticks: {
                            callback: (val) => '₹' + (val >= 100000 ? (val / 100000).toFixed(1) + 'L' : val)
                        },
                        title: { display: true, text: 'Funds (INR)' }
                    },
                    yImpact: {
                        type: 'linear',
                        position: 'right',
                        grid: { drawOnChartArea: false }, // Avoid duplicate grid lines
                        ticks: {
                            callback: (val) => val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val
                        },
                        title: { display: true, text: 'People Reached' }
                    }
                }
            }
        });
    },

    /**
     * 2. Campaign Allocation Doughnut Chart
     */
    renderCampaignChart(canvasId, donations) {
        this.destroyChart(canvasId);

        // Group donations by campaign
        const campaignMap = {};
        donations.forEach(d => {
            campaignMap[d.campaign] = (campaignMap[d.campaign] || 0) + d.amount;
        });

        const labels = Object.keys(campaignMap);
        const data = Object.values(campaignMap);

        const ctx = document.getElementById(canvasId).getContext('2d');

        this.instances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        this.colors.primary,
                        this.colors.secondary,
                        this.colors.accent,
                        this.colors.info,
                        this.colors.danger
                    ],
                    borderWidth: 2,
                    borderColor: '#1e293b' // Match card background
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { boxWidth: 10, usePointStyle: true, padding: 12 }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return ` ${context.label}: ₹${context.raw.toLocaleString('en-IN')} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '68%'
            }
        });
    },

    /**
     * 3. State-wise Geographic Performance (Horizontal Bar Chart)
     */
    renderStateChart(canvasId, donations) {
        this.destroyChart(canvasId);

        // Group amounts by state
        const stateMap = {};
        donations.forEach(d => {
            stateMap[d.location] = (stateMap[d.location] || 0) + d.amount;
        });

        // Sort states descending by amount raised
        const sortedStates = Object.entries(stateMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 7); // Limit to top 7 states

        const labels = sortedStates.map(item => item[0]);
        const data = sortedStates.map(item => item[1]);

        const ctx = document.getElementById(canvasId).getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 300, 0);
        grad.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
        grad.addColorStop(1, 'rgb(14, 165, 233)');

        this.instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Funds Raised (INR)',
                    data: data,
                    backgroundColor: grad,
                    borderRadius: 6,
                    borderWidth: 0,
                    barThickness: 16
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: this.colors.grid },
                        ticks: {
                            callback: (val) => '₹' + (val >= 1000 ? (val / 1000) + 'k' : val)
                        }
                    },
                    y: {
                        grid: { display: false }
                    }
                }
            }
        });
    },

    /**
     * 4. Intern Outreach & Fundraising Scatter Matrix
     */
    renderInternChart(canvasId, interns) {
        this.destroyChart(canvasId);

        // Map interns to {x: socialShares, y: fundsRaised, label: Name}
        const scatterData = interns.map(i => ({
            x: i.socialShares,
            y: i.fundsRaised,
            name: i.name,
            college: i.college
        }));

        const ctx = document.getElementById(canvasId).getContext('2d');

        this.instances[canvasId] = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Intern Performance',
                    data: scatterData,
                    backgroundColor: 'rgba(249, 115, 22, 0.65)',
                    borderColor: 'rgb(249, 115, 22)',
                    borderWidth: 1,
                    pointRadius: 6,
                    pointHoverRadius: 9
                }]
            },
            options: {
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const pt = context.raw;
                                return ` ${pt.name} (${pt.college.split(' ')[0]}) - Shares: ${pt.x}, Raised: ₹${pt.y.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: this.colors.grid },
                        title: { display: true, text: 'Social Media Shares (Shares Count)' }
                    },
                    y: {
                        grid: { color: this.colors.grid },
                        title: { display: true, text: 'Funds Raised (INR)' },
                        ticks: {
                            callback: (val) => '₹' + (val >= 1000 ? (val / 1000) + 'k' : val)
                        }
                    }
                }
            }
        });
    },

    /**
     * Safely destroy a chart instance if it exists
     */
    destroyChart(canvasId) {
        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
            delete this.instances[canvasId];
        }
    }
};

// Expose globally
if (typeof window !== 'undefined') {
    window.NayePankhCharts = NayePankhCharts;
}
