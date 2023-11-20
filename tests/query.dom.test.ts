import { and, not, or } from '../src/filter';
import { select } from '../src/query';
import { JSDOM } from 'jsdom';
import { sleep } from './utils';

function getDOM() {
    return new JSDOM('', {
        url: 'https://test.me/',
        referrer: 'https://test.me/',
        contentType: 'text/html',
        includeNodeLocations: true,
        storageQuota: 10000000
    });
}

describe('Testing JSQuery', () => {
    test('Identity filter', async() => {
        
        const { document } = getDOM().window;

        const someDiv = document.createElement('div');
        someDiv.classList.add('wolf');
        document.body.appendChild(someDiv);

        const queryResult = await select('div')
            .from(document)
            .run();
        
        expect(queryResult).toBeInstanceOf(Array);
        expect(queryResult).toHaveLength(1);

        const queryResult2 =
        await select('div')
            .from(document)
            .where(node => node.classList.contains('sheep'))
            .run();
        
        expect(queryResult2).toBeInstanceOf(Array);
        expect(queryResult2).toHaveLength(0);
    });

    test('Single condition queries by classList', async() => {
        
        const { document } = getDOM().window;

        const someDiv = document.createElement('div');
        someDiv.classList.add('sheep');
        document.body.appendChild(someDiv);

        const queryResult = await select('div')
            .from(document)
            .where(node => {
                return node.classList.contains('wolf');
            })
            .run();
        
        expect(queryResult).toBeInstanceOf(Array);
        expect(queryResult).toHaveLength(0);

        const queryResult2 = await select('div')
            .from(document)
            .where(node => node.classList.contains('sheep'))
            .run();
        
        expect(queryResult2).toBeInstanceOf(Array);
        expect(queryResult2).toHaveLength(1);
    });

    test('Single async condition', async() => {
        
        const { document } = getDOM().window;

        const someDiv = document.createElement('div');
        someDiv.classList.add('sheep');
        document.body.appendChild(someDiv);

        const queryResult = await select('div')
            .from(document)
            .where(async node => {
                await sleep(2000);
                return node.classList.contains('sheep');
            })
            .run();
        
        expect(queryResult).toBeInstanceOf(Array);
        expect(queryResult).toHaveLength(1);
    });

    test('Multiple condition queries (intersection)', async() => {
        
        const { document } = getDOM().window;

        const someDiv = document.createElement('div');
        someDiv.classList.add('sheep');
        document.body.appendChild(someDiv);

        const queryResult = await select('div')
            .from(document)
            .where(
                and(
                    not(node => node.classList.contains('wolf')),
                    node => node.classList.contains('sheep')
                )
            )
            .run();
        
        expect(queryResult).toBeInstanceOf(Array);
        expect(queryResult).toHaveLength(1);
    });

    test('Multiple condition queries (union)', async() => {
        
        const { document } = getDOM().window;

        const someDiv = document.createElement('div');
        someDiv.classList.add('sheep');
        document.body.appendChild(someDiv);

        const someOtherDiv = document.createElement('div');
        someOtherDiv.classList.add('leet');
        document.body.appendChild(someOtherDiv);

        const queryResult = await select('div')
            .from(document)
            .where(
                not(node => node.classList.contains('wolf')),
                or(
                    node => node.classList.contains('leet'),
                    node => node.classList.contains('sheep')
                )
            )
            .run();
        
        expect(queryResult).toBeInstanceOf(Array);
        expect(queryResult).toHaveLength(2);
    });

    test('Multiple projection', async() => {
        
        const { document } = getDOM().window;

        const someDiv = document.createElement('div');
        someDiv.classList.add('sheep');
        document.body.appendChild(someDiv);

        const someOtherDiv = document.createElement('a');
        someOtherDiv.classList.add('leet');
        document.body.appendChild(someOtherDiv);

        const queryResult = await select('div, a')
            .from(document)
            .run();
        
        expect(queryResult).toBeInstanceOf(Array);
        expect(queryResult).toHaveLength(2);
        expect(queryResult[0].tagName).toBe('DIV');
        expect(queryResult[1].tagName).toBe('A');
    });

    test('Limit / Offset', async() => {
        
        const { document } = getDOM().window;

        const someDiv = document.createElement('div');
        someDiv.classList.add('sheep');
        document.body.appendChild(someDiv);

        const someOtherDiv = document.createElement('a');
        someOtherDiv.classList.add('leet');
        document.body.appendChild(someOtherDiv);

        const queryResult = await select('div, a')
            .from(document)
            .limit(1)
            .run();
        
        expect(queryResult).toBeInstanceOf(Array);
        expect(queryResult).toHaveLength(1);
        expect(queryResult[0].tagName).toBe('DIV');

        const queryResult2 = await select('div, a')
            .from(document)
            .limit(1)
            .offset(1)
            .run();
        
        expect(queryResult2).toBeInstanceOf(Array);
        expect(queryResult2).toHaveLength(1);
        expect(queryResult2[0].tagName).toBe('A');

        const queryResult3 = await select('div, a')
            .from(document)
            .offset(23) // Way out of index
            .run();
        
        expect(queryResult3).toBeInstanceOf(Array);
        expect(queryResult3).toHaveLength(0);
    });
});
