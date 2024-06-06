import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { generateId } from 'lucia';
import { tag as tagTable } from '../lib/server/db/schema.js';
// import { env } from 'node:process';

const db = drizzle(createClient({ url: 'file:sqlite.db' }));

// const db = drizzle(
// 	createClient({
// 		url: 'libsql://routechoice-db-routechoice-db.turso.io',
// 		authToken: env.TURSO_DB_TOKEN
// 	})
// );

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

export const TAGS = [
	{
		id: generateId(15),
		name: 'PFCO',
		color: colors[0]
	},
	{
		id: generateId(15),
		name: 'PFJ',
		color: colors[1]
	},
	{
		id: generateId(15),
		name: 'GF -18',
		color: colors[2]
	},
	{
		id: generateId(15),
		name: 'GF Se',
		color: colors[3]
	},
	{
		id: generateId(15),
		name: 'GF Ju',
		color: colors[4]
	},
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
		name: 'Other foreign events',
		color: colors[7]
	}
];

db.insert(tagTable).values(TAGS).run();
