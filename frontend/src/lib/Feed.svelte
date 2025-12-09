<script lang="ts">
	import { type Feed } from 'shared';
	import { aikaasitten, getDateString } from './utils';

	let { feed }: { feed?: Feed } = $props();
	let date = $derived(feed?.generatedAt ? new Date(feed.generatedAt) : undefined);
	let previousDay = $derived(new Date((date?.getTime() ?? Date.now()) - 24 * 60 * 60 * 1000));
	let nextDay = $derived.by(() => {
		const d = date ?? new Date(0);
		const today = new Date();

		if (
			d.getDate() !== today.getDate() ||
			d.getMonth() !== today.getMonth() ||
			d.getFullYear() !== today.getFullYear()
		) {
			return new Date(d.getTime() + 24 * 60 * 60 * 1000);
		}
	});
</script>

<div class="container mx-auto py-8 md:px-8">
	<h1 class="mx-4 text-2xl font-bold md:mx-0">YLE Asiauutiset</h1>
	<p class="mx-4 mb-6 font-semibold md:mx-0">
		Päivitetty {date?.toLocaleString('fi-FI') ?? '-'}
	</p>

	<div class="mb-4 border border-[#26425c] bg-[#142535] p-4 shadow-sm">
		<!-- <h2 class="mb-1 text-xl font-semibold">Asd</h2> -->
		<div class="space-y-1 text-gray-300">
			<p class="">
				Yle Asiauutiset on Ylen RSS-syötteestä generoitu uutissyöte, jonka otsikoita on tarpeen
				mukaan muokattu artikkelin sisällön perusteella klikkiotsikoiden välttämiseksi. Syöte
				luodaan kielimallin avulla, ja joskus muokatut otsikot voivat sisältää virheitä. Sivu
				päivittyy kaksi kertaa päivässä noin klo 7:10 ja 16:10. Sivusto ei ole Ylen virallinen sivu.
			</p>

			<!-- <a href="/faq" class="underline">Lue lisää</a> -->
		</div>
	</div>

	{#if !feed || feed?.articles?.length === 0}
		<p class="mx-4 text-gray-600 md:mx-0">Artikkeleita ei löytynyt.</p>
	{:else}
		<div class="grid gap-4">
			{#each feed.articles as article}
				<div class="bg-[#1f2123] p-4 shadow-sm transition-shadow hover:shadow-md">
					<h2 class="mb-1 text-xl font-semibold">
						<a href={article.url} class="hover:underline" target="_blank">
							{article.correctedTitle ?? article.title}
						</a>
					</h2>
					<div class="space-y-1 text-gray-300">
						<p class="font-medium">{article.description}</p>
						{#if article.correctedTitle}
							<p class="italic">Alkuperäinen otsikko: {article.title}</p>
						{/if}
						<!-- <p><span class="font-medium">Image URL:</span> {article.imageUrl}</p>
						<p><span class="font-medium">URL:</span> {article.url}</p> -->
						<p class="mt-2 text-sm">{aikaasitten(new Date(article.publishedAt ?? 0))}</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="mx-4 mt-4 text-gray-600 md:mx-0">
		(<a class="underline" href={`/${getDateString(previousDay)}`}>Edellinen päivä</a>)
		{#if nextDay}
			(<a class="underline" href={`/${getDateString(nextDay)}`}>Seuraava päivä</a>) (<a
				class="underline"
				href="/"
			>
				Tämä päivä
			</a>)
		{/if}
		<!-- (<a class="underline" href="/faq">Usein kysytyt kysymykset</a>) -->
		(<a class="underline" href="https://github.com/yle-asiauutiset/yle-asiauutiset.github.io">
			Lähdekoodi
		</a>)
	</div>
</div>
