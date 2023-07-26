import { event as eventTable } from "../../server/db/schema.js";
import dump from "./dump.json" assert { type: "json" };
import users from "./users.json" assert { type: "json" };
import BetterSqlite3 from "better-sqlite3";
import { drizzle } from 'drizzle-orm/better-sqlite3';

const db = drizzle(BetterSqlite3("sqlite.db"));

/**
 * @typedef Course
 * @property {string} id
 * @property {string} liveProviderURL
 * @property {string} name
 * @property {number} date
 * @property {import("$lib/server/db/schema.js").Tag[]} tags
 * @property {import("orienteering-js/models").Leg[]} legs
 * @property {import("orienteering-js/models").Control[]} course
 * @property {number} timeOffset
 * @property {import("orienteering-js/models").Runner[]} runners
 */

/** @type {any} */
const dbDump = dump

/** @type {Course[]} */
const courses = dbDump

for (const course of courses) {
    db
        .insert(eventTable)
        .values({
            id: course.id,
            name: course.name,
            startTime: new Date(),
            finishTime: new Date(),
            publishTime: new Date()
        })
        .run()

    break;
}