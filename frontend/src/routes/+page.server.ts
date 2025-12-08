import { getFeed } from '$lib/api';
import 'reflect-metadata';
import type { PageServerLoad } from './$types';
import type { Feed } from 'shared';

export const load: PageServerLoad = async () => {
	try {
		// const orm = await getDataSource();
		// const em = orm.em.fork();

		// const frontpage = await em
		// 	.find(Collection, {}, { populate: ['articles'], orderBy: { createdAt: 'DESC' }, limit: 1 })
		// 	.then((cols) => cols[0]);

		const feed = await getFeed();

		return { feed };
	} catch (error) {
		console.error('Error fetching articles:', error);
		const feed: Feed = {
			articles: [],
			generatedAt: new Date().toISOString()
		};

		return { feed };
	}
};
