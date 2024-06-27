const API_KEY = ''

const header = document.querySelector('.header')
const searchButtonMobile = document.querySelector('#search-button-mobile')

searchButtonMobile.addEventListener('click', () => {
	header.classList.toggle('mobile-search')
})
