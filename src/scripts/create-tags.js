import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { tag as tagTable } from '../lib/server/db/schema.js';
import { generateId } from 'lucia';

const db = drizzle(createClient({ url: 'file:sqlite.db' }));

const colors = [
	'#cc7d24',
	'#8d9614',
	'#24a451',
	'#00a99b',
	'#00a6df',
	'#0097fd',
	'#a27be7',
	'#e65da9',
	'#ef6061'
];

// export const TAGS = [
// 	{
// 		id: '32d749a7-62c5-4a17-87e2-f979e3e53916',
// 		name: 'PFCO',
// 		color: colors[0]
// 	},
// 	{
// 		id: 'b523f3e4-c9d5-424f-be69-bb6013b7028f',
// 		name: 'PFJ',
// 		color: colors[1]
// 	},
// 	{
// 		id: '9144b5a2-88f6-4cd4-b96c-b442dcc84bd1',
// 		name: 'GF -18',
// 		color: colors[2]
// 	},
// 	{
// 		id: '4f8b6d6b-20c8-4049-854b-e27f10ce1e5e',
// 		name: 'GF Se',
// 		color: colors[3]
// 	},
// 	{
// 		id: '9922a62d-1ca0-4b56-aca7-1eab7d3c1f5b',
// 		name: 'GF Ju',
// 		color: colors[4]
// 	}
// ];

export const TAGS = [
	{
		id: generateId(15),
		name: 'Sprint',
		color: colors[5]
	},
	{
		id: generateId(15),
		name: 'Forest',
		color: colors[6]
	},
	{
		id: generateId(15),
		name: 'Foreign teams',
		color: colors[7]
	}
];

db.insert(tagTable).values(TAGS).run();
