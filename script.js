import { debounce } from './functions.js'
import { searchAllByTitle } from './OmdbApi.js'

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

const searchDebounce = debounce(async function (text) {
	if (!text) {
		return
	}

	const data = await searchAllByTitle(text)
	renderSearchList(data.Search)
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
		this.value.shift()
		this.value.push(movie)
		sessionStorage.setItem('recentMovies', JSON.stringify(this.value))
	},
}
let showPopular = true
let showSearch = false

const initialUrl = new URL(window.location)

if (initialUrl.searchParams.has('search')) {
	const searchString = initialUrl.searchParams.get('search')
	searchInput.value = searchString
	searchDebounce(searchString, 0)

	showSearch = true
	showPopular = false
	recentMovies.currentState = false
}

searchButtonMobile.addEventListener('click', () => {
	header.classList.toggle('mobile-search')
})

closeButton.addEventListener('click', () => {
	modal.close()
})

searchForm.addEventListener('submit', async (e) => {
	e.preventDefault()
	searchDebounce(undefined, 0)

	const text = searchInput.value

	const data = await searchAllByTitle(text)
	renderSearchList(data.Search)
})

searchForm.addEventListener('reset', (e) => {
	searchDebounce(undefined, 0)

	const searchParams = new URLSearchParams(window.location.search)
	searchParams.delete('search')

	window.history.replaceState({}, '', `?${searchParams.toString()}`)

	showSearch = false
	showPopular = true
	recentMovies.currentState = true

	searchSection.classList.toggle('hidden', !showSearch)
	popularSection.classList.toggle('hidden', !showPopular)
	recentSection.classList.toggle('hidden', !recentMovies.shouldShow())
})

searchInput.addEventListener('input', function (e) {
	searchDebounce(e.target.value)

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
 */
function renderSearchList (data) {
	const sortedData = [...data].sort((a, b) => {
		return Number(b.Year) - Number(a.Year)
	})

	if (!'content' in document.createElement('template')) {
		return
	}

	const parent = searchSection.querySelector('.grid-container')
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
		if (rating) {
			rating.parentNode.removeChild(rating)
		}

		parent.appendChild(clone)
	}

	showSearch = true
	showPopular = false
	recentMovies.currentState = false

	searchSection.classList.toggle('hidden', !showSearch)
	popularSection.classList.toggle('hidden', !showPopular)
	recentSection.classList.toggle('hidden', !recentMovies.shouldShow())
}
