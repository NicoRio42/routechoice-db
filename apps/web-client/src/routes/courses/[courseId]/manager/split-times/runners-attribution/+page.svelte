<script lang="ts">
	import type {
		Competitor,
		LoggatorEvent
	} from '$lib/o-utils/models/loggator-api/logator-event.js';
	import { initializeApp } from 'firebase/app';
	import { getFunctions, httpsCallable } from 'firebase/functions';
	import firebaseConfig from '../../../../../../environments/environment.js';
	import { browser } from '$app/environment';
	import type User from '$lib/models/user.js';
	import { page } from '$app/stores';
	import { matchRunnersByName } from '$lib/o-utils/two-d-rerun/runners-matcher.js';
	import type Runner from '$lib/o-utils/models/runner.js';

	export let data;

	let runners: Runner[] = data.courseData.runners;
	let competitors: Competitor[] = [];
	let users: User[] = [];

	// TODO: Do this in the load function (problem with token transmission to function)
	if (browser) init();

	async function init() {
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

		const getUsersData = (await getUserList()).data;
		if (!isNotErrorResponse<User[]>(getUsersData)) throw new Error('Problem loading users');

		users = getUsersData;

		runners = matchRunnersByName(
			runners,
			'userId',
			users.map((u) => ({ key: u.id, name: u.displayName ?? u.email }))
		);

		const loggatorEventID = $page.params.courseId.split('-')[1];
		const getLoggatorEventData = (await getLoggatorEvent(loggatorEventID)).data;

		if (!isNotErrorResponse<LoggatorEvent>(getLoggatorEventData))
			throw new Error('Problem loading routes' + getLoggatorEventData.error);

		competitors = getLoggatorEventData.competitors;

		runners = matchRunnersByName(
			runners,
			'trackingDeviceId',
			competitors.map((c) => ({ key: String(c.device_id), name: c.name }))
		);
	}

	function isNotErrorResponse<T extends Object>(
		data: T | { message: string; error: unknown }
	): data is T {
		return !('error' in data);
	}

	let loading = false;

	function handleSubmit() {}
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
			{#each data.courseData.runners as runner}
				<tr>
					<td>{`${runner.firstName} ${runner.lastName}`}</td>

					<td>
						<select bind:value={runner.trackingDeviceId}>
							<option value={null} />

							{#each competitors as route}
								{@const key = `loggator-${route.device_id}`}

								<option value={key}>{route.shortname}</option>
							{/each}
						</select>
					</td>

					<td>
						<select bind:value={runner.userId}>
							<option value={null} />

							{#each users as user}
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
		<button aria-busy={loading} disabled={loading} type="submit">Save split times</button>
	</footer>
</form>

<style>
	.footer {
		display: flex;
		gap: 1rem;
	}
</style>
