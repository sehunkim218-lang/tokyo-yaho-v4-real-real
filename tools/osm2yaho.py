"""OpenStreetMap(Overpass JSON) -> data/map/tokyo.json (도쿄 야호 오프라인 지도)"""
import json, sys, math
from collections import defaultdict
from shapely.geometry import LineString, Polygon, box, Point, MultiPolygon, GeometryCollection
from shapely.ops import unary_union, polygonize, linemerge, nearest_points

# 사용법: python osm2yaho.py 결과.json 남 서 북 동 받은파일1.json [받은파일2.json ...]
OUT = sys.argv[1]
S, W, N, E = map(float, sys.argv[2:6])
SRCS = sys.argv[6:]
BB = box(W, S, E, N)  # x=lng, y=lat
els, _seen = [], set()
for src in SRCS:
    for el in json.load(open(src, encoding='utf-8'))['elements']:
        k = (el['type'], el['id'])
        if k in _seen: continue
        _seen.add(k); els.append(el)

def ls(geom):
    return [(p['lon'], p['lat']) for p in geom if p]

def pack(coords):
    out = []
    for x, y in coords:
        out += [int(round(y * 1e5)), int(round(x * 1e5))]
    return out

def lines_of(g):
    if g.is_empty: return []
    if g.geom_type == 'LineString': return [g]
    if g.geom_type in ('MultiLineString', 'GeometryCollection'):
        r = []
        for x in g.geoms: r += lines_of(x)
        return r
    return []

def polys_of(g):
    if g.is_empty: return []
    if g.geom_type == 'Polygon': return [g]
    if g.geom_type in ('MultiPolygon', 'GeometryCollection'):
        r = []
        for x in g.geoms: r += polys_of(x)
        return r
    return []

def safe_merge(g):
    ls_ = lines_of(g)
    if not ls_: return g
    try: return linemerge(ls_)
    except Exception: return g

def poly_pack(p):
    rings = [pack(list(p.exterior.coords))]
    for h in p.interiors: rings.append(pack(list(h.coords)))
    return rings

layers = defaultdict(list)
water_polys, park_polys, coast, terminal_polys = [], [], [], []
stations, areas, marks = [], [], []

def rel_polys(el):
    outers = [LineString(ls(m['geometry'])) for m in el.get('members', []) if m.get('type') == 'way' and m.get('role') in ('outer', '') and m.get('geometry') and len(m['geometry']) > 1]
    inners = [LineString(ls(m['geometry'])) for m in el.get('members', []) if m.get('type') == 'way' and m.get('role') == 'inner' and m.get('geometry') and len(m['geometry']) > 1]
    o = unary_union(list(polygonize(safe_merge(unary_union(outers))))) if outers else Polygon()
    if inners:
        i = unary_union(list(polygonize(safe_merge(unary_union(inners)))))
        o = o.difference(i)
    return o

for el in els:
    t = el.get('tags', {})
    if el['type'] == 'node':
        name = t.get('name:ja') or t.get('name')
        if not name: continue
        if t.get('railway') == 'station':
            stations.append((name, el['lat'], el['lon'], t.get('name:ko'), t.get('operator', '')))
        elif t.get('place') in ('suburb', 'quarter'):
            areas.append((name, el['lat'], el['lon'], t.get('name:ko'), t.get('place')))
        elif t.get('tourism'):
            marks.append((name, el['lat'], el['lon']))
        continue
    if 'center' in el and t.get('tourism'):
        name = t.get('name:ja') or t.get('name')
        if name: marks.append((name, el['center']['lat'], el['center']['lon']))
        continue
    if el['type'] == 'way' and el.get('geometry'):
        c = ls(el['geometry'])
        if len(c) < 2: continue
        closed = c[0] == c[-1] and len(c) >= 4
        rw, hw, aw = t.get('railway'), t.get('highway'), t.get('aeroway')
        if aw == 'runway':
            layers['runway'].append(LineString(c)); continue
        if aw == 'terminal' and closed:
            terminal_polys.append(Polygon(c)); continue
        if rw in ('rail', 'light_rail', 'monorail', 'subway'):
            under = rw == 'subway' or t.get('tunnel') in ('yes', 'building_passage') or t.get('layer', '0').startswith('-')
            layers['subway' if under else 'rail'].append(LineString(c))
        elif hw in ('motorway', 'trunk', 'primary'):
            if t.get('tunnel') != 'yes': layers['major'].append(LineString(c))
        elif hw in ('secondary', 'tertiary'):
            if t.get('tunnel') != 'yes': layers['road'].append(LineString(c))
        elif t.get('waterway') in ('river', 'canal'):
            if t.get('tunnel') != 'yes': layers['river'].append(LineString(c))
        elif t.get('natural') == 'coastline':
            coast.append(LineString(c))
        elif t.get('natural') == 'water' and closed:
            water_polys.append(Polygon(c))
        elif t.get('leisure') in ('park', 'garden') and closed:
            park_polys.append(Polygon(c))
    elif el['type'] == 'relation':
        try:
            g = rel_polys(el)
        except Exception:
            continue
        if t.get('natural') == 'water': water_polys.append(g)
        elif t.get('leisure') == 'park': park_polys.append(g)

