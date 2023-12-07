// index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { nanoid } from 'nanoid'
import Url from './models/url.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://gohelboy:gohelboy@cluster0.8pi1qmc.mongodb.net/urlShortener?retryWrites=true&w=majority');

const db = mongoose.connection;
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const validateAndSanitizeUrl = (url) => {
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    if (urlRegex.test(url)) { return url.trim(); }
    return null;
};

app.post('/shorten', async (req, res) => {
    const { originalUrl } = req.body;

    const cleanUrl = validateAndSanitizeUrl(originalUrl);
    if (!cleanUrl) return res.status(404).json({ status: false, message: "Invalid url format" });

    try {
        const shortUrl = nanoid(7);
        const url = new Url({ originalUrl: cleanUrl, shortUrl });
        await url.save();
        res.json(url);
    } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
    }
});


app.get('/get-urls', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const skip = (page - 1) * limit;
        const totalUrlsCount = await Url.countDocuments()
        const totalPages = Math.ceil(totalUrlsCount / limit);
        const urls = await Url.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        return res.status(200).json({ urls: urls, totalPages: totalPages, currentPage: page });
    } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
    }
})

app.get('/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;
    try {
        const url = await Url.findOne({ shortUrl });
        if (!url) return res.status(404).json('URL not found');
        res.status(200).json({ originalUrl: url.originalUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
    }
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
