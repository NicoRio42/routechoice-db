import type {
	controlPoint,
	event,
	leg,
	liveEvent,
	routechoice,
	runner,
	runnerLeg,
	tag,
	user
} from './schema';

export type Event = typeof event.$inferSelect;
export type LiveEvent = typeof liveEvent.$inferSelect;
export type Tag = typeof tag.$inferSelect;
export type Leg = typeof leg.$inferSelect;
export type LegInsert = typeof leg.$inferInsert;
export type ControlPoint = typeof controlPoint.$inferSelect;
export type Routechoice = typeof routechoice.$inferSelect;
export type RoutechoiceInsert = typeof routechoice.$inferInsert;
export type Runner = typeof runner.$inferSelect;
export type RunnerInsert = typeof runner.$inferInsert;
export type RunnerLeg = typeof runnerLeg.$inferSelect;
export type RunnerLegInsert = typeof runnerLeg.$inferInsert;
export type User = typeof user.$inferSelect;
