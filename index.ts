import express from 'express';
import bodyParser from 'body-parser';
const app = express();
const jsonParser = bodyParser.json();
import cors from 'cors';
import { mongoInst } from './mongo';
import { Meta } from './types';

app.use(cors());

app.get('/workout/', async (req, res) => {
    let data = await mongoInst.getMeta();
    let strings = [data.current, repStrings(data).join(' | ')];

    strings.push(
        `${data[data.current].primaries[data[data.current].week - 1]} - ${
            data[data.current].secondaries[data[data.current].week - 1]
        }`
    );

    res.status(200).json({ message: strings.join('\n') });
});

function repStrings(data: Meta): string[] {
    return data.pct_layout[data[data.current].week - 1].map((pct, i) => {
        let weight = (Math.round((+data[data.current].weight * pct) / 5) * 5 - 45) / 2;
        let string = `${data.rep_layout[data[data.current].week - 1][i]} x `;
        while (weight > 45) {
            string += '45+';
            weight -= 45;
        }
        string += weight;
        return string;
    });
}

app.post('/workout/weight/', jsonParser, async (req, res) => {
    let data = await mongoInst.getMeta();
    data[data.current].weight += 10 * (req.body.increase ? 1 : -1);
    await mongoInst.updateMeta(data);
    res.status(200).send();
});

app.post('/workout/next/', async (req, res) => {
    let data = await mongoInst.getMeta();
    if (data.current == 'row' && data.row.week == 4) {
        await mongoInst.writeWeek('row', 4, repStrings(data), data.row.weight);
        data.order.forEach((ex, i) => {
            data[ex].week = 1;
            data[ex].weight += data.increases[i];
        });
        data.current = 'deadlift';
    } else {
        if (data[data.current].week == 1) {
            await mongoInst.writeNewMonth(data.current, data[data.current].weight, repStrings(data));
        } else {
            await mongoInst.writeWeek(
                data.current,
                data[data.current].week,
                repStrings(data),
                data[data.current].weight
            );
        }

        let curr = data.order.findIndex(el => el == data.current);
        data[data.current].week++;
        data.current = data.order[curr == data.order.length - 1 ? 0 : curr + 1];
    }

    await mongoInst.updateMeta(data);
    res.status(200).send();
});

app.listen(process.env.PORT || 3001, async () => {
    console.log('server is running');
    await mongoInst.run();
});
