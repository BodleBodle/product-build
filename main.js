// Firebase 설정 (여기에 본인의 Firebase 프로젝트 설정을 입력하세요)
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const cafeList = document.getElementById('cafe-list');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const themeSwitch = document.getElementById('checkbox');

let map;
let infoWindow;

// 초기 데이터 (최초 1회 Firestore에 저장할 때 사용)
const cafes = [
  {
    "name": "카페윤",
    "address": "부산광역시 기장군 기장읍 기장해안로 34-16",
    "lat": 35.1915,
    "lng": 129.2245,
    "facilities": {
      "nursingRoom": true,
      "diaperTable": true,
      "babyChair": true
    },
    "description": "탁 트인 오션뷰와 넓은 주차장을 갖춘 카페로, 수유실과 기저귀 갈이대가 잘 구비되어 있어 부모님들이 선호하는 곳입니다."
  },
  {
    "name": "보몽드",
    "address": "부산광역시 기장군 장안읍 구기길 19-7",
    "lat": 35.3188,
    "lng": 129.2482,
    "facilities": {
      "nursingRoom": true,
      "diaperTable": true,
      "babyChair": true
    },
    "description": "유럽풍 정원 스타일의 대형 카페로, 별도의 수유 시설을 갖추고 있어 아이와 산책하며 머물기 좋습니다."
  },
  {
    "name": "칠암사계",
    "address": "부산광역시 기장군 일광읍 칠암1길 7-10",
    "lat": 35.2694,
    "lng": 129.2625,
    "facilities": {
      "nursingRoom": false,
      "diaperTable": true,
      "babyChair": true
    },
    "description": "이흥용 명장의 베이커리 카페로 소금빵이 유명합니다. 대형 매장이라 유모차 이동이 비교적 수월하며 기저귀 갈이 시설이 있습니다."
  },
  {
    "name": "캐비네 드 쁘아송",
    "address": "부산광역시 기장군 기장읍 기장해안로 268-31",
    "lat": 35.1966,
    "lng": 129.2272,
    "facilities": {
      "nursingRoom": true,
      "diaperTable": true,
      "babyChair": true
    },
    "description": "아난티 코브 내부에 위치하여 호텔급 수유실과 편의시설을 함께 이용할 수 있는 프리미엄 카페입니다."
  },
  {
    "name": "탄티 (TANTI)",
    "address": "부산광역시 기장군 정관읍 달음산길 37",
    "lat": 35.3216,
    "lng": 129.1764,
    "facilities": {
      "nursingRoom": false,
      "diaperTable": false,
      "babyChair": true
    },
    "description": "달음산 자락에 위치한 정관의 베이커리 카페로, 넓은 실내 공간과 유모차 접근성이 좋습니다."
  },
  {
    "name": "아뜰리에 은유재",
    "address": "부산광역시 기장군 일광읍 삼성3길 7",
    "lat": 35.2575,
    "lng": 129.2318,
    "facilities": {
      "nursingRoom": false,
      "diaperTable": false,
      "babyChair": true
    },
    "description": "도자기 공방을 겸한 감성적인 카페로, 조용한 분위기에서 아이와 함께 차 한잔하기 좋은 공간입니다."
  }
];

// Firestore에 데이터를 추가하는 함수 (최초 1회 실행 후 주석 처리 권장)
async function uploadCafesToFirestore() {
  const batch = db.batch();
  cafes.forEach((cafe) => {
    const cafeRef = db.collection('cafes').doc(); // 자동 ID 생성
    batch.set(cafeRef, cafe);
  });
  
  try {
    await batch.commit();
    console.log("Firestore에 모든 카페 데이터가 성공적으로 추가되었습니다.");
  } catch (error) {
    console.error("데이터 추가 중 오류 발생: ", error);
  }
}

