import 'reflect-metadata';
import type { PageServerLoad } from './$types';
import { Collection, getDataSource } from 'shared';

export const load: PageServerLoad = async () => {
	try {
		const orm = await getDataSource();
		const em = orm.em.fork();

		const frontpage = await em
			.find(Collection, {}, { populate: ['articles'], orderBy: { createdAt: 'DESC' }, limit: 1 })
			.then((cols) => cols[0]);

		return {
			date: frontpage?.createdAt ?? null,
			articles: JSON.parse(JSON.stringify(frontpage?.articles ?? []))
		};
	} catch (error) {
		console.error('Error fetching articles:', error);
		return {
			articles: [],
			error: 'Failed to fetch articles'
		};
	}
};