out_layers = {}
TOL = {'runway': 0.00002, 'rail': 0.00003, 'subway': 0.00005, 'major': 0.00003, 'road': 0.00004, 'river': 0.00005}
for k, arr in layers.items():
    merged = safe_merge(unary_union(arr).intersection(BB)) if arr else None
    res = []
    for l in lines_of(merged):
        l = l.simplify(TOL[k], preserve_topology=False)
        if l.length > 0.0003: res.append(pack(list(l.coords)))
    out_layers[k] = res

def area_layer(polys, tol, min_area):
    g = unary_union([p.buffer(0) for p in polys if not p.is_empty]).intersection(BB)
    res = []
    for p in polys_of(g):
        if p.area < min_area: continue
        p = p.simplify(tol, preserve_topology=True)
        if not p.is_empty and p.geom_type == 'Polygon': res.append(poly_pack(p))
    return res

out_layers['water'] = area_layer(water_polys, 0.00004, 2e-7)
out_layers['park'] = area_layer(park_polys, 0.00004, 3e-7)
if terminal_polys: out_layers['terminal'] = area_layer(terminal_polys, 0.00002, 1e-8)

# 해안선으로 육지 만들기 (OSM 해안선은 진행 방향 왼쪽이 육지)
land = []
if coast:
    cl = unary_union(coast).intersection(BB)
    cls = lines_of(safe_merge(cl)) if not cl.is_empty else []
    pieces = list(polygonize(unary_union(cls + [BB.boundary])))
    # 해안선 조각마다 왼쪽(육지)·오른쪽(바다)에 있는 면에 표를 줌
    from shapely.strtree import STRtree
    tree = STRtree(pieces)
    votes = [0] * len(pieces)
    eps = 0.00002
    def piece_at(pt):
        for i in tree.query(pt):
            if pieces[i].contains(pt): return i
        return None
    for l in cls:
        cc = list(l.coords)
        for i in range(len(cc) - 1):
            (x1, y1), (x2, y2) = cc[i], cc[i + 1]
            dx, dy = x2 - x1, y2 - y1
            ln = math.hypot(dx, dy)
            if ln < 1e-7: continue
            mx, my = (x1 + x2) / 2, (y1 + y2) / 2
            nx, ny = -dy / ln * eps, dx / ln * eps
            li = piece_at(Point(mx + nx, my + ny)); ri = piece_at(Point(mx - nx, my - ny))
            if li is not None: votes[li] += 1
            if ri is not None: votes[ri] -= 1
    land = [pc for pc, v in zip(pieces, votes) if v > 0]
    out_layers['land'] = [poly_pack(p.simplify(0.00003, preserve_topology=True)) for p in polys_of(unary_union(land)) if p.area > 1e-7]
else:
    out_layers['land'] = [poly_pack(BB)]

# 역: 같은 이름끼리 묶기 (가까운 것만)
groups = []
for name, lat, lon, ko, op in stations:
    for g in groups:
        if g['n'] == name and abs(g['lat'] - lat) < 0.006 and abs(g['lon'] - lon) < 0.007:
            g['pts'].append((lat, lon)); g['ops'].add(op); g['ko'] = g['ko'] or ko; break
    else:
        groups.append({'n': name, 'lat': lat, 'lon': lon, 'pts': [(lat, lon)], 'ops': {op}, 'ko': ko})
st_out = []
for g in groups:
    lat = sum(p[0] for p in g['pts']) / len(g['pts']); lon = sum(p[1] for p in g['pts']) / len(g['pts'])
    if not (S <= lat <= N and W <= lon <= E): continue
    rank = len(g['pts']) + len([o for o in g['ops'] if o])
    import re as _re
    ko = _re.sub(r'\s*\(.*?\)', '', (g['ko'] or '')).strip()
    ko = _re.sub(r'\s*역$', '', ko).strip()
    st_out.append([g['n'], round(lat, 5), round(lon, 5), ko, rank])
st_out.sort(key=lambda s: -s[4])

ar_out = [[n, round(a, 5), round(b, 5), ko or ''] for n, a, b, ko, pl in areas if pl in ('suburb', 'quarter') and S <= a <= N and W <= b <= E]
seen = set(); mk_out = []
for n, a, b in marks:
    if n in seen or not (S <= a <= N and W <= b <= E): continue
    seen.add(n); mk_out.append([n, round(a, 5), round(b, 5)])

span = max(N - S, (E - W) * 0.8)
zoom = 12 if span > 0.12 else 13
res = {
    'bounds': [[S, W], [N, E]], 'center': [round((S + N) / 2, 4), round((W + E) / 2, 4)], 'zoom': zoom, 'minZoom': zoom - 1,
    'attribution': '© OpenStreetMap contributors (ODbL)',
    'source': 'OpenStreetMap via Overpass API', 'layers': out_layers,
    'stations': st_out, 'areas': ar_out, 'landmarks': mk_out,
}
json.dump(res, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
import os
print('size', os.path.getsize(OUT) // 1024, 'KB', {k: len(v) for k, v in out_layers.items()}, 'stations', len(st_out), 'areas', len(ar_out), 'marks', len(mk_out))
