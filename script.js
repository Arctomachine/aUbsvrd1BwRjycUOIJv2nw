import { debounce } from './functions.js'
import { searchAllByTitle, getMovieDetails } from './OmdbApi.js'

const header = document.querySelector('.header')
const searchButtonMobile = document.querySelector('#search-button-mobile')
const modal = document.querySelector('.details-modal')
const closeButton = document.querySelector('.details-modal .close')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const searchSection = document.querySelector('#search')
const popularSection = document.querySelector('#popular')
const recentSection = document.querySelector('#recent')
const movieCardTemplate = document.querySelector('#movie-card-template')

let modalIsLoading = false
document.addEventListener('click', function (event) {
	const closestCard = event.target.closest('.card')

	if (closestCard === null) {
		return
	}

	const movieId = closestCard.getAttribute('data-movie-id')

	if (!movieId) {
		return
	}

	if (modalIsLoading) {
		return
	}

	const searchParams = new URLSearchParams(window.location.search)
	searchParams.set('movieId', movieId)
	window.history.replaceState({}, '', `?${searchParams.toString()}`)

	loadModal(movieId)
})

const searchDebounce = debounce(async function (text) {
	if (!text) {
		return
	}

	const data = await searchAllByTitle(text.trim())
	renderList(data.Search, 'search')
}, 1500)

/**
 *
 * @type {{
 * add(*),
 * currentState: boolean,
 * shouldShow(): boolean,
 * value: []
 * }}
 */
const recentMovies = {
	value: JSON.parse(sessionStorage.getItem('recentMovies')) || [],
	currentState: () => this.value.length > 0,
	shouldShow () {
		return this.currentState && this.value.length > 0
	},
	add (movie) {
		const listOfIds = this.value.map(movie => movie.imdbID)
		if (listOfIds.includes(movie.imdbID)) {
			const index = listOfIds.indexOf(movie.imdbID)
			this.value.splice(index, 1)
		}

		this.value.push(movie)

		if (this.value.length >= 6) {
			this.value.shift()
		}

		sessionStorage.setItem('recentMovies', JSON.stringify(this.value))
		renderList(this.value, 'recent', 'recent')
	},
}
let showPopular = true
let showSearch = false

const initialUrl = new URL(window.location)

if (initialUrl.searchParams.has('search')) {
	const searchString = initialUrl.searchParams.get('search')
	searchInput.value = searchString
	searchDebounce(searchString, 0)
} else {
	renderList([], 'popular')
	renderList(recentMovies.value, 'recent', 'recent')
}

if (initialUrl.searchParams.has('movieId')) {
	const movieId = initialUrl.searchParams.get('movieId')
	loadModal(movieId)
}

searchButtonMobile.addEventListener('click', () => {
	header.classList.toggle('mobile-search')
})

closeButton.addEventListener('click', () => {
	const searchParams = new URLSearchParams(window.location.search)
	searchParams.delete('movieId')
	window.history.replaceState({}, '', `?${searchParams.toString()}`)
	modal.close()
})

searchForm.addEventListener('submit', async (e) => {
	e.preventDefault()
	searchDebounce(undefined, 0)

	const text = searchInput.value

	const data = await searchAllByTitle(text)
	renderList(data.Search, 'search')
})

searchForm.addEventListener('reset', onSearchStringEmpty)

searchInput.addEventListener('input', function (e) {
	const text = e.target.value

	if (text.length < 1) {
		onSearchStringEmpty()
	}

	searchDebounce(text)

	const searchParams = new URLSearchParams(window.location.search)
	searchParams.set('search', e.target.value)

	window.history.replaceState({}, '', `?${searchParams.toString()}`)
})

/**
 *
 * @param data {{
 *    Poster: string,
 *    Title: string,
 *    Type: string,
 *    Year: string,
 *    imdbID: string,
 *  }[]}
 *  @param section {'search' | 'popular' | 'recent'}
 *  @param sortBy {'year' | 'recent'}
 */
