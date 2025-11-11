export function aikaasitten(date: Date): string {
	const nyt = new Date();
	const ero = Math.floor((nyt.getTime() - date.getTime()) / 1000); // sekunteina

	if (ero < 0) {
		return 'tulevaisuudessa';
	}

	const vuodet = Math.floor(ero / (365 * 24 * 60 * 60));
	if (vuodet > 0) {
		return vuodet === 1 ? '1 vuosi sitten' : `${vuodet} vuotta sitten`;
	}

	const kuukaudet = Math.floor(ero / (30 * 24 * 60 * 60));
	if (kuukaudet > 0) {
		return kuukaudet === 1 ? '1 kuukausi sitten' : `${kuukaudet} kuukautta sitten`;
	}

	const paivat = Math.floor(ero / (24 * 60 * 60));
	if (paivat > 0) {
		return paivat === 1 ? '1 päivä sitten' : `${paivat} päivää sitten`;
	}

	const tunnit = Math.floor(ero / (60 * 60));
	if (tunnit > 0) {
		return tunnit === 1 ? '1 tunti sitten' : `${tunnit} tuntia sitten`;
	}

	const minuutit = Math.floor(ero / 60);
	if (minuutit > 0) {
		return minuutit === 1 ? '1 minuutti sitten' : `${minuutit} minuuttia sitten`;
	}

	return ero === 1 ? '1 sekunti sitten' : `${ero} sekuntia sitten`;
}
