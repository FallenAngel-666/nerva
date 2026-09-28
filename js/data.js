const mockData = {
    hospitality: {
        kpis: [
            { label: "Occupancy", value: "78%", trend: "+6.4%", isPositive: true },
            { label: "Revenue", value: "₹4.82L", trend: "+8.2%", isPositive: true },
            { label: "Active Operations", value: "142", trend: "Normal", isPositive: true },
            { label: "Staff Utilization", value: "82%", trend: "+2.1%", isPositive: true },
            { label: "AI Risk Score", value: "23 / 100", trend: "-5.0%", isPositive: true },
            { label: "Predicted Issues", value: "4", trend: "+1", isPositive: false }
        ],
        predictions: [
            {
                title: "Housekeeping Bottleneck",
                riskLevel: "high",
                prob: 87,
                time: "1h 42m",
                impact: "23 room backlog, 17 delayed check-ins, 12% increase in waiting time",
                causes: [
                    "Occupancy increased by 13%",
                    "37 check-outs are expected in the next hour",
                    "Current housekeeping capacity is 28 rooms/hour",
                    "Only 8 housekeeping employees are currently available"
                ],
                action: "Reallocate 2 staff members to housekeeping and prioritize 11 early check-outs."
            },
            {
                title: "Restaurant Inventory Shortage",
                riskLevel: "medium",
                prob: 64,
                time: "5h 20m",
                impact: "Menu items unavailable, 8% drop in dinner revenue",
                causes: [
                    "Supplier delay of 2 hours reported",
                    "High dinner reservation count (92%)",
                    "Current inventory of key items below threshold"
                ],
                action: "Order emergency stock from secondary local supplier."
            },
            {
                title: "Staff Overcapacity",
                riskLevel: "low",
                prob: 31,
                time: "Tomorrow",
                impact: "Unnecessary labor cost of ₹4,500",
                causes: [
                    "Projected occupancy drops to 65% tomorrow",
                    "Current roster has 15 front desk staff scheduled"
                ],
                action: "Offer voluntary time off to 2 front desk staff."
            }
        ]
    },
    retail: {
        kpis: [
            { label: "Footfall", value: "1,240", trend: "+12%", isPositive: true },
            { label: "Sales Revenue", value: "₹8.5L", trend: "+4%", isPositive: true },
            { label: "Conversion Rate", value: "18%", trend: "-2%", isPositive: false },
            { label: "Checkout Queue", value: "14 mins", trend: "+5 mins", isPositive: false },
            { label: "AI Risk Score", value: "35 / 100", trend: "Warning", isPositive: false },
            { label: "Predicted Issues", value: "2", trend: "Normal", isPositive: true }
        ],
        predictions: [
            {
                title: "Stockout: Electronics Aisle",
                riskLevel: "high",
                prob: 92,
                time: "45 mins",
                impact: "Loss of ₹45,000 in potential sales, lower customer satisfaction",
                causes: [
                    "Unusual spike in demand for smartwatches",
                    "Current shelf stock is 3 units",
                    "Warehouse refill normally takes 2 hours"
                ],
                action: "Dispatch immediate restock from backroom to Electronics Aisle."
            }
        ]
    },
    finance: {
        kpis: [
            { label: "Txn Volume", value: "18.4K/s", trend: "+2.1%", isPositive: true },
            { label: "Fraud Blocks", value: "42", trend: "+15%", isPositive: true },
            { label: "System Latency", value: "45ms", trend: "Normal", isPositive: true },
            { label: "Liquidity Ratio", value: "1.4", trend: "Stable", isPositive: true },
            { label: "AI Risk Score", value: "12 / 100", trend: "Good", isPositive: true },
            { label: "Predicted Anomalies", value: "1", trend: "Review", isPositive: false }
        ],
        predictions: [
            {
                title: "Coordinated Fraud Attempt",
                riskLevel: "high",
                prob: 89,
                time: "Imminent",
                impact: "Potential exposure of ₹2.5M across 40 accounts",
                causes: [
                    "Multiple small test transactions from matching IP subnet",
                    "Velocity of new payee additions increased by 400%",
                    "Bypassing normal geolocation patterns"
                ],
                action: "Temporarily freeze flagged IP subnet and require 2FA for new payees."
            }
        ]
    },
    events: {
        kpis: [
            { label: "Check-ins", value: "4,500", trend: "85%", isPositive: true },
            { label: "Gate Density", value: "High", trend: "Warning", isPositive: false },
            { label: "Food Stalls", value: "Operational", trend: "Normal", isPositive: true },
            { label: "Security Staff", value: "100%", trend: "Active", isPositive: true },
            { label: "AI Risk Score", value: "42 / 100", trend: "+10", isPositive: false },
            { label: "Predicted Issues", value: "3", trend: "Action Req", isPositive: false }
        ],
        predictions: [
            {
                title: "Gate B Congestion",
                riskLevel: "high",
                prob: 95,
                time: "20 mins",
                impact: "Wait times exceeding 45 minutes, safety hazard",
                causes: [
                    "Train arrival offloaded 1,200 people",
                    "Gate B scanners operating at 80% efficiency",
                    "Crowd density approaching critical limit in Sector 2"
                ],
                action: "Redirect incoming crowd to Gate C and open 4 emergency scanning lanes at Gate B."
            }
        ]
    }
};

const graphData = {
    nodes: [
        { id: 1, label: 'Room 304', group: 'room' },
        { id: 2, label: 'Booking #8392', group: 'booking' },
        { id: 3, label: 'Guest: Rahul', group: 'guest' },
        { id: 4, label: 'Staff 12', group: 'employee' },
        { id: 5, label: 'Housekeeping Req', group: 'service' },
        { id: 6, label: 'Payment #112', group: 'payment' },
        { id: 7, label: 'Restaurant', group: 'restaurant' },
    ],
    edges: [
        { from: 3, to: 2, label: 'made' },
        { from: 2, to: 1, label: 'assigned to' },
        { from: 1, to: 5, label: 'needs' },
        { from: 5, to: 4, label: 'assigned to' },
        { from: 2, to: 6, label: 'paid via' },
        { from: 3, to: 7, label: 'dined at' }
    ]
};
