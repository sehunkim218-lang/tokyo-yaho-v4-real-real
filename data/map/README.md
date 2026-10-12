# 오프라인 지도 (tokyo.json, narita.json)

- tokyo.json 범위: 위도 35.60–35.76, 경도 139.60–139.90 (신주쿠·시부야·이케부쿠로·우에노·아사쿠사·도쿄역·오다이바·디즈니 리조트·네리마 워너 브라더스 스튜디오 부근)
- narita.json 범위: 위도 35.74–35.82, 경도 140.28–140.42 (JR·게이세이 나리타역, 나리타산 신승사, 나리타공항 터미널·활주로)
- 내용: 철도·지하철 노선, 역(도쿄 413곳, 나리타 9곳, 일본어 + 한국어 이름), 공항 활주로·터미널, 큰길, 강·바다, 공원, 동네 이름, 명소·박물관 이름
- 출처: © OpenStreetMap contributors. 이 파일은 OpenStreetMap 데이터를 가공한 것으로 ODbL(https://opendatacommons.org/licenses/odbl/) 을 따름. 지도 화면 왼쪽 아래에 출처가 표시됨.
- 데이터 기준일: 2026-05-31 (OpenStreetMap)
- 역의 한국어 이름은 OpenStreetMap 기여자들이 넣은 표기라 맞춤법이 조금씩 다를 수 있음

## 다시 만들기
1. `tools/tokyo-query.overpassql`, `tools/narita-west-query.overpassql` 내용을 https://overpass-turbo.eu 에 붙여 넣고 내보내기 → raw data 다운로드 (서버 오류가 나면 설정에서 서버를 다른 곳으로 바꿈)
2. `pip install shapely` 후
   - `python tools/osm2yaho.py data/map/tokyo.json 35.600 139.600 35.760 139.900 도쿄.json 나리타서쪽.json`
   - `python tools/osm2yaho.py data/map/narita.json 35.740 140.280 35.820 140.420 나리타서쪽.json`
   - narita.json은 만든 뒤 center를 [35.778, 140.354], zoom을 12로 고쳐 신승사와 공항이 한 화면에 보이게 함
3. `files.js`의 APP_VERSION 올리기
