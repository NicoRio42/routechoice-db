pragma foreign_keys=off;

--> statement-breakpoint
alter table runner_leg rename to _runner_leg_old;

--> statement-breakpoint
create table `runner_leg` (
    `id` text primary key not null,
    `fk_detected_routechoice` text,
    `fk_manual_routechoice` text,
    `fk_leg` text not null,
    `fk_runner` text not null,
    `time_overall` integer not null,
    `time` integer not null,
    `rank_split` integer not null,
    `time_behind_split` integer not null,
    `rank_overall` integer,
    `time_behind_overall` integer,
    `time_behind_superman` integer,
    `time_loss` integer not null,
    `routechoice_time_loss` integer not null,
    foreign key (`fk_detected_routechoice`) references `routechoice`(`id`) on update no action on delete set null,
    foreign key (`fk_manual_routechoice`) references `routechoice`(`id`) on update no action on delete set null,
    foreign key (`fk_leg`) references `leg`(`id`) on update no action on delete cascade,
    foreign key (`fk_runner`) references `runner`(`id`) on update no action on delete cascade
);

--> statement-breakpoint
insert into runner_leg (
    id,
    fk_detected_routechoice,
    fk_manual_routechoice,
    fk_leg,
    fk_runner,
    time_overall,
    time,
    rank_split,
    time_behind_split,
    rank_overall,
    time_behind_overall,
    time_behind_superman,
    time_loss,
    routechoice_time_loss
)
    select
        id,
        fk_detected_routechoice,
        fk_manual_routechoice,
        fk_leg,
        fk_runner,
        time_overall,
        time,
        rank_split,
        time_behind_split,
        rank_overall,
        time_behind_overall,
        time_behind_superman,
        time_loss,
        routechoice_time_loss
    from
        _runner_leg_old;

--> statement-breakpoint
drop table _runner_leg_old;

--> statement-breakpoint
pragma foreign_keys=on;