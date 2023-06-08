import { sqliteTable, text, integer, customType, primaryKey, real } from 'drizzle-orm/sqlite-core';
import type { InferModel } from 'drizzle-orm';
import { RolesEnum } from '../../models/enums/roles.enum.js';
import { RunnerStatusEnum } from '../../models/enums/runner-status.enum.js';
// import { RolesEnum } from '../../models/enums/roles.enum';
// import { RunnerStatusEnum } from '../../models/enums/runner-status.enum';

const boolean = customType<{ data: boolean }>({
	dataType() {
		return 'boolean';
	},
	fromDriver(value) {
		return value !== 0;
	},
	toDriver(value) {
		return value ? 1 : 0;
	}
});

export const event = sqliteTable('event', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
	finishTime: integer('finish_time', { mode: 'timestamp' }).notNull(),
	publishTime: integer('publish_time', { mode: 'timestamp' }).notNull()
});

export type Event = InferModel<typeof event>;

export const liveEvent = sqliteTable('live_event', {
	id: text('id').primaryKey(),
	fkEvent: text('fk_event')
		.notNull()
		.references(() => event.id, { onDelete: 'cascade' }),
	liveProvider: text('live_provider').notNull(),
	url: text('url').notNull(),
	isPrimary: boolean('is_primary').notNull()
});

export const tag = sqliteTable('tag', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	color: text('color').notNull()
});

export const assoEventTag = sqliteTable(
	'asso_event_tag',
	{
		fkEvent: text('fk_event').references(() => event.id, { onDelete: 'cascade' }),
		fkTag: text('fk_tag').references(() => tag.id, { onDelete: 'cascade' })
	},
	(table) => ({ pk: primaryKey(table.fkEvent, table.fkTag) })
);

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

export const controlPoint = sqliteTable('control_point', {
	id: text('id').primaryKey(),
	fkEvent: text('fk_event')
		.notNull()
		.references(() => event.id, { onDelete: 'cascade' }),
	code: text('code').notNull(),
	longitude: real('longitude').notNull(),
	latitude: real('latitude').notNull()
});

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

export const runner = sqliteTable('runner', {
	id: text('id').primaryKey(),
	trackingDeviceId: text('tracking_device_id'),
	fkEvent: text('fk_event')
		.notNull()
		.references(() => event.id, { onDelete: 'cascade' }),
	fkUser: text('fk_user').references(() => user.id, { onDelete: 'set null' }), // unique
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

export const runnerLeg = sqliteTable('runner_leg', {
	id: text('id').primaryKey(),
	fkDetectedRoutechoice: text('fk_detected_routechoice').references(() => routechoice.id, {
		onDelete: 'cascade'
	}),
	fkManualRoutechoice: text('fk_manual_routechoice').references(() => routechoice.id, {
		onDelete: 'cascade'
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

// AUTH

export const user = sqliteTable('auth_user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull(),
	emailVerified: integer('email_verified').default(0).notNull(),
	role: text('role', { enum: [RolesEnum.Enum.admin, RolesEnum.Enum.default] })
		.default(RolesEnum.Enum.default)
		.notNull()
});

export type User = InferModel<typeof user>;
export type InsertUser = InferModel<typeof user, 'insert'>;

export const session = sqliteTable('auth_session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	activeExpires: integer('active_expires').notNull(),
	idleExpires: integer('idle_expires').notNull()
});

export const key = sqliteTable('auth_key', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	primaryKey: integer('primary_key').notNull(),
	hashedPassword: text('hashed_password'),
	expires: integer('expires')
});
