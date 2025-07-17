// Netlify Function for Health Check
exports.handler = async (event, context) => {
    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            service: 'Zeeky AI',
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'production'
        })
    };

    return response;
};
