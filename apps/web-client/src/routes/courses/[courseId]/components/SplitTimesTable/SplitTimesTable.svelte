<script>
	import { rankToCSSClass, secondsToPrettyTime, fullNameToShortName } from './utils';

	export let splitTimes;
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="sticky-header sticky-column-header">Runners</th>

				{#each splitTimes.course as control, index}
					<th class="sticky-header">
						{#if index !== splitTimes.course.length - 1}
							{`${index + 1} (${control})`}
						{:else}
							Finish
						{/if}
					</th>
				{/each}
			</tr>
		</thead>

		<tbody>
			{#each splitTimes.runners as runner}
				<tr>
					<td class="sticky-column-header">
						<div>
							{fullNameToShortName(runner.firstName, runner.lastName)}
						</div>

						{#if runner.status === 'OK'}
							<div class="tooltip-container">
								{`${secondsToPrettyTime(runner.time)} (${runner.rank})`}

								<span class="tooltip tooltip-top">
									<div>{`+ ${secondsToPrettyTime(runner.timeBehind)}`}</div>

									{#if runner.totalTimeLost !== 0}
										<div>
											{`Time loss: ${secondsToPrettyTime(runner.totalTimeLost)}`}
										</div>
									{/if}
								</span>
							</div>
						{/if}
					</td>

					{#each runner.legs as leg}
						<td class={leg.isMistake ? 'mistake' : ''}>
							<div class="tooltip-container {rankToCSSClass(leg.rankSplit)}">
								{`${secondsToPrettyTime(leg.time)} (${leg.rankSplit})`}
								<span class="tooltip">
									<div>{`+ ${secondsToPrettyTime(leg.timeBehindSplit)}`}</div>

									{#if leg.isMistake === true}
										<div>
											{`Time loss: ${secondsToPrettyTime(leg.timeLost)}`}
										</div>
									{/if}
								</span>
							</div>

							{#if leg.timeOverall !== null}
								<div class="tooltip-container {rankToCSSClass(leg.rankOverall)}">
									{`${secondsToPrettyTime(leg.timeOverall)} (${leg.rankOverall})`}

									<span class="tooltip">{`+ ${secondsToPrettyTime(leg.timeBehindOverall)}`}</span>
								</div>
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table-container {
		width: 100%;
		height: 100%;
		overflow: scroll;
	}

	table {
		border-collapse: collapse;
		border-spacing: 0;
		width: 100%;
		display: table;
	}

	table th.sticky-header {
		background-color: #38383d;
		color: white;
		font-weight: normal;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	table thead tr th.sticky-column-header,
	table tbody tr td.sticky-column-header {
		position: sticky;
		left: 0;
		z-index: 2;
	}

	table thead tr th.sticky-column-header {
		z-index: 3;
	}

	table tr:nth-child(odd) td {
		background-color: #fff;
	}

	table tr:nth-child(even) td {
		background-color: #f1f1f1;
	}

	table td,
	table th {
		padding: 8px 8px;
		display: table-cell;
		text-align: right;
		vertical-align: top;
		white-space: nowrap;
	}

	table th:first-child,
	table td:first-child {
		padding-left: 16px;
		text-align: left;
	}

	tbody tr:hover td {
		background-color: #ccc;
	}

	tbody {
		z-index: 0;
	}

	.tooltip-container {
		position: relative;
	}

	.tooltip-container:hover .tooltip {
		visibility: visible;
		opacity: 1;
	}

	.tooltip {
		z-index: 3;
		display: inline-block;
		position: absolute;
		left: 10%;
		top: 100%;
		color: #fff;
		background-color: #616161;
		padding-left: 8px;
		padding-right: 8px;
		text-align: center;
		border-radius: 4px;
		visibility: hidden;
		opacity: 0;
		transition: visibility 0s, opacity 0.5s linear;
	}

	.tooltip-top {
		top: auto;
		bottom: 100%;
	}

	.first {
		color: #f44336;
	}

	.second {
		color: #4caf50;
	}

	.third {
		color: #2196f3;
	}

	table tbody tr td.mistake {
		background-color: #ffdddd;
	}
</style>
