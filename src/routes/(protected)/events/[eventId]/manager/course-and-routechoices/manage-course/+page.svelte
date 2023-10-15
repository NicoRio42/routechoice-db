<script lang="ts">
	import { flip } from "svelte/animate";
	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { confirmSubmit } from "$lib/actions/confirm-submit.js";

    export let data;

    const legs = [{...data.legs[0], finishControlPoint: data.legs[0].startControlPoint, id: "start"}, ...data.legs];
</script>

<h1>Manage course</h1>

<p>
    &#62;
    <a href="/events/{data.event.id}/manager">Event manager: {data.event.name}</a>

    &#62;
    <a href="/events/{data.event.id}/manager/course-and-routechoices">Course and routechoices</a>

    &#62;
    <a href="/events/{data.event.id}/manager/course-and-routechoices/manage-course">
        Manage course
    </a>
</p>

<table>
    <thead>
        <tr>
            <th>Control Point</th>
            
            <th>Code</th>
            
            <th></th>
        </tr>
    </thead>

    <tbody>
        {#each legs as leg, legIndex (leg.id)}
            <tr animate:flip>
                <td>
                    <a href="/events/{$page.params.eventId}?legNumber={legIndex === 0 ? 1 : legIndex}">
                        {#if legIndex === 0}
                            Start
                        {:else if legIndex === legs.length - 1}
                            Finish
                        {:else}
                            Control {legIndex}
                        {/if}
                    </a>
                </td>
                
                <td>{leg.finishControlPoint.code}</td>

                <td>
                    <!-- Warning: submit event handler should be before enhance action -->
                    <form
                        action="?/deleteControlPoint&controlPointId={leg.finishControlPoint.id}"
                        method="post"
                        class="m-0 p-0"
                        use:confirmSubmit={'Are you sure to delete this control point?'}
                        use:enhance
                    >
                        <button type="submit" class="btn-unset">
                            <i class="i-carbon-trash-can block" />
                        </button>
                    </form>
                </td>
            </tr>
        {/each}
    </tbody>
</table>