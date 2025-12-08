import { getFrontpage } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const frontpage = await getFrontpage({ date: params.date });

	return { frontpage };
};
