const cafeList = document.getElementById('cafe-list');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const themeSwitch = document.getElementById('checkbox');

const cafes = [
  { name: '별다방', location: '서울시 강남구', hasNursingRoom: true },
  { name: '콩다방', location: '서울시 서초구', hasNursingRoom: true },
  { name: '이디야', location: '서울시 송파구', hasNursingRoom: false },
  { name: '카페베네', location: '경기도 성남시 분당구', hasNursingRoom: true },
  { name: '탐앤탐스', location: '경기도 수원시 팔달구', hasNursingRoom: false },
  { name: '스타벅스', location: '인천시 부평구', hasNursingRoom: true },
  { name: '커피빈', location: '서울시 마포구', hasNursingRoom: true },
];

function displayCafes(cafesToDisplay) {
  cafeList.innerHTML = '';
  const filteredCafes = cafesToDisplay.filter(cafe => cafe.hasNursingRoom);

  if (filteredCafes.length === 0) {
    cafeList.innerHTML = '<p>수유실이 있는 카페를 찾을 수 없습니다.</p>';
    return;
  }

  filteredCafes.forEach(cafe => {
    const cafeCard = document.createElement('div');
    cafeCard.className = 'cafe-card';
    cafeCard.innerHTML = `
      <h2>${cafe.name}</h2>
      <p>${cafe.location}</p>
    `;
    cafeList.appendChild(cafeCard);
  });
}

function searchCafes() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredCafes = cafes.filter(cafe => {
    return (cafe.name.toLowerCase().includes(searchTerm) || cafe.location.toLowerCase().includes(searchTerm));
  });
  displayCafes(filteredCafes);
}

function toggleTheme() {
  if (themeSwitch.checked) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }
}

// Check for saved theme preference on load
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
  themeSwitch.checked = true;
  document.body.classList.add('dark-mode');
}

searchButton.addEventListener('click', searchCafes);
searchInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    searchCafes();
  }
});
themeSwitch.addEventListener('change', toggleTheme);

// Initially display all cafes with nursing rooms
displayCafes(cafes);

/**
*  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
*  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */
/*
var disqus_config = function () {
this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
};
*/
(function() { // DON'T EDIT BELOW THIS LINE
var d = document, s = d.createElement('script');
s.src = 'https://product-build.disqus.com/embed.js';
s.setAttribute('data-timestamp', +new Date());
(d.head || d.body).appendChild(s);
})();
