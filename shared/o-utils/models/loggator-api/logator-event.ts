import { z } from "zod";

export interface Event {
  id: number;
  name: string;
  start_date: Date;
  end_date: Date;
  publish_date: Date;
  map_id: number;
  slug: string;
}

export interface Competitor {
  id: number;
  device_id: number;
  name: string;
  marker_color: string;
  shortname: string;
  startnumber?: any;
  start_time: Date;
  position: number;
  end_time: Date;
  club: string;
  tags: any[];
  device_battery: number;
}

export interface Settings {
  latitude: string;
  longitude: string;
  zoom: string;
  tail_length: string;
  replay_speed: string;
  live_delay: string;
  publish_competitors: string;
  show_battery_info: string;
  show_distance_info: string;
  show_relative_time: string;
}

export interface Map {}

export interface RootObject {
  event: Event;
  competitors: Competitor[];
  tracks: string;
  settings: Settings;
  map: Map;
  overlays: any[];
}

export const eventSchema = z.object({
  id: z.number(),
  name: z.string(),
  start_date: z.date(),
  end_date: z.date(),
  publish_date: z.date(),
  map_id: z.number(),
  slug: z.string(),
});

export const competitorSchema = z.object({
  id: z.number(),
  device_id: z.number(),
  name: z.string(),
  marker_color: z.string(),
  shortname: z.string(),
  startnumber: z.any().optional(),
  start_time: z.date(),
  position: z.number(),
  end_time: z.date(),
  club: z.string(),
  tags: z.array(z.any()),
  device_battery: z.number(),
});

export const settingsSchema = z.object({
  latitude: z.string(),
  longitude: z.string(),
  zoom: z.string(),
  tail_length: z.string(),
  replay_speed: z.string(),
  live_delay: z.string(),
  publish_competitors: z.string(),
  show_battery_info: z.string(),
  show_distance_info: z.string(),
  show_relative_time: z.string(),
});

export const mapSchema = z.object({});

export const rootObjectSchema = z.object({
  event: eventSchema,
  competitors: z.array(competitorSchema),
  tracks: z.string(),
  settings: settingsSchema,
  map: mapSchema,
  overlays: z.array(z.any()),
});
