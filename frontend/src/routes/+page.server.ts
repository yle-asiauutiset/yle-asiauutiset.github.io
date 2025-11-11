import 'reflect-metadata';
import type { PageServerLoad } from './$types';
import { Frontpage, getDataSource } from 'db';

export const load: PageServerLoad = async () => {
	try {
		const dataSource = await getDataSource();
		const frontpageRepository = dataSource.getRepository(Frontpage);

		// Fetch all frontpages
		const frontpage = await frontpageRepository
			.find({
				relations: {
					articles: true
				},
				order: { createdAt: 'DESC' },
				take: 1
			})
			.then((fp) => fp?.[0])
			.then((fp) => JSON.parse(JSON.stringify(fp)) as Frontpage); // Deep clone to avoid serialization issues

		return {
			date: frontpage?.createdAt ?? null,
			articles: frontpage?.articles ?? []
		};
	} catch (error) {
		console.error('Error fetching articles:', error);
		return {
			articles: [],
			error: 'Failed to fetch articles'
		};
	}
};
