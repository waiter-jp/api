"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
/**
 * 順番カウンタースキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    counted_from: Date,
    place: Number // 何番目
}, {
    collection: 'sequences',
    id: true,
    read: 'primaryPreferred',
    safe: { j: 1, w: 'majority', wtimeout: 10000 },
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    toJSON: { getters: true },
    toObject: { getters: true }
});
exports.default = mongoose.model('Sequence', schema);
