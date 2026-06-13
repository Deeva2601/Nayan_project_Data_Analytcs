/**
 * NayePankh Foundation - Data Analytics Dashboard
 * Analytics Module (analytics.js)
 * 
 * Provides mathematical and statistical utilities:
 * 1. KPI Aggregations (Totals, Averages, MoM Growth)
 * 2. Pearson Correlation Coefficient (Outreach vs Fundraising)
 * 3. Seasonality & Trend Analysis
 * 4. Simple Linear Regression for 3-Month Projections
 */

const NayePankhAnalytics = {
    
    /**
     * Calculates base metrics for a given list of donations
     */
    calculateDonationKPIs(donations) {
        if (!donations || donations.length === 0) {
            return { totalRaised: 0, avgDonation: 0, txnCount: 0, totalImpact: 0 };
        }
        
        let totalRaised = 0;
        let totalImpact = 0;
        
        for (let i = 0; i < donations.length; i++) {
            totalRaised += donations[i].amount;
            totalImpact += donations[i].impactUnits || 0;
        }
        
        const txnCount = donations.length;
        const avgDonation = Math.round(totalRaised / txnCount);
        
        return {
            totalRaised,
            avgDonation,
            txnCount,
            totalImpact
        };
    },

    /**
     * Calculates month-over-month growth from historical impact timeline
     */
    calculateMoMGrowth(historicalData) {
        if (historicalData.length < 2) return { fundsGrowth: 0, impactGrowth: 0 };
        
        const currentMonth = historicalData[historicalData.length - 1];
        const prevMonth = historicalData[historicalData.length - 2];
        
        const fundsGrowth = ((currentMonth.fundsRaised - prevMonth.fundsRaised) / prevMonth.fundsRaised) * 100;
        const impactGrowth = ((currentMonth.peopleReached - prevMonth.peopleReached) / prevMonth.peopleReached) * 100;
        
        return {
            fundsGrowth: parseFloat(fundsGrowth.toFixed(1)),
            impactGrowth: parseFloat(impactGrowth.toFixed(1))
        };
    },

    /**
     * Calculates the Pearson Correlation Coefficient (r) between two arrays
     * Formula: r = Cov(x, y) / (stdDev(x) * stdDev(y))
     */
    calculateCorrelation(xArray, yArray) {
        if (xArray.length !== yArray.length || xArray.length === 0) return 0;
        
        const n = xArray.length;
        
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumX2 = 0;
        let sumY2 = 0;
        
        for (let i = 0; i < n; i++) {
            const x = xArray[i];
            const y = yArray[i];
            
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
            sumY2 += y * y;
        }
        
        const numerator = (n * sumXY) - (sumX * sumY);
        const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
        
        if (denominator === 0) return 0;
        return parseFloat((numerator / denominator).toFixed(3));
    },

    /**
     * Analyzes monthly records to detect seasonal peaks and troughs
     */
    analyzeSeasonality(historicalData) {
        const monthTotals = Array(12).fill(0);
        const monthCounts = Array(12).fill(0);
        
        historicalData.forEach(record => {
            const month = record.date.getMonth();
            monthTotals[month] += record.fundsRaised;
            monthCounts[month] += 1;
        });

        // Compute average for each month of the year
        const monthlyAverages = monthTotals.map((total, idx) => {
            return monthCounts[idx] > 0 ? Math.round(total / monthCounts[idx]) : 0;
        });

        const overallAverage = monthlyAverages.reduce((a, b) => a + b, 0) / 12;

        // Calculate seasonality index (average for month / overall average)
        const seasonalityIndices = monthlyAverages.map(avg => {
            return overallAverage > 0 ? parseFloat((avg / overallAverage).toFixed(2)) : 1.0;
        });

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        // Find highest and lowest indices
        let peakIndex = 0;
        let troughIndex = 0;
        
        for (let i = 1; i < 12; i++) {
            if (seasonalityIndices[i] > seasonalityIndices[peakIndex]) peakIndex = i;
            if (seasonalityIndices[i] < seasonalityIndices[troughIndex]) troughIndex = i;
        }

        return {
            monthlyAverages,
            seasonalityIndices,
            peakMonth: monthNames[peakIndex],
            peakIndexValue: seasonalityIndices[peakIndex],
            troughMonth: monthNames[troughIndex],
            troughIndexValue: seasonalityIndices[troughIndex]
        };
    },

    /**
     * Performs a simple linear regression to project fundraising for the next 3 months
     * Formula: y = mx + c
     * m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX^2)
     * c = (sumY - m * sumX) / n
     */
    forecastTrends(historicalData, monthsToForecast = 3) {
        if (historicalData.length < 3) {
            return { forecasts: [], slope: 0, rSquared: 0 };
        }

        const n = historicalData.length;
        const x = Array.from({ length: n }, (_, i) => i); // x = 0, 1, 2...
        const y = historicalData.map(d => d.fundsRaised);

        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumX2 = 0;
        let sumY2 = 0;

        for (let i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += x[i] * y[i];
            sumX2 += x[i] * x[i];
            sumY2 += y[i] * y[i];
        }

        const denominator = (n * sumX2) - (sumX * sumX);
        if (denominator === 0) return { forecasts: [], slope: 0, rSquared: 0 };

        const slope = ((n * sumXY) - (sumX * sumY)) / denominator;
        const intercept = (sumY - (slope * sumX)) / n;

        // R-squared calculation to see goodness of fit
        const meanY = sumY / n;
        let ssTot = 0; // total sum of squares
        let ssRes = 0; // residual sum of squares

        for (let i = 0; i < n; i++) {
            const predY = (slope * x[i]) + intercept;
            ssTot += Math.pow(y[i] - meanY, 2);
            ssRes += Math.pow(y[i] - predY, 2);
        }
        
        const rSquared = ssTot === 0 ? 0 : parseFloat((1 - (ssRes / ssTot)).toFixed(3));

        // Generate forecasts
        const forecasts = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const lastDate = new Date(historicalData[n - 1].date);

        for (let i = 1; i <= monthsToForecast; i++) {
            const forecastX = n - 1 + i;
            const projectedFunds = Math.round((slope * forecastX) + intercept);
            
            const forecastDate = new Date(lastDate);
            forecastDate.setMonth(lastDate.getMonth() + i);
            const label = `${monthNames[forecastDate.getMonth()]} ${forecastDate.getFullYear()}`;

            forecasts.push({
                label,
                projectedFunds: projectedFunds > 0 ? projectedFunds : 0
            });
        }

        return {
            slope: parseFloat(slope.toFixed(2)),
            intercept: parseFloat(intercept.toFixed(2)),
            rSquared,
            forecasts
        };
    }
};

// Expose globally for browser environment
if (typeof window !== 'undefined') {
    window.NayePankhAnalytics = NayePankhAnalytics;
}
