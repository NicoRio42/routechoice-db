<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { updateRunners } from '$lib/db/runners.js';
	import type User from '$lib/models/user.js';
	import { buildRunnersTracksFromLoggatorData } from '$lib/o-utils/loggator/points.js';
	import { serializeNestedArraysInLegs } from '$lib/o-utils/models/leg.js';
	import type {
		Competitor,
		LoggatorEvent
	} from '$lib/o-utils/models/loggator-api/logator-event.js';
	import type { LoggatorPoints } from '$lib/o-utils/models/loggator-api/loggator-points.js';
	import type Runner from '$lib/o-utils/models/runner.js';
	import { detectRunnersRoutechoices } from '$lib/o-utils/routechoice-detector/routechoice-detector.js';
	import { createRoutechoiceStatistics } from '$lib/o-utils/statistics/routechoices-statistics.js';
	import { matchRunnersByName } from '$lib/o-utils/two-d-rerun/runners-matcher.js';
	import { isNotErrorResponse } from '$lib/utils/functions.js';
	import { doc, getFirestore, updateDoc } from 'firebase/firestore/lite';
	import { getFunctions, httpsCallable } from 'firebase/functions';

	export let data;

	const functions = getFunctions(undefined, 'europe-west1');

	const getUserList = httpsCallable<string, User[] | { message: string; error: unknown }>(
		functions,
		'getUserList'
	);

	const getLoggatorEvent = httpsCallable<
		string,
		LoggatorEvent | { message: string; error: unknown }
	>(functions, 'getLoggatorEvent');

	const getLoggatorEventPoints = httpsCallable<
		string,
		LoggatorPoints | { message: string; error: unknown }
	>(functions, 'getLoggatorEventPoints');

	let runners: Runner[] = [];
	let competitors: Competitor[] = [];
	let users: User[] = [];
	const loggatorEventID = $page.params.courseId.split('-')[1];
	let loggatorEvent: LoggatorEvent;
	let loadingData = true;
	let loading = false;

	// TODO: Do this in the load function (problem with token transmission to function)
	if (browser) {
		try {
			init();
		} catch (e) {
			alert('An error occured while loading data.');
			console.error(e);
		} finally {
			loadingData = false;
		}
	}

	async function init() {
		const getUsersData = (await getUserList()).data;
		if (!isNotErrorResponse<User[]>(getUsersData)) throw new Error('Problem loading users');

		users = getUsersData;
		const getLoggatorEventData = (await getLoggatorEvent(loggatorEventID)).data;

		if (!isNotErrorResponse<LoggatorEvent>(getLoggatorEventData))
			throw new Error('Problem loading routes' + getLoggatorEventData.error);

		loggatorEvent = getLoggatorEventData;
		competitors = getLoggatorEventData.competitors;

		if (runners.some((r) => r.userId !== null || r.trackingDeviceId !== null)) {
			runners = data.courseData.runners;
			return;
		}

		const runnersWithAttributedUsers = matchRunnersByName(
			data.courseData.runners,
			'userId',
			users.map((u) => ({ key: u.id, name: u.displayName ?? u.email }))
		);

		runners = matchRunnersByName(
			runnersWithAttributedUsers,
			'trackingDeviceId',
			competitors.map((c) => ({ key: `loggator-${c.device_id}`, name: c.name }))
		);
	}

	async function handleSubmit() {
		loading = true;
		const getLoggatorPointsData = (await getLoggatorEventPoints(loggatorEventID)).data;

		if (!isNotErrorResponse<LoggatorPoints>(getLoggatorPointsData))
			throw new Error('Problem loading points from loggator' + getLoggatorPointsData.error);

		const loggatorPoints = getLoggatorPointsData.data;

		const runnersWithTracks = buildRunnersTracksFromLoggatorData(
			runners,
			loggatorPoints,
			loggatorEvent
		);

		const runnersWithRoutechoices = detectRunnersRoutechoices(
			data.courseData.legs,
			runnersWithTracks
		);

		const db = getFirestore();

		try {
			await updateRunners(runnersWithRoutechoices, data.course.id, db);

			const legsWithStatistics = createRoutechoiceStatistics(
				runnersWithRoutechoices,
				data.courseData.legs
			);

			await updateDoc(doc(db, 'coursesData', data.course.id), {
				legs: serializeNestedArraysInLegs(legsWithStatistics)
			});

			goto(`/courses/${data.course.id}`);
		} catch (e) {
			alert('An error occured while saving runners routechoices.');
			console.error(e);
			loading = false;
		}
	}
</script>

<h1>Runners / GPS tracks / User correspondence</h1>

<p>
	&#62;
	<a href={`/courses/${data.course.id}/manager`}>{data.course.name}</a>

	&#62;
	<a href={`/courses/${data.course.id}/manager/split-times`}>Split times</a>
</p>

{#if loadingData}
	<p aria-busy={true} class="spinner">Loading</p>
{:else}
	<form on:submit|preventDefault={handleSubmit} class="container">
		<table>
			<thead>
				<tr>
					<th>Split times</th>
					<th>GPS track</th>
					<th>User</th>
				</tr>
			</thead>

			<tbody>
				{#each runners as runner (runner.id)}
					<tr>
						<td>{`${runner.firstName} ${runner.lastName}`}</td>

						<td>
							<select bind:value={runner.trackingDeviceId}>
								<option value={null} />

								{#each competitors as route (route.device_id)}
									<option value={`loggator-${route.device_id}`}>{route.name}</option>
								{/each}
							</select>
						</td>

						<td>
							<select bind:value={runner.userId}>
								<option value={null} />

								{#each users as user (user.id)}
									<option value={user.id}>{user.displayName}</option>
								{/each}
							</select>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<button aria-busy={loading} type="submit" class="submit">Save split times</button>
	</form>
{/if}

<style>
	h1 {
		margin: 2rem auto 1rem;
	}

	.spinner {
		text-align: center;
	}

	.submit {
		width: fit-content;
		padding-left: 2rem;
		padding-right: 2rem;
		margin: auto;
	}
</style>
