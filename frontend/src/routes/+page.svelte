<script lang="ts">
	import { aikaasitten } from '$lib/utils';
import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto p-8">
	<h1 class="text-3xl font-bold mb-6">YLE Luetuimmat {new Date(data.date ?? 0)?.toLocaleString("fi-FI")}</h1>
	
	{#if data.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
			<p>{data.error}</p>
		</div>
	{:else if data.articles.length === 0}
		<p class="text-gray-600">No articles found in the database.</p>
	{:else}
		<div class="grid gap-4">
			{#each data.articles as article}
				<div class="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
					<h2 class="text-xl font-semibold mb-2"><a href={article.url} class="hover:underline" target="_blank">{article.correctedTitle ?? article.title}</a></h2>
					<div class="text-gray-600 space-y-1">
						<p class="font-medium">{article.description}</p>
						{#if article.correctedTitle}
							<p>Alkuperäinen otsikko: {article.title}</p>
							
						{/if}
						<!-- <p><span class="font-medium">Image URL:</span> {article.imageUrl}</p>
						<p><span class="font-medium">URL:</span> {article.url}</p> -->
						<p class="text-sm"><span class="font-medium">Created:</span> {aikaasitten(new Date(article.publishedAt ?? 0))}</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
