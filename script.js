const API_KEY = ''

const header = document.querySelector('.header')
const searchButtonMobile = document.querySelector('#search-button-mobile')
const modal = document.querySelector('.details-modal')
const closeButton = document.querySelector('.details-modal .close')

searchButtonMobile.addEventListener('click', () => {
	header.classList.toggle('mobile-search')
})

closeButton.addEventListener('click', () => {
	modal.close()
})
