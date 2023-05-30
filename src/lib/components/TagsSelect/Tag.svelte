<script lang="ts">
	import type { Tag } from '$lib/models/tag';

	export let tag: Tag;
</script>

<span style:background-color={tag.color} class="tag">{tag.name}</span>

<style>
	.tag {
		margin-right: 0.5rem;
		color: white;
		padding: 0 0.5rem;
		white-space: nowrap;
		border-radius: 0.25rem;
	}
</style>
