<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { updateRunners } from '$lib/db/runners.js';
	import type User from '$lib/models/user.js';
	import { buildRunnersTracksFromLoggatorData } from '$lib/o-utils/loggator/points.js';
	import type {
		Competitor,
		LoggatorEvent
	} from '$lib/o-utils/models/loggator-api/logator-event.js';
	import type { LoggatorPoints } from '$lib/o-utils/models/loggator-api/loggator-points.js';
	import type Runner from '$lib/o-utils/models/runner.js';
	import { detectRunnersRoutechoices } from '$lib/o-utils/routechoice-detector/routechoice-detector.js';
	import { matchRunnersByName } from '$lib/o-utils/two-d-rerun/runners-matcher.js';
	import { initializeApp } from 'firebase/app';
	import { getFirestore } from 'firebase/firestore/lite';
	import { getFunctions, httpsCallable } from 'firebase/functions';
	import firebaseConfig from '../../../../../../environments/environment.js';
	import { goto } from '$app/navigation';

	export let data;

	initializeApp(firebaseConfig);
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
	let loading = false;

	// TODO: Do this in the load function (problem with token transmission to function)
	if (browser) init();

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

	function isNotErrorResponse<T extends Object>(
		data: T | { message: string; error: unknown }
	): data is T {
		return !('error' in data);
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
			goto(`/courses/${data.course.id}`);
		} catch (e) {
			alert('An error occured while saving runners routechoices.');
			console.error(e);
			loading = false;
		}
	}
</script>

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

	<footer class="footer">
		<button type="button" class="outline">Cancel</button>
		<button aria-busy={loading} type="submit">Save split times</button>
	</footer>
</form>

<style>
	.footer {
		display: flex;
		gap: 1rem;
	}
</style>
