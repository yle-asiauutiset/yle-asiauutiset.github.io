<script lang="ts">
	import { aikaasitten } from '$lib/utils';
import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto py-8 md:px-8">
	<h1 class="text-2xl font-bold mx-4 md:mx-0">YLE Luetuimmat</h1>
	<p class="font-semibold mb-6 mx-4 md:mx-0">{new Date(data.date ?? 0)?.toLocaleString("fi-FI")}</p>
	
	{#if data.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
			<p>{data.error}</p>
		</div>
	{:else if data.articles.length === 0}
		<p class="text-gray-600">No articles found in the database.</p>
	{:else}
		<div class="grid gap-4">
			{#each data.articles as article}
				<div class="p-4 shadow-sm hover:shadow-md transition-shadow bg-[#1f2123]">
					<h2 class="text-xl font-semibold mb-1"><a href={article.url} class="hover:underline" target="_blank">{article.correctedTitle ?? article.title}</a></h2>
					<div class="text-gray-300 space-y-1">
						<p class="font-medium">{article.description}</p>
						{#if article.correctedTitle}
							<p>Alkuperäinen otsikko: {article.title}</p>
							
						{/if}
						<!-- <p><span class="font-medium">Image URL:</span> {article.imageUrl}</p>
						<p><span class="font-medium">URL:</span> {article.url}</p> -->
						<p class="text-sm mt-2">{aikaasitten(new Date(article.publishedAt ?? 0))}</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
