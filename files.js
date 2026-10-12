/* 폰에 저장할 파일 목록. 파일을 추가하거나 이름을 바꾸면 여기도 고치고 VERSION 숫자를 올려요. */
self.APP_VERSION = 'v4.5';
// 저장 이름에 주소 경로를 넣어서, 같은 github.io 주소의 다른 버전(v2, v3) 저장본을 지우지 않게 함
self.APP_PREFIX = 'tokyo-yaho@' + new URL('./', self.location.href).pathname;
self.APP_CACHE = self.APP_PREFIX + self.APP_VERSION;
self.APP_FILES = [
  './', 'index.html', 'style.css', 'app.js', 'files.js', 'manifest.webmanifest',
  'fonts/YahoSans-Variable.woff2',
  'lib/leaflet/leaflet.js', 'lib/leaflet/leaflet.css',
  'data/map/tokyo.json',
  'data/map/narita.json',
  'img/places/narita-airport.jpg',
  'img/places/odaiba-seaside.jpg',
  'img/places/rainbow-bridge.jpg',
  'img/places/divercity.jpg',
  'img/places/akihabara.jpg',
  'img/places/wb-tokyo.jpg',
  'img/places/disneysea.jpg',
  'img/places/shinshoji.jpg',
  'img/food/ramen.jpg',
  'img/food/takoyaki.jpg',
  'img/food/udon.jpg',
  'img/food/unaju.jpg',
  'img/food/dango.jpg',
  'img/food/pizza.jpg',
  'img/food/burger.jpg',
  'img/food/gyoza.jpg',
  'img/food/sushi.jpg',
  'img/food/sandwich.jpg',
  'data/dishes.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'data/trip.json', 'data/schedule.json', 'data/places.json', 'data/notices.json',
  'data/contacts.json', 'data/phrases.json', 'data/etiquette.json', 'data/emergency.json',
  'data/lost.json', 'data/checklist.json', 'data/missions.json', 'data/quiz.json'
  /* 장소 사진이나 지도 이미지를 넣으면 여기에 경로를 더해요. 예: 'img/sensoji.jpg' */
];