function renderList (data, section, sortBy = 'year') {
	if (!data) {
		alert('По такому запросу ничего не найдено')
		return
	}

	const sortedData = sortBy === 'year' ? [...data].sort((a, b) => {
		return Number(b.Year) - Number(a.Year)
	}) : [...data].reverse()

	if (!'content' in document.createElement('template')) {
		return
	}

	let targetSection
	switch (section) {
		case 'search':
			targetSection = searchSection
			break
		case 'popular':
			targetSection = popularSection
			break
		case 'recent':
			targetSection = recentSection
			break
		default:
			return
	}

	const parent = targetSection.querySelector('.grid-container')
	parent.innerHTML = ''

	for (const movie of sortedData) {
		const clone = movieCardTemplate.content.cloneNode(true)

		const card = clone.querySelector('.card')
		card.setAttribute('data-movie-id', movie.imdbID)

		const poster = clone.querySelector('.poster')
		if (movie.Poster !== 'N/A') {
			poster.src = movie.Poster
		}
		poster.alt = movie.Title

		const title = clone.querySelector('.title')
		title.innerHTML = movie.Title

		const rating = clone.querySelector('.rating')
		if (movie.imdbRating !== 'N/A') {
			rating.querySelector('.rating-value').innerHTML = movie.imdbRating
		} else {
			rating.parentNode.removeChild(rating)
		}

		parent.appendChild(clone)
	}

	switch (section) {
		case 'search':
			showPopular = false
			showSearch = true
			break
		case 'popular':
			showPopular = true
			showSearch = false
			break
		case 'recent':
			showPopular = true
			showSearch = false
			break
		default:
			break
	}

	onRenderFinish()
}

/**
 *
 * @param id {string}
 */
async function loadModal (id) {
	modalIsLoading = true

	const data = await getMovieDetails(id)

	const poster = modal.querySelector('.details-poster')
	if (data.Poster !== 'N/A') {
		poster.src = data.Poster
		poster.alt = data.Title
		poster.classList.toggle('hidden', false)
	} else {
		poster.classList.toggle('hidden', true)
	}

	const title = modal.querySelector('h1')
	title.innerHTML = data.Title

	const details1 = modal.querySelector('.details-1')
	const rating = details1.querySelector('.rating')
	const ratingValue = rating.querySelector('.rating-value')
	const separator = details1.querySelector('.separator')
	const year = details1.querySelector('.year')
	if (data.imdbRating !== 'N/A') {
		ratingValue.innerHTML = data.imdbRating
		rating.classList.toggle('hidden', false)
		separator.classList.toggle('hidden', false)
	} else {
		rating.classList.toggle('hidden', true)
		separator.classList.toggle('hidden', true)
	}
	if (data.Year !== 'N/A') {
		year.innerHTML = data.Year
		details1.classList.toggle('hidden', false)
	} else {
		details1.classList.toggle('hidden', true)
	}

	const details2 = modal.querySelector('.details-2')
	if (data.Rated !== 'N/A') {
		details2.innerHTML = data.Rated
		details2.classList.toggle('hidden', false)
	} else {
		details2.classList.toggle('hidden', true)
	}

	const details3 = modal.querySelector('.details-3')
	if (data.Genre !== 'N/A') {
		const values = data.Genre.split(/\s*,\s*/) // запятая и пробелы
		details3.innerHTML = ''

		values.forEach((value, index) => {
			const span = document.createElement('span')
			span.innerHTML = value.trim()
			details3.appendChild(span)

			if (index < values.length - 1) {
				const separator = document.createElement('div')
				separator.classList.add('separator')
				details3.appendChild(separator)
			}
		})

		details3.classList.toggle('hidden', false)
	} else {
		details3.classList.toggle('hidden', true)
	}

	const details4 = modal.querySelector('.details-4')
	if (data.Plot !== 'N/A') {
		details4.innerHTML = data.Plot
		details4.classList.toggle('hidden', false)
	} else {
		details4.classList.toggle('hidden', true)
	}

	modalIsLoading = false

	modal.showModal()

	recentMovies.add(data)
}

function onRenderFinish () {
	const searchParams = new URLSearchParams(window.location.search)
	const search = searchParams.get('search')

	if (search) {
		popularSection.classList.toggle('hidden', true)
		recentSection.classList.toggle('hidden', true)
		searchSection.classList.toggle('hidden', false)
	} else {
		popularSection.classList.toggle('hidden', !showPopular)
		recentSection.classList.toggle('hidden', !recentMovies.shouldShow())
		searchSection.classList.toggle('hidden', true)
	}
}

function onSearchStringEmpty () {
	searchDebounce(undefined, 0)

	const searchParams = new URLSearchParams(window.location.search)
	searchParams.delete('search')

	window.history.replaceState({}, '', `?${searchParams.toString()}`)

	popularSection.classList.toggle('hidden', false)
	recentSection.classList.toggle('hidden', !recentMovies.shouldShow())
	searchSection.classList.toggle('hidden', true)
}
