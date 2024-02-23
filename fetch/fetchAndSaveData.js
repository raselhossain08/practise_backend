// fetchAndSaveData.js

const axios = require('axios');
const PriceModel = require('../models/PriceModel');
const cron = require('node-cron');

cron.schedule('*/5 * * * *', async () => { // Run every 4 minutes
    try {
        const [usdtRes, clpRes] = await Promise.all([
            axios.get('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd'),
            axios.get('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=clp')
        ]);

        const usdtPrice = usdtRes.data.tether.usd;
        const clpPrice = clpRes.data.tether.clp;

        const priceData = new PriceModel({
            usdtPrice,
            clpPrice
        });

        await priceData.save();
        console.log(priceData)
        console.log('Data saved to MongoDB successfully!');
    } catch (error) {
        console.error('Error fetching or saving data:', error);
    }
});
cron.schedule('0 0 */6 * *', async () => { // Runs every 6 hours
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 15); // Calculate the date 15 days ago

        // Delete documents older than 15 days
        await PriceModel.deleteMany({ createdAt: { $lt: cutoffDate } });
        console.log('Data older than 15 days deleted successfully!');
    } catch (error) {
        console.error('Error deleting old data:', error);
    }
});