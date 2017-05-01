import * as mongoose from 'mongoose';

/**
 * 順番カウンタースキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        counted_from: Date, // いつ順番を数え始めたか
        place: Number // 何番目
    },
    {
        collection: 'sequences',
        id: true,
        read: 'primaryPreferred',
        safe: <any>{ j: 1, w: 'majority', wtimeout: 10000 },
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

export default mongoose.model('Sequence', schema);
