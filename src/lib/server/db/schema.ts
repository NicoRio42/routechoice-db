import { relations } from 'drizzle-orm';
import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { RolesEnum } from '../../models/enums/roles.enum.js';
import { RunnerStatusEnum } from '../../models/enums/runner-status.enum.js';
import { generateId } from 'lucia';
import { TimeSpan, createDate } from 'oslo';
import { alphabet, generateRandomString } from 'oslo/crypto';
// import { RolesEnum } from '../../models/enums/roles.enum';
// import { RunnerStatusEnum } from '../../models/enums/runner-status.enum';

const id = text('id')
	.primaryKey()
	.notNull()
	.$defaultFn(() => generateId(15));

export const event = sqliteTable('event', {
	id: text('id').primaryKey(),
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

export type Event = typeof event.$inferSelect;

export const liveEvent = sqliteTable('live_event', {
	id: text('id').primaryKey(),
	fkEvent: text('fk_event')
		.notNull()
		.references(() => event.id, { onDelete: 'cascade' }),
	liveProvider: text('live_provider').notNull(),
	url: text('url').notNull(),
	isPrimary: integer('is_primary', { mode: 'boolean' }).notNull()
});

export type LiveEvent = typeof liveEvent.$inferSelect;

export const liveEventsRelations = relations(liveEvent, ({ one }) => ({
	event: one(event, {
		fields: [liveEvent.fkEvent],
		references: [event.id]
	})
}));

export const tag = sqliteTable('tag', {
	id: text('id').primaryKey(),
	name: text('name').notNull().unique(),
	color: text('color').notNull().unique()
});

export type Tag = typeof tag.$inferSelect;

export const assoEventTag = sqliteTable(
	'asso_event_tag',
	{
		fkEvent: text('fk_event').references(() => event.id, { onDelete: 'cascade' }),
		fkTag: text('fk_tag').references(() => tag.id, { onDelete: 'cascade' })
	},
	(table) => ({ pk: primaryKey(table.fkEvent, table.fkTag) })
);

export const assoEventTagsRelations = relations(assoEventTag, ({ one }) => ({
	event: one(event, {
		fields: [assoEventTag.fkEvent],
		references: [event.id]
	})
}));

export const leg = sqliteTable('leg', {
	id: text('id').primaryKey(),
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

export type Leg = typeof leg.$inferSelect;

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
	id: text('id').primaryKey(),
	fkEvent: text('fk_event')
		.notNull()
		.references(() => event.id, { onDelete: 'cascade' }),
	code: text('code').notNull(),
	longitude: real('longitude').notNull(),
	latitude: real('latitude').notNull()
});

export type ControlPoint = typeof controlPoint.$inferSelect;

export const controlPointsRelations = relations(controlPoint, ({ one }) => ({
	event: one(event, {
		fields: [controlPoint.fkEvent],
		references: [event.id]
	})
}));

export const routechoice = sqliteTable('routechoice', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	color: text('color').notNull(),
	fkLeg: text('fk_leg')
		.notNull()
		.references(() => leg.id, { onDelete: 'cascade' }),
	longitudes: text('longitudes').notNull(),
	latitudes: text('latitudes').notNull(),
	length: integer('length').notNull()
});

export type Routechoice = typeof routechoice.$inferSelect;

export const routechoicesRelations = relations(routechoice, ({ one }) => ({
	event: one(leg, {
		fields: [routechoice.fkLeg],
		references: [leg.id]
	}),
	statistics: one(routechoiceStatistics, {
		fields: [routechoice.id],
		references: [routechoiceStatistics.fkRoutechoice]
	})
}));

export const routechoiceStatistics = sqliteTable('routechoice_statistics', {
	id: text('id').primaryKey(),
	fkRoutechoice: text('fk_routchoice')
		.notNull()
		.references(() => routechoice.id, { onDelete: 'cascade' }),
	numberOfRunners: integer('number_of_runners').notNull().default(0),
	bestTime: integer('best_time').notNull().default(0)
});

export const routechoiceStatisticsRelations = relations(routechoiceStatistics, ({ one }) => ({
	routechoice: one(routechoice, {
		fields: [routechoiceStatistics.fkRoutechoice],
		references: [routechoice.id]
	})
}));

export type RoutechoiceStatistics = typeof routechoiceStatistics.$inferSelect;

export const runner = sqliteTable('runner', {
	id: text('id').primaryKey(),
	fkEvent: text('fk_event')
		.notNull()
		.references(() => event.id, { onDelete: 'cascade' }),
	fkUser: text('fk_user').references(() => user.id, { onDelete: 'set null' }), // unique
	fkLiveEvent: text('fk_live_event').references(() => liveEvent.id, { onDelete: 'set null' }), // unique
	trackingDeviceId: text('tracking_device_id'),
	status: text('status', {
		enum: [RunnerStatusEnum.Enum.ok, RunnerStatusEnum.Enum['not-ok']]
	}).notNull(),
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

export type Runner = typeof runner.$inferSelect;

export const runnerLeg = sqliteTable('runner_leg', {
	id: text('id').primaryKey(),
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

export type RunnerLeg = typeof runnerLeg.$inferSelect;

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
	role: text('role', { enum: [RolesEnum.Enum.admin, RolesEnum.Enum.default] })
		.default(RolesEnum.Enum.default)
		.notNull()
});

export type User = typeof user.$inferSelect;

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
