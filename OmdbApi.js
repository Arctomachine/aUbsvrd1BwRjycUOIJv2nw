const API_KEY = ''

const baseUrlData = 'https://www.omdbapi.com/'

/**
 *
 * @param title {string}
 * @return {Promise<{
 *  Response: string,
 *  totalResults: string,
 *  Search: {
 *    Poster: string,
 *    Title: string,
 *    Type: string,
 *    Year: string,
 *    imdbID: string,
 *  }[]
 * }>}
 */
export async function searchAllByTitle (title) {
	const url = new URL(baseUrlData)
	url.searchParams.set('apikey', API_KEY)
	url.searchParams.set('s', String(title))
	url.searchParams.set('type', 'movie')
	url.searchParams.set('r', 'json')

	try {
		const response = await fetch(url)
		return await response.json()
	} catch (error) {
		console.error(error)
	}
}

/**
 *
 * @param id {string}
 * @return {Promise<{
 *    Response: string,
 *    Title: string,
 *    Year: string,
 *    Rated: string,
 *    Genre: string,
 *    Plot: string,
 *    Poster: string,
 *    imdbRating: string,
 * }>}
 */
export async function getMovieDetails (id) {
	const url = new URL(baseUrlData)
	url.searchParams.set('apikey', API_KEY)
	url.searchParams.set('i', String(id))
	url.searchParams.set('plot', 'full')
	url.searchParams.set('r', 'json')

	try {
		const response = await fetch(url)
		return await response.json()
	} catch (error) {
		console.error(error)
	}
}
