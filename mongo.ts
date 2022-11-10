import { Collection, MongoClient } from 'mongodb';
import { Meta, Month } from './types';

const uri = '*sensitive data*';
const weeks = {
    1: 'first',
    2: 'second',
    3: 'third',
    4: 'fourth',
};

export class MongoInstance {
    client = new MongoClient(uri);
    db;

    async run() {
        try {
            await this.client.connect();

            this.db = this.client.db('nate-lifting');
        } catch (ex) {
            console.log(ex);
        }
    }

    async close() {
        await this.client.close();
    }

    getMeta(): Promise<Meta> {
        const collection: Collection = this.db.collection('meta');
        return collection.findOne<Meta>();
    }

    async updateMeta(data: Meta) {
        const collection: Collection = this.db.collection('meta');
        await collection.updateOne({}, { $set: data });
    }

    async writeNewMonth(exercise: string, weight: number, sets: string[]) {
        const collection: Collection = this.db.collection(exercise);
        let month = (await collection.countDocuments()) + 1;
        await collection.insertOne({
            month,
            onerm: [weight],
            first: sets,
            second: [],
            third: [],
            fourth: [],
        });
    }

    async writeWeek(exercise: string, week: number, sets: string[], weight: number) {
        const collection: Collection = this.db.collection(exercise);
        let curr: Month = await collection.find<Month>({}).sort({ month: -1 }).limit(1).next();
        curr[weeks[week]] = sets;
        !curr.onerm.includes(weight) && curr.onerm.push(weight);
        await collection.updateOne({ month: { $eq: curr.month } }, { $set: curr });
    }
}

export const mongoInst = new MongoInstance();
