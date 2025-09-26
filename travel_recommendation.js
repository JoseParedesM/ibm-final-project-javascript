const btnSearch = document.getElementById('btnSearch');
const btnClear = document.getElementById('btnClearSearch');
const input = document.getElementById('destinationSearch');
const main = document.querySelector('main');

function normalize(str) {
	return str.trim().toLowerCase();
}

function matchesCategory(term, category) {
	let variants = [category];
	if (category === 'country') {
		variants.push('countries');
	} else {
		variants.push(category + 's');
	}
	return variants.some(v => normalize(term).includes(normalize(v)));
}

function createCard(item, type) {
	const card = document.createElement('div');
	card.className = 'result-card';
	let imgUrl = item.imageUrl || '';
	card.innerHTML = `
		<div class="result-img-wrap">
			<img src="${imgUrl}" alt="${item.name}" class="result-img" onerror="this.style.display='none'">
		</div>
		<div class="result-info">
			<h3 class="result-title">${item.name}</h3>
			<p class="result-desc">${item.description || ''}</p>
			<button class="result-btn">Visit</button>
		</div>
	`;
	return card;
}

function showResults(title, items, type) {
	// Remove previous results
	let oldResults = document.querySelector('.search-results');
	if (oldResults) oldResults.remove();
	const resultsSection = document.createElement('section');
	resultsSection.className = 'search-results';
	resultsSection.innerHTML = `<h2 class="results-title">${title}</h2>`;
	const resultsGrid = document.createElement('div');
	resultsGrid.className = 'results-grid';
	items.forEach(item => {
		resultsGrid.appendChild(createCard(item, type));
	});
	resultsSection.appendChild(resultsGrid);
	main.appendChild(resultsSection);
}

btnSearch.addEventListener('click', async () => {
	const term = input.value;
	if (!term) return;
	try {
		const res = await fetch('./travel_recommendation_api.json');
		const data = await res.json();
		if (matchesCategory(term, 'beach')) {
			showResults('Beaches', data.beaches, 'beach');
		} else if (matchesCategory(term, 'country')) {
			// Para countries, mostrar ciudades agrupadas
			let cities = [];
			data.countries.forEach(c => cities = cities.concat(c.cities.map(city => ({...city, name: city.name}))));
			showResults('Countries and cities', cities, 'country');
		} else if (matchesCategory(term, 'temple')) {
			showResults('Temples', data.temples, 'temple');
		} else {
			// Si no coincide, limpiar resultados
			let oldResults = document.querySelector('.search-results');
			if (oldResults) oldResults.remove();
		}
	} catch (err) {
		alert('Error loading recommendations');
	}
});

btnClear.addEventListener('click', () => {
	input.value = '';
	let oldResults = document.querySelector('.search-results');
	if (oldResults) oldResults.remove();
});