// Firestore에서 데이터를 불러와 지도에 표시하는 함수
async function loadCafesFromFirestore() {
  try {
    const querySnapshot = await db.collection('cafes').get();
    const cafesFromDb = [];
    
    querySnapshot.forEach((doc) => {
      const cafe = doc.data();
      cafesFromDb.push(cafe);
      
      if (cafe.lat && cafe.lng) {
        const hasNursingRoom = cafe.facilities && cafe.facilities.nursingRoom;
        const content = hasNursingRoom ? "수유실/기저귀 갈이대 완비" : "수유실 정보 없음";
        // 수유실이 있는 곳은 특별한 아이콘(파란색)으로 표시
        const iconUrl = hasNursingRoom 
          ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" 
          : "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
          
        addMarker({ lat: cafe.lat, lng: cafe.lng }, cafe.name, cafe.description || content, iconUrl);
      }
    });
    
    displayCafes(cafesFromDb);
  } catch (error) {
    console.error("데이터 로드 중 오류 발생: ", error);
  }
}

function initMap() {
  // 초기 지도 설정 (대한민국 중심)
  const initialLocation = { lat: 36.5, lng: 127.5 };
  
  map = new google.maps.Map(document.getElementById("map"), {
    center: initialLocation,
    zoom: 7,
    mapTypeControl: false,
  });

  infoWindow = new google.maps.InfoWindow();

  // 내 위치 찾기 기능
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        new google.maps.Marker({
          position: pos,
          map: map,
          title: "내 위치",
          icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        });

        map.setCenter(pos);
      },
      () => {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  }

  // Firestore에서 데이터를 불러와 마커 표시
  loadCafesFromFirestore();
}

function addMarker(location, title, content, iconUrl) {
  const marker = new google.maps.Marker({
    position: location,
    map: map,
    title: title,
    icon: {
      url: iconUrl,
      scaledSize: new google.maps.Size(35, 35) // 특별 아이콘은 조금 더 크게
    }
  });

  const infowindow = new google.maps.InfoWindow({
    content: `<div style="max-width:200px;"><h3>${title}</h3><p>${content}</p></div>`,
  });

  marker.addListener("click", () => {
    infowindow.open(map, marker);
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  console.error(browserHasGeolocation ? "위치 권한을 거부하셨습니다." : "브라우저가 위치 정보를 지원하지 않습니다.");
}

function displayCafes(cafesToDisplay) {
  cafeList.innerHTML = '';
  // 수유실이 있는 카페만 필터링 (새로운 데이터 구조 대응)
  const filteredCafes = cafesToDisplay.filter(cafe => cafe.facilities && cafe.facilities.nursingRoom);

  if (filteredCafes.length === 0) {
    cafeList.innerHTML = '<p>수유실이 있는 카페를 찾을 수 없습니다.</p>';
    return;
  }

  filteredCafes.forEach(cafe => {
    const cafeCard = document.createElement('div');
    cafeCard.className = 'cafe-card';
    cafeCard.innerHTML = `
      <h2>${cafe.name}</h2>
      <p>${cafe.address || cafe.location}</p>
      <p style="font-size: 0.9em; color: #666;">${cafe.description || ""}</p>
    `;
    cafeList.appendChild(cafeCard);
  });
}

function searchCafes() {
  const searchTerm = searchInput.value.toLowerCase();
  // Firestore에서 가져온 전체 데이터를 기반으로 검색하도록 하려면 별도 상태 관리가 필요할 수 있으나,
  // 현재는 초기 cafes 배열 기준으로 동작하거나 displayCafes를 재호출하는 구조입니다.
  // 여기서는 간단히 초기 cafes 배열을 예시로 필터링합니다.
  const filteredCafes = cafes.filter(cafe => {
    const searchTarget = (cafe.name + (cafe.address || cafe.location) + (cafe.description || "")).toLowerCase();
    return searchTarget.includes(searchTerm);
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

// 초기 실행 시 화면 표시 (데이터 구조 변경 반영)
displayCafes(cafes);

(function() { // Disqus 등 기타 스크립트
var d = document, s = d.createElement('script');
s.src = 'https://product-build.disqus.com/embed.js';
s.setAttribute('data-timestamp', +new Date());
(d.head || d.body).appendChild(s);
})();
