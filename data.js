/**
 * NayePankh Foundation - Data Analytics Dashboard
 * Data Module (data.js)
 * 
 * Provides deterministic, seed-based datasets representing real-world operational scale:
 * 1. Historical Monthly Impact (2023 - 2026)
 * 2. Donations Log (250+ granular transactions)
 * 3. Youth Interns Performance Tracker (~100 interns)
 */

// Seeded random helper to keep data consistent across refreshes
function SeededRandom(seed) {
    let m = 0x80000000; // 2**31
    let a = 1103515245;
    let c = 12345;
    let state = seed ? seed : Math.floor(Math.random() * (m - 1));

    return function() {
        state = (a * state + c) % m;
        return state / (m - 1);
    };
}

const rnd = SeededRandom(42); // Seeded for consistent, realistic charts

// Base Configurations
const CAMPAIGNS = [
    { id: 'edu', name: 'Education for All', target: 'Children', costPerUnit: 1200, unitName: 'School Kits' },
    { id: 'health', name: 'Hygiene & Health', target: 'Women & Girls', costPerUnit: 250, unitName: 'Sanitary Kits' },
    { id: 'hunger', name: 'Hunger Relief Drive', target: 'Needy Families & Animals', costPerUnit: 50, unitName: 'Meals Provided' },
    { id: 'animals', name: 'Stray Animal Welfare', target: 'Stray Animals', costPerUnit: 80, unitName: 'Treatments/Feeds' },
    { id: 'winter', name: 'Winter Essentials', target: 'Homeless Families', costPerUnit: 450, unitName: 'Blankets/Clothes' }
];

const STATES = [
    'Maharashtra', 'Delhi NCR', 'Karnataka', 'Uttar Pradesh', 'West Bengal', 
    'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Haryana', 'Madhya Pradesh'
];

const DONOR_TYPES = ['Individual', 'Corporate CSR', 'Youth Group', 'Recurring Sponsor'];
const PAYMENT_METHODS = ['UPI/Google Pay', 'Net Banking', 'Credit/Debit Card', 'Razorpay Gateway'];

const COLLEGES = [
    'Delhi University (DU)', 'Mumbai University (MU)', 'IIT Bombay', 'Christ University, Bangalore',
    'Amity University', 'VIT Vellore', 'SRM Chennai', 'Symbiosis Pune', 'IP University, Delhi',
    'BITS Pilani', 'LPU Punjab', 'DTU Delhi'
];

const FIRST_NAMES = [
    'Aarav', 'Ananya', 'Aditya', 'Diya', 'Vihaan', 'Ira', 'Arjun', 'Sanya', 'Sai', 'Prisha',
    'Kabir', 'Riya', 'Rohan', 'Kavya', 'Reyansh', 'Ishani', 'Ishaan', 'Meera', 'Krishna', 'Tanvi',
    'Rahul', 'Sneha', 'Aman', 'Shruti', 'Dev', 'Nisha', 'Vikram', 'Priya', 'Kunal', 'Neha'
];

const LAST_NAMES = [
    'Sharma', 'Verma', 'Gupta', 'Patel', 'Reddy', 'Nair', 'Singh', 'Kumar', 'Joshi', 'Mehta',
    'Sen', 'Roy', 'Iyer', 'Deshmukh', 'Mishra', 'Pandey', 'Saxena', 'Choudhury', 'Rao', 'Bahl'
];

// Helper to choose item from array using seeded random
function pick(arr) {
    return arr[Math.floor(rnd() * arr.length)];
}

// Generate Monthly Impact History (Jan 2023 - May 2026)
function generateImpactHistory() {
    const data = [];
    const startDate = new Date(2023, 0, 1);
    const endDate = new Date(2026, 4, 30); // May 2026
    let currentDate = new Date(startDate);
    
    // Baseline numbers that grow over time
    let basePeopleImpacted = 3500;
    let baseAnimalsImpacted = 400;
    let baseFundsRaised = 180000;

    while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const monthNum = currentDate.getMonth();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthLabel = `${monthNames[monthNum]} ${year}`;

        // Seasonality factors
        let seasonalFactor = 1.0;
        if (monthNum === 11 || monthNum === 0) { // Dec/Jan: Winter clothing drive peaks
            seasonalFactor = 1.45;
        } else if (monthNum === 4 || monthNum === 5) { // May/Jun: School re-opening peaks
            seasonalFactor = 1.30;
        } else if (monthNum === 9) { // Oct: Diwali/Festive giving
            seasonalFactor = 1.20;
        }

        // Add some random variance (-10% to +15%)
        const variance = 0.9 + (rnd() * 0.25);
        
        // Month-over-month compound growth (~2.5% per month)
        basePeopleImpacted *= 1.025;
        baseAnimalsImpacted *= 1.018;
        baseFundsRaised *= 1.022;

        const monthlyFunds = Math.round(baseFundsRaised * seasonalFactor * variance);
        const monthlyPeople = Math.round(basePeopleImpacted * seasonalFactor * variance);
        const monthlyAnimals = Math.round(baseAnimalsImpacted * (0.95 + rnd() * 0.15));
        
        // Impact division by campaigns
        const eduImpact = Math.round(monthlyPeople * 0.25);
        const healthImpact = Math.round(monthlyPeople * 0.35);
        const hungerImpact = Math.round(monthlyPeople * 0.30);
        const winterImpact = (monthNum === 10 || monthNum === 11 || monthNum === 0) ? Math.round(monthlyPeople * 0.40) : 0;
        
        data.push({
            date: new Date(currentDate),
            label: monthLabel,
            fundsRaised: monthlyFunds,
            peopleReached: monthlyPeople + winterImpact,
            animalsFed: monthlyAnimals,
            eduKitsDistributed: Math.round(eduImpact / 3),
            sanitaryPadsDistributed: Math.round(healthImpact * 1.5),
            mealsDistributed: Math.round(hungerImpact * 4),
            activeDistricts: Math.round(15 + (currentDate.getFullYear() - 2023) * 8 + (rnd() * 5))
        });

        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return data;
}

