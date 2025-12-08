<script lang="ts">
	import Feed from '$lib/Feed.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let feed = $derived(data.feed);
	let error = $derived(data.error);
</script>

<Feed {feed} />

{#if error}
	<p class="text-red-600">Käyttöraja saavutettu. Yritä myöhemmin uudelleen.</p>
{/if}
