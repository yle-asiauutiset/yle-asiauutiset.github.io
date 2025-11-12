import 'reflect-metadata';
import type { PageServerLoad } from './$types';
import { Collection, getDataSource } from 'db';

export const load: PageServerLoad = async () => {
	try {
		const dataSource = await getDataSource();
		const collectionRepository = dataSource.getRepository(Collection);

		const frontpage = await collectionRepository
			.find({
				order: { createdAt: 'DESC' },
				relations: {
					articles: true
				},
				take: 1
			})
			.then((fp) => fp?.[0]);

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
