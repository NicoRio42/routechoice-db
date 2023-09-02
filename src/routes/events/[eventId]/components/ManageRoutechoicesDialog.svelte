<script lang="ts">
	import { enhance } from "$app/forms";
	import type { Routechoice } from "$lib/server/db/schema.js";
	import { createEventDispatcher } from "svelte";

    export let routechoices: Routechoice[];
    export let eventId: string;
    export let show: boolean;
    
    let loading = false;
    let dialog: HTMLDialogElement;
    const dispatch = createEventDispatcher<{startDrawingNewRoutechoice: undefined}>();

    $: {
        if (show) dialog?.showModal()
        else dialog?.close()
    }

	function confirmDeletion(e: Event) {
		if (!confirm('Are you sure to delete this routechoice?')) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
		}
	}
</script>

<dialog bind:this={dialog}>
	<article>
        <h2>Routechoices</h2>

        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Length</th>
                    <th>Color</th>
                    <th></th>
                </tr>
            </thead>

            <tbody>
                {#each routechoices as routechoice (routechoice.id)}
                <tr>
                    <td>{routechoice.name}</td>
                    <td>{Math.round(routechoice.length)} m</td>
                    <td style:background-color={routechoice.color}></td>

                    <td>
                        <form action="/events/{eventId}/legs/{routechoice.fkLeg}/routechoices/{routechoice.id}?/delete"
                            method="post"
                            on:submit={confirmDeletion}
                            use:enhance={() => {
                                loading = true;
                                return ({update}) => {
                                    loading = false;
                                    show = false;
                                    update();
                                }
                            }}
                            class="m-0 p-0"
                        >
                            <button type="submit" class="btn-unset" aria-busy={loading}>
                                <i class="i-carbon-trash-can w-5 h-5 block" />
                            </button>
                        </form>
                    </td>
                </tr>
                    
                {/each}
            </tbody>
        </table>

        <button type="button" on:click={() => {
            dispatch("startDrawingNewRoutechoice")
            show = false;
        }}>Add routechoice</button>

        <button type="button" class="outline" on:click={() => show = false}>Cancel</button>
    </article>
</dialog>
