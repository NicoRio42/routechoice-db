import { relations } from 'drizzle-orm';
import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from 'lucia';
import { TimeSpan, createDate } from 'oslo';
import { alphabet, generateRandomString } from 'oslo/crypto';

const id = text('id')
	.primaryKey()
	.notNull()
	.$defaultFn(() => generateId(15));

export const event = sqliteTable('event', {
	id,
	name: text('name').notNull(),
	startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
	finishTime: integer('finish_time', { mode: 'timestamp' }).notNull(),
	publishTime: integer('publish_time', { mode: 'timestamp' }).notNull()
});

export const eventsRelations = relations(event, ({ many }) => ({
	liveEvents: many(liveEvent),
	runners: many(runner),
	legs: many(leg),
	controlPoints: many(controlPoint),
	tags: many(assoEventTag)
}));

export const liveEvent = sqliteTable('live_event', {
	id,
	fkEvent: text('fk_event')
		.notNull()
		.references(() => event.id, { onDelete: 'cascade' }),
	liveProvider: text('live_provider').notNull(),
	url: text('url').notNull(),
	isPrimary: integer('is_primary', { mode: 'boolean' }).notNull()
});

export const liveEventsRelations = relations(liveEvent, ({ one }) => ({
	event: one(event, {
		fields: [liveEvent.fkEvent],
		references: [event.id]
	})
}));

export const file = sqliteTable('file', {
	id,
	fkEvent: text('fk_event')
		.references(() => event.id, { onDelete: 'cascade' })
		.notNull(),
	url: text('url').notNull(),
	name: text('name').notNull()
});

export const tag = sqliteTable('tag', {
	id: text('id').primaryKey(),
	name: text('name').notNull().unique(),
	color: text('color').notNull().unique()
});

export const assoEventTag = sqliteTable(
	'asso_event_tag',
	{
		fkEvent: text('fk_event').references(() => event.id, { onDelete: 'cascade' }),
		fkTag: text('fk_tag').references(() => tag.id, { onDelete: 'cascade' })
	},
	(table) => ({ pk: primaryKey({ columns: [table.fkEvent, table.fkTag] }) })
);

export const assoEventTagsRelations = relations(assoEventTag, ({ one }) => ({
	event: one(event, {
		fields: [assoEventTag.fkEvent],
		references: [event.id]
	})
}));

export const leg = sqliteTable('leg', {
	id,
	fkEvent: text('fk_event')
		.notNull()
		.references(() => event.id, { onDelete: 'cascade' }),
	fkStartControlPoint: text('fk_start_control_point')
		.notNull()
		.references(() => controlPoint.id, { onDelete: 'cascade' }),
	fkFinishControlPoint: text('fk_finish_control_point')
		.notNull()
		.references(() => controlPoint.id, { onDelete: 'cascade' })
});

export const legsRelations = relations(leg, ({ one, many }) => ({
	event: one(event, {
		fields: [leg.fkEvent],
		references: [event.id]
	}),
	startControlPoint: one(controlPoint, {
		fields: [leg.fkStartControlPoint],
		references: [controlPoint.id]
	}),
	finishControlPoint: one(controlPoint, {
		fields: [leg.fkFinishControlPoint],
		references: [controlPoint.id]
	}),
	routechoices: many(routechoice)
}));

export const controlPoint = sqliteTable('control_point', {
	id,
	fkEvent: text('fk_event')
		.notNull()
		.references(() => event.id, { onDelete: 'cascade' }),
	code: text('code').notNull(),
	longitude: real('longitude').notNull(),
	latitude: real('latitude').notNull()
});

export const controlPointsRelations = relations(controlPoint, ({ one }) => ({
	event: one(event, {
		fields: [controlPoint.fkEvent],
		references: [event.id]
	})
}));

