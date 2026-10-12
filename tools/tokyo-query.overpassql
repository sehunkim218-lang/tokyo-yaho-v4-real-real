[out:json][timeout:300][bbox:35.600,139.640,35.760,139.900];
(
 way[railway~"^(rail|subway|light_rail|monorail)$"][!service];
 way[highway~"^(motorway|trunk|primary|secondary)$"];
 way[waterway~"^(river|canal)$"];
 way[natural=water];
 relation[natural=water];
 way[natural=coastline];
 way[leisure~"^(park|garden)$"][name];
 relation[leisure=park][name];
 node[railway=station];
 node[place~"^(suburb|quarter)$"];
);
out geom;
nwr[tourism~"^(attraction|museum)$"][name][wikidata];
out center tags;
