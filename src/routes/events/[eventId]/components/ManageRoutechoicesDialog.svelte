<script lang="ts">
	import { enhance } from "$app/forms";
	import { confirmSubmit } from "$lib/actions/confirm-submit.js";
	import type { Routechoice } from "$lib/server/db/schema.js";
	import { createEventDispatcher } from "svelte";
	import { fade } from "svelte/transition";

    export let routechoices: Routechoice[];
    export let eventId: string;
    export let show: boolean;
    
    let loading = false;
    const dispatch = createEventDispatcher<{startDrawingNewRoutechoice: undefined}>();
</script>

<!-- Dialog showModal and close methods are not well supported on IOS -->
{#if show}
    <dialog open transition:fade={{duration: 125}}>
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
                                use:confirmSubmit={'Are you sure to delete this routechoice?'}
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
{/if}