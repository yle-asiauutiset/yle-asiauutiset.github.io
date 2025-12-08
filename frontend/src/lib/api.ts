import type { Feed } from 'shared';

export async function getFeed(
	opts: { date: string } = { date: new Date().toISOString().split('T')[0] }
): Promise<Feed> {
	const { date } = opts;

	console.log(
		`Fetching frontpage for date: ${date} from gist ${import.meta.env.VITE_GITHUB_GIST_ID}`
	);

	const frontpageUrl = await fetch(
		`https://api.github.com/gists/${import.meta.env.VITE_GITHUB_GIST_ID}`
		// {
		// 	headers: {
		// 		Authorization: `Bearer ${import.meta.env.VITE_GITHUB_GIST_TOKEN}`
		// 	}
		// }
	)
		.then((res) => res.json())
		.then((data) => data?.files[`${date}.json`]?.raw_url as string);

	if (frontpageUrl) {
		const frontpageData = await fetch(frontpageUrl).then((res) => res.json());
		return frontpageData as Feed;
	}

	return {
		articles: [],
		generatedAt: date
	};
}