export const routechoice = sqliteTable('routechoice', {
	id,
	name: text('name').notNull(),
	color: text('color').notNull(),
	fkLeg: text('fk_leg')
		.notNull()
		.references(() => leg.id, { onDelete: 'cascade' }),
	longitudes: text('longitudes').notNull(),
	latitudes: text('latitudes').notNull(),
	length: integer('length').notNull(),
	elevation: integer('elevation')
});

export const routechoicesRelations = relations(routechoice, ({ one }) => ({
	event: one(leg, {
		fields: [routechoice.fkLeg],
		references: [leg.id]
	})
}));

export const runner = sqliteTable('runner', {
	id: text('id').primaryKey(),
	fkEvent: text('fk_event')
		.notNull()
		.references(() => event.id, { onDelete: 'cascade' }),
	fkUser: text('fk_user').references(() => user.id, { onDelete: 'set null' }), // unique
	fkLiveEvent: text('fk_live_event').references(() => liveEvent.id, { onDelete: 'set null' }), // unique
	trackingDeviceId: text('tracking_device_id'),
	status: text('status', { enum: ['ok', 'not-ok'] }).notNull(),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
	time: integer('time'),
	rank: integer('rank'),
	timeBehind: integer('time_behind'),
	totalTimeLost: integer('total_time_lost').notNull().default(0),
	timeOffset: integer('time_offset').notNull().default(0)
});

export const runnersRelations = relations(runner, ({ one, many }) => ({
	event: one(event, {
		fields: [runner.fkEvent],
		references: [event.id]
	}),
	legs: many(runnerLeg)
}));

export const runnerLeg = sqliteTable('runner_leg', {
	id,
	fkDetectedRoutechoice: text('fk_detected_routechoice').references(() => routechoice.id, {
		onDelete: 'set null'
	}),
	fkManualRoutechoice: text('fk_manual_routechoice').references(() => routechoice.id, {
		onDelete: 'set null'
	}),
	fkLeg: text('fk_leg')
		.notNull()
		.references(() => leg.id, { onDelete: 'cascade' }),
	fkRunner: text('fk_runner')
		.notNull()
		.references(() => runner.id, { onDelete: 'cascade' }),
	timeOverall: integer('time_overall').notNull(),
	time: integer('time').notNull(),
	rankSplit: integer('rank_split').notNull(),
	timeBehindSplit: integer('time_behind_split').notNull(),
	rankOverall: integer('rank_overall'),
	timeBehindOverall: integer('time_behind_overall'),
	timeBehindSuperman: integer('time_behind_superman'),
	timeLoss: integer('time_loss').notNull(),
	routechoiceTimeLoss: integer('routechoice_time_loss').notNull()
});

export const runnerLegsRelations = relations(runnerLeg, ({ one }) => ({
	event: one(runner, {
		fields: [runnerLeg.fkRunner],
		references: [runner.id]
	})
}));

// AUTH

export const user = sqliteTable('auth_user', {
	id: text('id').primaryKey(),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	email: text('email').notNull(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
	passwordExpired: integer('password_expired', { mode: 'boolean' }).default(true).notNull(),
	role: text('role', { enum: ['admin', 'default'] })
		.default('default')
		.notNull()
});

export const session = sqliteTable('auth_session', {
	id: text('id').primaryKey().notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at').notNull()
});

export const key = sqliteTable('auth_key', {
	id,
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	hashedPassword: text('hashed_password')
});

const expiresAt = integer('expires_at', { mode: 'timestamp' })
	.notNull()
	.$defaultFn(() => createDate(new TimeSpan(15, 'm')));

export const emailVerificationCodeTable = sqliteTable('email_verification', {
	id,
	code: text('code')
		.notNull()
		.$defaultFn(() => generateRandomString(8, alphabet('0-9'))),
	fkUser: text('fk_user')
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt
});

export const passwordResetTokenTable = sqliteTable('password_reset', {
	id: text('id')
		.primaryKey()
		.notNull()
		.$defaultFn(() => generateId(40)),
	fkUser: text('fk_user')
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt
});
