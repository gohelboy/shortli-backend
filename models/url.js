import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const urlSchema = new Schema({
    originalUrl: {
        type: String,
        required: true,
    },
    shortUrl: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Url = model('Url', urlSchema);

export default Url;