// Generate Granular Donation Transactions
function generateDonations(count = 280) {
    const donations = [];
    const baseDate = new Date(2025, 0, 1); // Focused on Jan 2025 - May 2026 for high-resolution insights
    
    for (let i = 0; i < count; i++) {
        // Date spread
        const dayOffset = Math.floor(rnd() * 510); // Spread across ~17 months
        const date = new Date(baseDate);
        date.setDate(date.getDate() + dayOffset);

        const campaign = pick(CAMPAIGNS);
        const donorType = pick(DONOR_TYPES);
        const location = pick(STATES);
        const paymentMethod = pick(PAYMENT_METHODS);

        // Compute realistic donation amounts based on donor type
        let amount = 0;
        if (donorType === 'Corporate CSR') {
            amount = Math.round(50000 + rnd() * 150000); // 50k - 200k
        } else if (donorType === 'Youth Group') {
            amount = Math.round(5000 + rnd() * 25000);   // 5k - 30k
        } else if (donorType === 'Recurring Sponsor') {
            amount = Math.round(2000 + rnd() * 8000);     // 2k - 10k
        } else { // Individual
            // Zipf-like distribution for individuals (lots of small, few large)
            const roll = rnd();
            if (roll < 0.6) {
                amount = Math.round(250 + rnd() * 1000);   // 250 - 1250 INR
            } else if (roll < 0.9) {
                amount = Math.round(1500 + rnd() * 4500);  // 1.5k - 6k INR
            } else {
                amount = Math.round(7500 + rnd() * 15000); // 7.5k - 22.5k INR
            }
        }

        // Adjust amount seasonally
        const month = date.getMonth();
        if ((campaign.id === 'winter' && (month === 11 || month === 0)) ||
            (campaign.id === 'edu' && (month === 4 || month === 5))) {
            amount = Math.round(amount * 1.35); // Boost seasonal fundraising
        }

        // Calculate impact units funded
        const impactUnits = Math.floor(amount / campaign.costPerUnit);

        donations.push({
            id: `TXN-${20250000 + i}`,
            date: date,
            dateString: date.toISOString().split('T')[0],
            campaign: campaign.name,
            campaignId: campaign.id,
            donorType: donorType,
            amount: amount,
            location: location,
            paymentMethod: paymentMethod,
            impactUnits: impactUnits > 0 ? impactUnits : 1,
            unitName: campaign.unitName
        });
    }

    // Sort by date descending
    return donations.sort((a, b) => b.date - a.date);
}

// Generate Youth Intern Performance Tracking
function generateInterns(count = 95) {
    const interns = [];
    
    for (let i = 0; i < count; i++) {
        const id = `INT-${202600 + i}`;
        const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
        const college = pick(COLLEGES);
        const campaign = pick(CAMPAIGNS);
        
        // Intern output metrics
        // Strong positive correlation between social media shares and funds raised
        const shares = Math.round(5 + rnd() * 45); // 5 to 50 social posts shared
        
        // Base fundraising capacity (highly tied to social shares with some noise)
        const multiplier = 400 + (rnd() * 300);
        let fundsRaised = Math.round(shares * multiplier + (rnd() * 4000));
        
        // Corporate CSR teams might have boosted amounts
        if (rnd() < 0.15) {
            fundsRaised += Math.round(15000 + rnd() * 30000); 
        }

        const volunteersRecruited = Math.round(shares * 0.2 + (rnd() * 4));
        const hoursContributed = Math.round(20 + shares * 0.8 + (rnd() * 15));
        
        // Performance rating
        let performance = 'Silver Partner';
        if (fundsRaised > 25000 || shares > 35) {
            performance = 'Gold Partner';
        }
        if (fundsRaised > 50000 && shares > 40) {
            performance = 'Elite Leader';
        }
        if (fundsRaised < 8000) {
            performance = 'Bronze Member';
        }

        interns.push({
            id: id,
            name: name,
            college: college,
            campaign: campaign.name,
            campaignId: campaign.id,
            socialShares: shares,
            fundsRaised: fundsRaised,
            volunteersRecruited: volunteersRecruited,
            hoursContributed: hoursContributed,
            tier: performance
        });
    }

    // Sort by funds raised descending
    return interns.sort((a, b) => b.fundsRaised - a.fundsRaised);
}

// Export raw structures and seeding function
const NayePankhData = {
    campaigns: CAMPAIGNS,
    states: STATES,
    donorTypes: DONOR_TYPES,
    paymentMethods: PAYMENT_METHODS,
    colleges: COLLEGES,
    
    // Core data generators
    impactHistory: generateImpactHistory(),
    donations: generateDonations(),
    interns: generateInterns()
};

// Expose to global window scope for ease of use in browser scripts
if (typeof window !== 'undefined') {
    window.NayePankhData = NayePankhData;
}
