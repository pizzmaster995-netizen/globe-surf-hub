import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Compass, Waves, User, Lock, LogIn, LogOut, Search, X, Globe,
  ArrowRight, ArrowLeft, ChevronRight, MapPin
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  DATEN                                                              */
/* ------------------------------------------------------------------ */

interface Spot {
  id: string;
  name: string;
  iso: string;
  region: string;
  lat: number;
  lng: number;
  wave: string;
  level: string;
  season: string;
  continent: string;
  lv: string;
  suitable: string[];
}

interface CampListing {
  id: string;
  title: string;
  location: string;
  country: string;
  price: string;
  rating: number;
  image: string;
  type: 'Camp' | 'Rental';
}

const CONTINENTS = ['Europa', 'Afrika', 'Asien', 'Amerika', 'Ozeanien'];

const CONT_COLORS: Record<string, string> = {
  Europa: '#38bdf8',
  Afrika: '#f59e0b',
  Asien: '#f472b6',
  Amerika: '#34d399',
  Ozeanien: '#a78bfa'
};

// Kartenausschnitte [[Süd, West], [Nord, Ost]]
const WORLD_BOUNDS: [number, number][] = [[-58, -170], [75, 180]];
const CONT_BOUNDS: Record<string, [number, number][]> = {
  Europa: [[34, -12], [62, 32]],
  Afrika: [[-36, -20], [37, 52]],
  Asien: [[-10, 60], [52, 146]],
  Amerika: [[-56, -168], [62, -34]],
  Ozeanien: [[-48, 112], [-5, 180]]
};

// Welche Länder (ISO-Code) gehören zu welchem Kontinent (für die Einfärbung)
const CONT_CODES: Record<string, string> = {
  Europa: 'ALB AND AUT BLR BEL BIH BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN ISL IRL ITA XKX LVA LIE LTU LUX MKD MLT MDA MNE NLD NOR POL PRT ROU SRB SVK SVN ESP SWE CHE UKR GBR',
  Afrika: 'DZA AGO BEN BWA BFA BDI CMR CPV CAF TCD COM COG COD CIV DJI EGY GNQ ERI ETH GAB GMB GHA GIN GNB KEN LSO LBR LBY MDG MWI MLI MRT MUS MAR MOZ NAM NER NGA RWA STP SEN SYC SLE SOM SOL ZAF SSD SDN SWZ TZA TGO TUN UGA ESH ZMB ZWE',
  Asien: 'AFG ARM AZE BHR BGD BTN BRN KHM CHN GEO IND IDN IRN IRQ ISR JPN JOR KAZ KWT KGZ LAO LBN MYS MDV MNG MMR NPL PRK OMN PAK PSE PHL QAT RUS SAU SGP KOR LKA SYR TWN TJK THA TLS TUR TKM ARE UZB VNM YEM',
  Amerika: 'ATG ARG BHS BRB BLZ BOL BRA CAN CHL COL CRI CUB DOM DMA ECU SLV GRD GTM GUY HTI HND JAM MEX NIC PAN PRY PER KNA LCA VCT SUR TTO USA URY VEN GRL PRI',
  Ozeanien: 'AUS NZL FJI PNG SLB VUT WSM NCL TON KIR'
};

const ISO_TO_CONT: Record<string, string> = {};
Object.entries(CONT_CODES).forEach(([cont, codes]) => {
  codes.split(' ').forEach(c => { ISO_TO_CONT[c] = cont; });
});

// Manche Länder haben in der Karten-Datei keinen gültigen Code, deshalb Korrektur über den Namen
const NAME_FIX: Record<string, string> = { France: 'FRA', Norway: 'NOR', Kosovo: 'XKX' };

const GEO_URLS = [
  'https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json',
  'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json'
];

const COUNTRIES: Record<string, { name: string; continent: string }> = {
  PRT: { name: 'Portugal', continent: 'Europa' },
  ESP: { name: 'Spanien', continent: 'Europa' },
  FRA: { name: 'Frankreich', continent: 'Europa' },
  GBR: { name: 'Großbritannien', continent: 'Europa' },
  IRL: { name: 'Irland', continent: 'Europa' },
  NOR: { name: 'Norwegen', continent: 'Europa' },
  ITA: { name: 'Italien', continent: 'Europa' },
  DEU: { name: 'Deutschland', continent: 'Europa' },
  NLD: { name: 'Niederlande', continent: 'Europa' },
  DNK: { name: 'Dänemark', continent: 'Europa' },
  MAR: { name: 'Marokko', continent: 'Afrika' },
  ZAF: { name: 'Südafrika', continent: 'Afrika' },
  SEN: { name: 'Senegal', continent: 'Afrika' },
  CPV: { name: 'Kap Verde', continent: 'Afrika' },
  MUS: { name: 'Mauritius', continent: 'Afrika' },
  NAM: { name: 'Namibia', continent: 'Afrika' },
  MOZ: { name: 'Mosambik', continent: 'Afrika' },
  GHA: { name: 'Ghana', continent: 'Afrika' },
  LBR: { name: 'Liberia', continent: 'Afrika' },
  IDN: { name: 'Indonesien', continent: 'Asien' },
  PHL: { name: 'Philippinen', continent: 'Asien' },
  LKA: { name: 'Sri Lanka', continent: 'Asien' },
  MDV: { name: 'Malediven', continent: 'Asien' },
  JPN: { name: 'Japan', continent: 'Asien' },
  THA: { name: 'Thailand', continent: 'Asien' },
  VNM: { name: 'Vietnam', continent: 'Asien' },
  IND: { name: 'Indien', continent: 'Asien' },
  USA: { name: 'USA (inkl. Hawaii)', continent: 'Amerika' },
  PRI: { name: 'Puerto Rico', continent: 'Amerika' },
  CAN: { name: 'Kanada', continent: 'Amerika' },
  MEX: { name: 'Mexiko', continent: 'Amerika' },
  CRI: { name: 'Costa Rica', continent: 'Amerika' },
  PAN: { name: 'Panama', continent: 'Amerika' },
  NIC: { name: 'Nicaragua', continent: 'Amerika' },
  SLV: { name: 'El Salvador', continent: 'Amerika' },
  DOM: { name: 'Dominikanische Republik', continent: 'Amerika' },
  BRB: { name: 'Barbados', continent: 'Amerika' },
  PER: { name: 'Peru', continent: 'Amerika' },
  ECU: { name: 'Ecuador', continent: 'Amerika' },
  CHL: { name: 'Chile', continent: 'Amerika' },
  BRA: { name: 'Brasilien', continent: 'Amerika' },
  ARG: { name: 'Argentinien', continent: 'Amerika' },
  URY: { name: 'Uruguay', continent: 'Amerika' },
  AUS: { name: 'Australien', continent: 'Ozeanien' },
  NZL: { name: 'Neuseeland', continent: 'Ozeanien' },
  FJI: { name: 'Fidschi', continent: 'Ozeanien' }
};

const WAVES: Record<string, string> = { P: 'Pointbreak', R: 'Reefbreak', B: 'Beachbreak', F: 'Flusswelle', G: 'Big Wave' };
const LEVELS: Record<string, string> = { A: 'Beginner', F: 'Intermediate', P: 'Pro', L: 'Alle Level' };

type LevelFilter = 'Alle' | 'Beginner' | 'Intermediate' | 'Pro';
const LEVEL_FILTERS: LevelFilter[] = ['Alle', 'Beginner', 'Intermediate', 'Pro'];
const ALL_LEVELS = ['Beginner', 'Intermediate', 'Pro'];

// Für welche Surfer-Level ist ein Spot geeignet? (Grundlage für Filter und Info-Chips)
const SUITABLE: Record<string, string[]> = {
  A: ['Beginner', 'Intermediate'],
  F: ['Intermediate', 'Pro'],
  P: ['Pro'],
  L: ['Beginner', 'Intermediate', 'Pro']
};

const WAVE_INFO: Record<string, string> = {
  Pointbreak: 'Die Welle läuft lang an einer Landzunge entlang: gleichmäßig und gut zu lesen, aber das Line-up ist oft voll.',
  Reefbreak: 'Die Welle bricht über Riff oder Fels. Sie ist sauber geformt, bei Stürzen besteht aber Verletzungsgefahr im flachen Wasser.',
  Beachbreak: 'Die Wellen brechen über Sandbänken. Das ist verzeihend, die Peaks wechseln aber mit Gezeit und Swell.',
  Flusswelle: 'Die Welle entsteht durch Fluss, Strömung und Sandbank und hängt stark von Gezeit und Wasserstand ab.',
  'Big Wave': 'Sehr große Wellen: nur für erfahrene Surfer mit Sicherheitsteam und passender Ausrüstung.'
};

const LEVEL_INFO: Record<string, string> = {
  A: 'Gut für Einsteiger und alle, die sicherer werden wollen. Softboards und Surfschulen sind hier üblich.',
  F: 'Du solltest sicher paddeln, Wellen selbst einschätzen und die Regeln im Line-up kennen.',
  P: 'Nur für erfahrene Surfer: starke Strömung sowie kraftvolle oder gefährliche Wellen. Bedingungen vorher genau prüfen.',
  L: 'Je nach Tag und Swell für alle Level geeignet. Bei großem Swell lieber vorsichtig sein.'
};

// Zeile: Name, Land (ISO), Region, Breitengrad, Längengrad, Wellentyp, Level, Beste Saison
// Wellentyp: P=Point, R=Reef, B=Beach, F=Fluss, G=Big Wave | Level: A=Anfänger, F=Fortgeschritten, P=Profi, L=Alle
type Row = [string, string, string, number, number, string, string, string];

const RAW: Row[] = [
  // ---------- EUROPA ----------
  ['Supertubos', 'PRT', 'Peniche', 39.3445, -9.364, 'B', 'P', 'Sep–Mär'],
  ['Baleal', 'PRT', 'Peniche', 39.373, -9.335, 'B', 'A', 'Ganzjährig'],
  ['Coxos', 'PRT', 'Ericeira', 38.9917, -9.4222, 'R', 'P', 'Okt–Mär'],
  ['Ribeira d\'Ilhas', 'PRT', 'Ericeira', 38.9886, -9.4189, 'P', 'L', 'Sep–Apr'],
  ['Praia do Norte', 'PRT', 'Nazaré', 39.6066, -9.085, 'G', 'P', 'Okt–Feb'],
  ['Guincho', 'PRT', 'Cascais', 38.7325, -9.473, 'B', 'F', 'Ganzjährig'],
  ['Carcavelos', 'PRT', 'Lissabon', 38.677, -9.338, 'B', 'A', 'Ganzjährig'],
  ['Arrifana', 'PRT', 'Algarve', 37.295, -8.865, 'B', 'L', 'Sep–Apr'],
  ['Amado', 'PRT', 'Algarve', 37.166, -8.904, 'B', 'A', 'Ganzjährig'],
  ['Jardim do Mar', 'PRT', 'Madeira', 32.748, -17.093, 'P', 'F', 'Nov–Mär'],
  ['Mundaka', 'ESP', 'Baskenland', 43.4075, -2.699, 'F', 'P', 'Sep–Mär'],
  ['Zarautz', 'ESP', 'Baskenland', 43.285, -2.17, 'B', 'L', 'Sep–Mai'],
  ['Sopelana', 'ESP', 'Baskenland', 43.386, -2.985, 'B', 'L', 'Sep–Mai'],
  ['Rodiles', 'ESP', 'Asturien', 43.517, -5.372, 'F', 'F', 'Okt–Mär'],
  ['Playa de Salinas', 'ESP', 'Asturien', 43.582, -5.953, 'B', 'L', 'Sep–Apr'],
  ['Pantín', 'ESP', 'Galicien', 43.642, -8.103, 'B', 'F', 'Sep–Apr'],
  ['El Palmar', 'ESP', 'Cádiz', 36.241, -6.082, 'B', 'A', 'Okt–Apr'],
  ['El Confital', 'ESP', 'Gran Canaria', 28.169, -15.441, 'R', 'P', 'Okt–Mär'],
  ['El Cotillo', 'ESP', 'Fuerteventura', 28.687, -14.012, 'B', 'L', 'Okt–Mär'],
  ['Famara', 'ESP', 'Lanzarote', 29.116, -13.563, 'B', 'L', 'Okt–Mär'],
  ['La Gravière', 'FRA', 'Hossegor', 43.672, -1.444, 'B', 'P', 'Sep–Nov'],
  ['Seignosse Le Penon', 'FRA', 'Landes', 43.693, -1.445, 'B', 'L', 'Sep–Okt'],
  ['Les Cavaliers', 'FRA', 'Anglet', 43.516, -1.541, 'B', 'L', 'Sep–Mai'],
  ['Grande Plage', 'FRA', 'Biarritz', 43.484, -1.559, 'B', 'A', 'Ganzjährig'],
  ['Parlementia', 'FRA', 'Guéthary', 43.422, -1.607, 'R', 'F', 'Okt–Mär'],
  ['Lacanau', 'FRA', 'Gironde', 45.0, -1.2, 'B', 'L', 'Sep–Okt'],
  ['Mimizan', 'FRA', 'Landes', 44.21, -1.287, 'B', 'L', 'Sep–Okt'],
  ['La Torche', 'FRA', 'Bretagne', 47.835, -4.35, 'B', 'F', 'Sep–Apr'],
  ['Fistral Beach', 'GBR', 'Cornwall', 50.415, -5.1, 'B', 'L', 'Sep–Mai'],
  ['Porthleven', 'GBR', 'Cornwall', 50.08, -5.317, 'R', 'P', 'Okt–Feb'],
  ['Croyde', 'GBR', 'Devon', 51.131, -4.24, 'B', 'L', 'Sep–Mai'],
  ['Thurso East', 'GBR', 'Schottland', 58.598, -3.515, 'R', 'P', 'Sep–Mär'],
  ['Mullaghmore Head', 'IRL', 'Sligo', 54.466, -8.457, 'G', 'P', 'Okt–Feb'],
  ['The Peak', 'IRL', 'Bundoran', 54.477, -8.282, 'R', 'F', 'Sep–Mär'],
  ['Lahinch', 'IRL', 'Clare', 52.933, -9.35, 'B', 'L', 'Sep–Apr'],
  ['Easkey', 'IRL', 'Sligo', 54.284, -8.966, 'R', 'F', 'Sep–Mär'],
  ['Unstad', 'NOR', 'Lofoten', 68.268, 13.57, 'B', 'F', 'Sep–Apr'],
  ['Orre Beach', 'NOR', 'Jæren', 58.724, 5.53, 'B', 'L', 'Sep–Apr'],
  ['Capo Mannu', 'ITA', 'Sardinien', 40.033, 8.383, 'P', 'F', 'Okt–Mär'],
  ['Eisbachwelle', 'DEU', 'München', 48.1436, 11.5878, 'F', 'F', 'Ganzjährig'],
  ['Westerland', 'DEU', 'Sylt', 54.908, 8.305, 'B', 'L', 'Sep–Mai'],
  ['Scheveningen', 'NLD', 'Den Haag', 52.106, 4.272, 'B', 'L', 'Sep–Mär'],
  ['Klitmøller (Cold Hawaii)', 'DNK', 'Thy', 57.042, 8.488, 'B', 'L', 'Sep–Apr'],

  // ---------- AFRIKA ----------
  ['Anchor Point', 'MAR', 'Taghazout', 30.5433, -9.711, 'P', 'F', 'Okt–Mär'],
  ['Imsouane Bay', 'MAR', 'Imsouane', 30.842, -9.823, 'P', 'L', 'Sep–Apr'],
  ['Tamri', 'MAR', 'Agadir', 30.7, -9.83, 'B', 'F', 'Okt–Mär'],
  ['Sidi Kaouki', 'MAR', 'Essaouira', 31.359, -9.801, 'B', 'L', 'Okt–Apr'],
  ['Jeffreys Bay (Supertubes)', 'ZAF', 'Ostkap', -34.051, 24.93, 'P', 'P', 'Jun–Sep'],
  ['Seal Point', 'ZAF', 'Cape St Francis', -34.21, 24.83, 'P', 'F', 'Mai–Sep'],
  ['Muizenberg', 'ZAF', 'Kapstadt', -34.108, 18.47, 'B', 'A', 'Ganzjährig'],
  ['Dungeons', 'ZAF', 'Hout Bay', -34.033, 18.333, 'G', 'P', 'Mai–Sep'],
  ['Outer Kom', 'ZAF', 'Kommetjie', -34.145, 18.315, 'G', 'P', 'Mai–Sep'],
  ['North Beach', 'ZAF', 'Durban', -29.853, 31.046, 'B', 'L', 'Mär–Sep'],
  ['Ngor Right', 'SEN', 'Dakar', 14.75, -17.517, 'R', 'F', 'Okt–Mär'],
  ['Ponta Preta', 'CPV', 'Sal', 16.588, -22.902, 'B', 'F', 'Nov–Mär'],
  ['One Eye', 'MUS', 'Le Morne', -20.475, 57.318, 'R', 'P', 'Mai–Okt'],
  ['Tamarin Bay', 'MUS', 'Tamarin', -20.328, 57.379, 'R', 'F', 'Mai–Okt'],
  ['Skeleton Bay', 'NAM', 'Walvis Bay', -22.94, 14.45, 'P', 'P', 'Mär–Sep'],
  ['Tofinho', 'MOZ', 'Tofo', -23.853, 35.555, 'P', 'L', 'Mai–Sep'],
  ['Busua Beach', 'GHA', 'Westküste', 4.799, -1.94, 'B', 'A', 'Apr–Sep'],
  ['Robertsport', 'LBR', 'Cape Mount', 6.75, -11.367, 'P', 'L', 'Mai–Okt'],

  // ---------- ASIEN ----------
  ['Uluwatu', 'IDN', 'Bali', -8.8149, 115.0884, 'R', 'F', 'Apr–Okt'],
  ['Padang Padang', 'IDN', 'Bali', -8.811, 115.1, 'R', 'P', 'Apr–Okt'],
  ['Canggu (Batu Bolong)', 'IDN', 'Bali', -8.65, 115.13, 'B', 'A', 'Ganzjährig'],
  ['Kuta Beach', 'IDN', 'Bali', -8.718, 115.168, 'B', 'A', 'Apr–Okt'],
  ['Keramas', 'IDN', 'Bali', -8.59, 115.344, 'R', 'F', 'Mai–Sep'],
  ['Medewi', 'IDN', 'Bali', -8.398, 114.823, 'P', 'L', 'Apr–Okt'],
  ['Desert Point', 'IDN', 'Lombok', -8.77, 115.83, 'R', 'P', 'Mai–Sep'],
  ['G-Land (Plengkung)', 'IDN', 'Java', -8.748, 114.351, 'R', 'P', 'Apr–Okt'],
  ['Macaronis', 'IDN', 'Mentawai', -2.083, 99.65, 'R', 'F', 'Apr–Okt'],
  ['Lagundri Bay', 'IDN', 'Nias', 0.57, 97.78, 'P', 'F', 'Mai–Okt'],
  ['Cloud 9', 'PHL', 'Siargao', 9.811, 126.159, 'R', 'F', 'Sep–Nov'],
  ['Sabang Beach', 'PHL', 'Baler', 15.758, 121.57, 'B', 'A', 'Okt–Feb'],
  ['San Juan', 'PHL', 'La Union', 16.676, 120.331, 'B', 'A', 'Jul–Okt'],
  ['Puraran', 'PHL', 'Catanduanes', 13.685, 124.405, 'R', 'P', 'Sep–Nov'],
  ['Arugam Bay', 'LKA', 'Ostküste', 6.84, 81.835, 'P', 'L', 'Apr–Okt'],
  ['Hikkaduwa', 'LKA', 'Südwestküste', 6.14, 80.099, 'R', 'L', 'Nov–Apr'],
  ['Weligama', 'LKA', 'Südküste', 5.971, 80.429, 'B', 'A', 'Nov–Apr'],
  ['Midigama', 'LKA', 'Südküste', 5.966, 80.38, 'R', 'F', 'Nov–Apr'],
  ['Pasta Point', 'MDV', 'Nord-Malé-Atoll', 4.305, 73.62, 'R', 'F', 'Mär–Okt'],
  ['Shonan', 'JPN', 'Kanagawa', 35.316, 139.48, 'B', 'L', 'Sep–Nov'],
  ['Tsurigasaki', 'JPN', 'Chiba', 35.382, 140.433, 'B', 'F', 'Sep–Nov'],
  ['Kisakihama', 'JPN', 'Miyazaki', 31.865, 131.49, 'B', 'L', 'Sep–Nov'],
  ['Kata Beach', 'THA', 'Phuket', 7.821, 98.297, 'B', 'A', 'Mai–Okt'],
  ['My Khe', 'VNM', 'Da Nang', 16.056, 108.248, 'B', 'A', 'Sep–Dez'],
  ['Mulki', 'IND', 'Karnataka', 13.09, 74.79, 'B', 'L', 'Jun–Sep'],
  ['Varkala', 'IND', 'Kerala', 8.734, 76.7, 'B', 'A', 'Mär–Mai'],

  // ---------- AMERIKA ----------
  ['Pipeline', 'USA', 'Hawaii (Oahu)', 21.665, -158.051, 'R', 'P', 'Nov–Feb'],
  ['Waimea Bay', 'USA', 'Hawaii (Oahu)', 21.641, -158.066, 'G', 'P', 'Nov–Feb'],
  ['Sunset Beach', 'USA', 'Hawaii (Oahu)', 21.678, -158.04, 'B', 'P', 'Nov–Feb'],
  ['Waikiki (Queens)', 'USA', 'Hawaii (Oahu)', 21.265, -157.83, 'R', 'A', 'Apr–Sep'],
  ['Hanalei Bay', 'USA', 'Hawaii (Kauai)', 22.208, -159.5, 'P', 'F', 'Nov–Mär'],
  ['Honolua Bay', 'USA', 'Hawaii (Maui)', 21.014, -156.64, 'P', 'P', 'Nov–Mär'],
  ['Mavericks', 'USA', 'Kalifornien', 37.495, -122.496, 'G', 'P', 'Nov–Mär'],
  ['Steamer Lane', 'USA', 'Santa Cruz', 36.951, -122.026, 'P', 'F', 'Okt–Mär'],
  ['Ocean Beach', 'USA', 'San Francisco', 37.76, -122.513, 'B', 'F', 'Sep–Mär'],
  ['Malibu (Surfrider)', 'USA', 'Kalifornien', 34.036, -118.678, 'P', 'L', 'Mär–Sep'],
  ['Huntington Beach', 'USA', 'Kalifornien', 33.656, -118.0, 'B', 'L', 'Ganzjährig'],
  ['Trestles', 'USA', 'San Clemente', 33.383, -117.592, 'R', 'F', 'Mai–Okt'],
  ['Cocoa Beach', 'USA', 'Florida', 28.368, -80.6, 'B', 'A', 'Aug–Nov'],
  ['Sebastian Inlet', 'USA', 'Florida', 27.86, -80.45, 'B', 'F', 'Aug–Nov'],
  ['Montauk', 'USA', 'New York', 41.04, -71.95, 'B', 'L', 'Aug–Nov'],
  ['Rincón (Domes)', 'PRI', 'Westküste', 18.36, -67.273, 'B', 'F', 'Nov–Mär'],
  ['Tres Palmas', 'PRI', 'Rincón', 18.338, -67.269, 'R', 'P', 'Nov–Mär'],
  ['Cox Bay', 'CAN', 'Tofino', 49.105, -125.89, 'B', 'L', 'Sep–Mär'],
  ['Lawrencetown Beach', 'CAN', 'Nova Scotia', 44.642, -63.347, 'B', 'L', 'Sep–Nov'],
  ['Zicatela', 'MEX', 'Puerto Escondido', 15.858, -97.064, 'B', 'P', 'Mai–Sep'],
  ['Sayulita', 'MEX', 'Nayarit', 20.869, -105.441, 'B', 'A', 'Mai–Okt'],
  ['Scorpion Bay', 'MEX', 'Baja California Sur', 26.24, -112.46, 'P', 'L', 'Mai–Okt'],
  ['Todos Santos', 'MEX', 'Baja California Sur', 23.445, -110.23, 'P', 'F', 'Mai–Okt'],
  ['Pavones', 'CRI', 'Puntarenas', 8.383, -83.135, 'P', 'F', 'Apr–Okt'],
  ['Playa Hermosa', 'CRI', 'Jacó', 9.556, -84.585, 'B', 'P', 'Mai–Nov'],
  ['Tamarindo', 'CRI', 'Guanacaste', 10.299, -85.841, 'B', 'A', 'Mai–Nov'],
  ['Santa Teresa', 'CRI', 'Nicoya', 9.642, -85.168, 'B', 'L', 'Mai–Nov'],
  ['Witch\'s Rock', 'CRI', 'Playa Naranjo', 10.804, -85.813, 'B', 'F', 'Dez–Apr'],
  ['Salsa Brava', 'CRI', 'Puerto Viejo', 9.654, -82.753, 'R', 'P', 'Dez–Mär'],
  ['Bluff Beach', 'PAN', 'Bocas del Toro', 9.418, -82.19, 'B', 'F', 'Dez–Mär'],
  ['Playa Venao', 'PAN', 'Azuero', 7.435, -80.163, 'B', 'L', 'Mai–Nov'],
  ['Santa Catalina', 'PAN', 'Veraguas', 7.631, -81.248, 'P', 'F', 'Dez–Apr'],
  ['Popoyo', 'NIC', 'Tola', 11.464, -86.095, 'R', 'F', 'Mär–Okt'],
  ['Playa Maderas', 'NIC', 'San Juan del Sur', 11.317, -85.904, 'B', 'L', 'Mär–Nov'],
  ['El Sunzal', 'SLV', 'La Libertad', 13.498, -89.415, 'P', 'L', 'Mär–Okt'],
  ['Punta Roca', 'SLV', 'La Libertad', 13.486, -89.324, 'P', 'P', 'Mär–Okt'],
  ['Playa Encuentro', 'DOM', 'Cabarete', 19.786, -70.382, 'B', 'F', 'Dez–Mär'],
  ['Soup Bowl', 'BRB', 'Bathsheba', 13.212, -59.52, 'R', 'P', 'Okt–Mär'],
  ['Chicama', 'PER', 'Puerto Malabrigo', -7.7, -79.445, 'P', 'L', 'Mär–Sep'],
  ['Máncora', 'PER', 'Piura', -4.102, -81.046, 'P', 'L', 'Dez–Apr'],
  ['Cabo Blanco', 'PER', 'Piura', -4.23, -81.23, 'P', 'P', 'Nov–Mär'],
  ['Punta Hermosa', 'PER', 'Lima', -12.335, -76.825, 'P', 'L', 'Mär–Dez'],
  ['Montañita', 'ECU', 'Santa Elena', -1.829, -80.752, 'P', 'L', 'Dez–Apr'],
  ['Punta de Lobos', 'CHL', 'Pichilemu', -34.426, -72.042, 'P', 'F', 'Mär–Sep'],
  ['El Gringo', 'CHL', 'Arica', -18.494, -70.322, 'R', 'P', 'Mär–Sep'],
  ['Itaúna', 'BRA', 'Saquarema', -22.938, -42.48, 'B', 'P', 'Mär–Sep'],
  ['Joaquina', 'BRA', 'Florianópolis', -27.629, -48.449, 'B', 'L', 'Mär–Sep'],
  ['Garopaba', 'BRA', 'Santa Catarina', -28.03, -48.618, 'B', 'L', 'Mär–Sep'],
  ['Maresias', 'BRA', 'São Paulo', -23.794, -45.566, 'B', 'F', 'Mär–Sep'],
  ['Cacimba do Padre', 'BRA', 'Fernando de Noronha', -3.857, -32.433, 'B', 'F', 'Dez–Mär'],
  ['Playa Grande', 'ARG', 'Mar del Plata', -38.027, -57.53, 'B', 'L', 'Mär–Okt'],
  ['Punta del Diablo', 'URY', 'Rocha', -34.037, -53.543, 'B', 'L', 'Mär–Okt'],

  // ---------- OZEANIEN ----------
  ['Snapper Rocks', 'AUS', 'Gold Coast', -28.165, 153.55, 'P', 'F', 'Feb–Aug'],
  ['Kirra', 'AUS', 'Gold Coast', -28.168, 153.517, 'P', 'P', 'Feb–Aug'],
  ['Burleigh Heads', 'AUS', 'Gold Coast', -28.1, 153.45, 'P', 'F', 'Feb–Aug'],
  ['The Pass', 'AUS', 'Byron Bay', -28.641, 153.632, 'P', 'L', 'Feb–Aug'],
  ['Noosa Main Beach', 'AUS', 'Queensland', -26.383, 153.095, 'P', 'A', 'Dez–Mär'],
  ['Bondi Beach', 'AUS', 'Sydney', -33.892, 151.274, 'B', 'A', 'Ganzjährig'],
  ['Manly Beach', 'AUS', 'Sydney', -33.797, 151.288, 'B', 'A', 'Ganzjährig'],
  ['Bells Beach', 'AUS', 'Victoria', -38.37, 144.281, 'P', 'F', 'Mär–Okt'],
  ['Woolamai', 'AUS', 'Phillip Island', -38.532, 145.355, 'B', 'L', 'Mär–Okt'],
  ['Margaret River Mouth', 'AUS', 'Westaustralien', -33.973, 114.986, 'R', 'P', 'Mär–Okt'],
  ['Yallingup', 'AUS', 'Westaustralien', -33.64, 114.99, 'B', 'L', 'Mär–Okt'],
  ['Shipstern Bluff', 'AUS', 'Tasmanien', -43.206, 147.834, 'G', 'P', 'Mär–Okt'],
  ['Manu Bay', 'NZL', 'Raglan', -37.812, 174.813, 'P', 'F', 'Mär–Okt'],
  ['Piha', 'NZL', 'Auckland', -36.954, 174.47, 'B', 'F', 'Ganzjährig'],
  ['Mount Maunganui', 'NZL', 'Bay of Plenty', -37.633, 176.184, 'B', 'A', 'Dez–Mär'],
  ['Wainui Beach', 'NZL', 'Gisborne', -38.69, 178.07, 'B', 'L', 'Ganzjährig'],
  ['St Clair', 'NZL', 'Dunedin', -45.915, 170.485, 'B', 'L', 'Ganzjährig'],
  ['Cloudbreak', 'FJI', 'Tavarua', -17.862, 177.19, 'R', 'P', 'Mär–Okt'],
  ['Restaurants', 'FJI', 'Tavarua', -17.87, 177.185, 'R', 'F', 'Mär–Okt']
];

const SPOTS: Spot[] = RAW.map((r, i) => ({
  id: `s${i}`,
  name: r[0],
  iso: r[1],
  region: r[2],
  lat: r[3],
  lng: r[4],
  wave: WAVES[r[5]],
  level: LEVELS[r[6]],
  season: r[7],
  continent: COUNTRIES[r[1]].continent,
  lv: r[6],
  suitable: SUITABLE[r[6]]
}));

type ByCountry = Record<string, Spot[]>;

const groupByCountry = (list: Spot[]): ByCountry => {
  const out: ByCountry = {};
  list.forEach(s => {
    if (!out[s.iso]) out[s.iso] = [];
    out[s.iso].push(s);
  });
  return out;
};

const countriesOf = (by: ByCountry, cont: string) =>
  Object.keys(by)
    .filter(iso => COUNTRIES[iso].continent === cont)
    .sort((a, b) => by[b].length - by[a].length);

const spotCountOf = (list: Spot[], cont: string) => list.filter(s => s.continent === cont).length;

/* Fotos zu einem Spot von Wikimedia Commons (frei nutzbar, nach Koordinaten gesucht) */
const IMG_CACHE: Record<string, string[]> = {};

async function fetchSpotImages(s: Spot): Promise<string[]> {
  if (IMG_CACHE[s.id]) return IMG_CACHE[s.id];
  const base = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|mime&iiurlwidth=520&';
  const pick = (d: any): string[] =>
    Object.values(d?.query?.pages || {})
      .sort((a: any, b: any) => (a.index || 0) - (b.index || 0))
      .map((p: any) => p.imageinfo?.[0])
      .filter((i: any) => i && i.mime === 'image/jpeg' && i.thumburl)
      .map((i: any) => i.thumburl as string);

  let urls: string[] = [];
  try {
    const r1 = await fetch(base + `generator=geosearch&ggsnamespace=6&ggslimit=12&ggsradius=3000&ggscoord=${s.lat}|${s.lng}`);
    urls = pick(await r1.json());
  } catch (e) { /* weiter mit Textsuche */ }
  if (urls.length < 3) {
    try {
      const r2 = await fetch(base + `generator=search&gsrnamespace=6&gsrlimit=10&gsrsearch=${encodeURIComponent(s.name + ' ' + s.region + ' surf')}`);
      urls = urls.concat(pick(await r2.json()));
    } catch (e) { /* keine Bilder */ }
  }
  const result = Array.from(new Set(urls)).slice(0, 3);
  IMG_CACHE[s.id] = result;
  return result;
}

const CAMPS_LISTINGS: CampListing[] = [
  { id: 'c1', title: 'Solid Surf House Taghazout', location: 'Taghazout, Marokko', country: 'Marokko', price: 'ab 449 € / Woche', rating: 4.9, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600', type: 'Camp' },
  { id: 'c2', title: 'Bali Surf & Yoga Villa', location: 'Canggu, Bali', country: 'Indonesien', price: 'ab 599 € / Woche', rating: 4.9, image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600', type: 'Camp' },
  { id: 'c3', title: 'Ericeira Surf Lodge', location: 'Ericeira, Portugal', country: 'Portugal', price: 'ab 499 € / Woche', rating: 4.8, image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae30?w=600', type: 'Camp' },
  { id: 'c4', title: 'High-Performance Shortboard Rental', location: 'Taghazout & Imsouane', country: 'Marokko', price: '15 € / Tag', rating: 4.9, image: 'https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=600', type: 'Rental' },
  { id: 'c5', title: 'Pro Surf Equipment & Softtop Rental', location: 'Canggu, Bali', country: 'Indonesien', price: '12 € / Tag', rating: 4.7, image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600', type: 'Rental' }
];

/* ------------------------------------------------------------------ */
/*  APP                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'spots' | 'camps' | 'rentals' | 'chat' | 'events'>('home');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('Alle');
  const [viewNonce, setViewNonce] = useState(0);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', user: 'Julian', text: 'Hey Leute, wie sind die Bedingungen am Anchor Point heute?', time: '10:12' },
    { id: '2', user: 'Sarah', text: 'Mega Wellen heute morgen in Imsouane!', time: '10:45' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const [geo, setGeo] = useState<any>(null);
  const [geoError, setGeoError] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  const visibleSpots = useMemo(
    () => SPOTS.filter(s => levelFilter === 'Alle' || s.suitable.includes(levelFilter)),
    [levelFilter]
  );
  const byCountry = useMemo(() => groupByCountry(visibleSpots), [visibleSpots]);

  const changeLevel = (l: LevelFilter) => {
    setLevelFilter(l);
    const sel = SPOTS.find(sp => sp.id === selectedSpotId);
    if (sel && l !== 'Alle' && !sel.suitable.includes(l)) setSelectedSpotId(null);
  };

  const selectContinent = (cont: string | null) => {
    setSelectedContinent(cont);
    setSelectedCountry(null);
    setSelectedSpotId(null);
  };

  const selectCountry = (iso: string) => {
    setSelectedCountry(iso);
    setSelectedSpotId(null);
  };

  const pickSpot = (s: Spot) => {
    setSelectedContinent(s.continent);
    setSelectedCountry(s.iso);
    setSelectedSpotId(s.id);
    setSearchQuery('');
  };

  // Ländergrenzen einmalig laden
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const url of GEO_URLS) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          if (!cancelled) setGeo(data);
          return;
        } catch (e) {
          // nächste Quelle probieren
        }
      }
      if (!cancelled) setGeoError(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const geoFeatures = useMemo(() => {
    if (!geo || !geo.features) return [] as { f: any; iso: string; cont: string | undefined }[];
    return geo.features.map((f: any) => {
      const iso = NAME_FIX[f.properties?.name] ?? f.id;
      return { f, iso, cont: ISO_TO_CONT[iso] };
    }).filter((x: any) => x.cont);
  }, [geo]);

  // 1) Karte erzeugen, wenn der Reiter "Surfspots" geöffnet wird
  useEffect(() => {
    if (activeTab !== 'spots') return;
    const L = (window as any).L;
    if (!L) return;

    const map = L.map('leaflet-map', { zoomControl: true, minZoom: 2 }).fitBounds(WORLD_BOUNDS);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      className: 'dark-tiles',
      maxZoom: 18
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setMapReady(true);

    const timer = setTimeout(() => map.invalidateSize(), 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      markersRef.current = {};
      setMapReady(false);
    };
  }, [activeTab]);

  // 2) Karteninhalt zeichnen: Kontinente -> Länder -> Spots
  useEffect(() => {
    const L = (window as any).L;
    const map = mapRef.current;
    const group = layerRef.current;
    if (!mapReady || !map || !group || !L) return;

    group.clearLayers();
    markersRef.current = {};

    // --- Ebene 1: Weltkarte mit 5 farbigen Kontinenten ---
    if (!selectedContinent) {
      CONTINENTS.forEach(cont => {
        const fs = geoFeatures.filter((x: any) => x.cont === cont).map((x: any) => x.f);
        if (!fs.length) return;
        const base = { color: '#0f172a', weight: 0.6, fillColor: CONT_COLORS[cont], fillOpacity: 0.55 };
        const layer = L.geoJSON({ type: 'FeatureCollection', features: fs }, { style: () => base });
        layer.on('mouseover', () => layer.setStyle({ fillOpacity: 0.85 }));
        layer.on('mouseout', () => layer.setStyle(base));
        layer.on('click', () => selectContinent(cont));
        layer.bindTooltip(`${cont} · ${spotCountOf(visibleSpots, cont)} Spots`, { sticky: true });
        group.addLayer(layer);
      });
      map.flyToBounds(WORLD_BOUNDS, { duration: 1.2 });
      return;
    }

    // --- Ebene 2 + 3: Kontinent bzw. Land ---
    const color = CONT_COLORS[selectedContinent];

    const others = geoFeatures.filter((x: any) => x.cont !== selectedContinent).map((x: any) => x.f);
    if (others.length) {
      group.addLayer(L.geoJSON({ type: 'FeatureCollection', features: others }, {
        interactive: false,
        style: () => ({ color: '#1e293b', weight: 0.5, fillColor: '#334155', fillOpacity: 0.25 })
      }));
    }

    geoFeatures.filter((x: any) => x.cont === selectedContinent).forEach((x: any) => {
      const list = byCountry[x.iso];
      const has = !!list;
      const isSel = x.iso === selectedCountry;
      const base = {
        color: isSel ? '#22d3ee' : '#0f172a',
        weight: isSel ? 2.5 : 0.8,
        fillColor: has ? color : '#64748b',
        fillOpacity: selectedCountry ? (isSel ? 0.6 : 0.18) : has ? 0.5 : 0.15
      };
      const layer = L.geoJSON(x.f, { style: () => base });
      const label = COUNTRIES[x.iso]?.name ?? x.f.properties?.name;
      layer.bindTooltip(has ? `${label} · ${list.length} Spots` : `${label} · keine passenden Spots`, { sticky: true });
      if (has) {
        layer.on('mouseover', () => layer.setStyle({ fillOpacity: 0.8 }));
        layer.on('mouseout', () => layer.setStyle(base));
        layer.on('click', () => selectCountry(x.iso));
      }
      group.addLayer(layer);
    });

    // Ebene 2: Zähler pro Land (auch für kleine Inselstaaten klickbar)
    if (!selectedCountry) {
      countriesOf(byCountry, selectedContinent).forEach(iso => {
        const list = byCountry[iso];
        const lat = list.reduce((a, s) => a + s.lat, 0) / list.length;
        const lng = list.reduce((a, s) => a + s.lng, 0) / list.length;
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:26px;height:26px;border-radius:50%;background:#0f172a;border:2px solid ${color};color:#fff;font:700 11px sans-serif;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px rgba(0,0,0,.25)">${list.length}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });
        const m = L.marker([lat, lng], { icon }).addTo(group);
        m.bindTooltip(`${COUNTRIES[iso].name} · ${list.length} Spots`);
        m.on('click', () => selectCountry(iso));
      });
      map.flyToBounds(CONT_BOUNDS[selectedContinent], { duration: 1.2 });
      return;
    }

    // Ebene 3: alle Surfspots des gewählten Landes
    const list = byCountry[selectedCountry] || [];
    list.forEach(s => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:18px;height:18px;border-radius:50%;background:#22d3ee;border:3px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.6)"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });
      const m = L.marker([s.lat, s.lng], { icon }).addTo(group);
      m.bindTooltip(s.name);
      m.on('click', () => setSelectedSpotId(s.id));
      markersRef.current[s.id] = m;
    });
    if (list.length) {
      map.flyToBounds(L.latLngBounds(list.map(s => [s.lat, s.lng])), { padding: [60, 60], maxZoom: 8, duration: 1.2 });
    }
  }, [mapReady, geoFeatures, selectedContinent, selectedCountry, byCountry, visibleSpots, viewNonce]);

  // 3) Auf einen einzelnen Spot zoomen und Infofenster öffnen
  useEffect(() => {
    if (!selectedSpotId) return;
    const marker = markersRef.current[selectedSpotId];
    const map = mapRef.current;
    if (!marker || !map) return;
    map.flyTo(marker.getLatLng(), 11, { duration: 1.2 });
  }, [selectedSpotId]);

  const searchResults = searchQuery.trim()
    ? visibleSpots.filter(s => {
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) ||
          s.region.toLowerCase().includes(q) ||
          COUNTRIES[s.iso].name.toLowerCase().includes(q);
      })
    : [];

  const countrySpots = selectedCountry ? byCountry[selectedCountry] || [] : [];
  const selectedSpot = SPOTS.find(sp => sp.id === selectedSpotId) || null;
  const leafletMissing = typeof window !== 'undefined' && !(window as any).L;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <style>{`.dark-tiles { filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9) saturate(0.5); }`}</style>
      {/* Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-cyan-500 p-2 rounded-xl text-slate-950">
            <Waves className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            GlobeSurf Hub
          </span>
        </div>

        <nav className="hidden lg:flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'home', label: 'Startseite' },
            { id: 'spots', label: 'Surfspots' },
            { id: 'camps', label: 'Surfcamps & Hostels' },
            { id: 'rentals', label: 'Rentals' },
            { id: 'chat', label: 'Community Chat' },
            { id: 'events', label: 'Events' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div>
          {user ? (
            <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-sm">
              <User className="w-4 h-4 text-cyan-400" />
              <span>{user.name}</span>
              <button onClick={() => setUser(null)} className="text-slate-400 hover:text-red-400 ml-2"><LogOut className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl text-sm font-semibold transition">
              <LogIn className="w-4 h-4" />
              <span>Einloggen</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 flex flex-col">

        {/* TAB 0: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-12 pb-12">
            <div className="relative h-[550px] w-full flex items-center justify-center text-center px-4">
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1600"
                  alt="Surf Hero"
                  className="w-full h-full object-cover filter brightness-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              </div>
              <div className="relative z-10 max-w-3xl space-y-6">
                <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Dein weltweites Surf-Netzwerk
                </span>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Entdecke die besten Surfspots & Surfcamps weltweit
                </h1>
                <p className="text-slate-300 text-base md:text-lg">
                  Interaktive Weltkarte, Live-Chat mit der Community und die legendärsten Surfspots der Erde.
                </p>
                <div className="flex justify-center gap-4 pt-4">
                  <button
                    onClick={() => setActiveTab('spots')}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-3.5 rounded-2xl text-base transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                  >
                    <span>Weltkarte öffnen</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: INTERAKTIVE WELTKARTE */}
        {activeTab === 'spots' && (
          <div className="max-w-7xl w-full mx-auto p-6 space-y-6 flex-1">

            {/* Breadcrumbs & Suche */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-2 text-sm font-semibold flex-wrap gap-y-2">
                  <button
                    onClick={() => selectContinent(null)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${!selectedContinent ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                  >
                    <Globe className="w-4 h-4" /> Weltweit
                  </button>

                  {selectedContinent && (
                    <>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                      <button
                        onClick={() => selectContinent(selectedContinent)}
                        className={`px-3 py-1.5 rounded-xl transition ${!selectedCountry ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                      >
                        {selectedContinent}
                      </button>
                    </>
                  )}

                  {selectedCountry && (
                    <>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                      <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-xl">
                        {COUNTRIES[selectedCountry].name}
                      </span>
                    </>
                  )}
                </div>

                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Spot oder Land suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Hinweis / Zurück */}
              <div className="pt-2 border-t border-slate-900 flex flex-wrap gap-2 items-center">
                {!selectedContinent ? (
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" /> Klicke auf einen Kontinent, um hineinzuzoomen.
                  </span>
                ) : !selectedCountry ? (
                  <>
                    <button onClick={() => selectContinent(null)} className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 mr-3">
                      <ArrowLeft className="w-3.5 h-3.5" /> Zurück zur Weltkarte
                    </button>
                    <span className="text-xs text-slate-500">Klicke auf ein farbiges Land, um die Surfspots zu sehen.</span>
                  </>
                ) : (
                  <>
                    <button onClick={() => selectContinent(selectedContinent)} className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 mr-3">
                      <ArrowLeft className="w-3.5 h-3.5" /> Zurück zu {selectedContinent}
                    </button>
                    <span className="text-xs text-slate-500">Klicke auf einen Spot für Details.</span>
                  </>
                )}

                <div className="ml-auto flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-slate-500 mr-1">Surfer-Level:</span>
                  {LEVEL_FILTERS.map(l => (
                    <button
                      key={l}
                      onClick={() => changeLevel(l)}
                      className={`px-3 py-1 rounded-xl text-xs font-medium transition ${levelFilter === l ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Karte & Liste */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden h-[540px] lg:col-span-2 shadow-xl relative z-0">
                {leafletMissing ? (
                  <div className="p-6 text-sm text-amber-400">
                    Die Karte konnte nicht geladen werden: Das Leaflet-Skript fehlt in der index.html.
                  </div>
                ) : (
                  <div id="leaflet-map" className="w-full h-full min-h-[540px] bg-slate-950"></div>
                )}
                {geoError && (
                  <div className="absolute bottom-3 left-3 right-3 z-[500] bg-slate-950/90 border border-amber-500/30 text-amber-400 text-xs p-3 rounded-xl">
                    Die Ländergrenzen konnten nicht geladen werden. Bitte Seite neu laden oder Internetverbindung prüfen.
                  </div>
                )}
              </div>

              {/* Seitenliste */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-sm font-bold flex items-center space-x-2 text-slate-300">
                  <MapPin className="text-cyan-400 w-4 h-4" />
                  <span>
                    {selectedSpot && !searchQuery.trim()
                      ? 'Spot-Details'
                      : searchQuery.trim()
                      ? `Suchergebnisse (${searchResults.length})`
                      : !selectedContinent
                        ? `Kontinente (${CONTINENTS.length})`
                        : !selectedCountry
                          ? `Länder in ${selectedContinent} (${countriesOf(byCountry, selectedContinent).length})`
                          : `Spots in ${COUNTRIES[selectedCountry].name} (${countrySpots.length})`}
                  </span>
                </h2>

                <div className="space-y-3 max-h-[540px] overflow-y-auto pr-2">

                  {/* Suche */}
                  {searchQuery.trim() && searchResults.map(s => (
                    <SpotCard key={s.id} spot={s} onClick={() => pickSpot(s)} showCountry />
                  ))}
                  {searchQuery.trim() && searchResults.length === 0 && (
                    <p className="text-xs text-slate-500">Keine Spots gefunden.</p>
                  )}

                  {/* Ebene 1: Kontinente */}
                  {!searchQuery.trim() && !selectedSpot && !selectedContinent && CONTINENTS.map(cont => (
                    <div
                      key={cont}
                      onClick={() => selectContinent(cont)}
                      className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-cyan-500 cursor-pointer transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ background: CONT_COLORS[cont] }}></span>
                        <div>
                          <h3 className="font-bold text-white">{cont}</h3>
                          <p className="text-xs text-slate-400">{countriesOf(byCountry, cont).length} Länder · {spotCountOf(visibleSpots, cont)} Spots</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}

                  {/* Ebene 2: Länder */}
                  {!searchQuery.trim() && !selectedSpot && selectedContinent && !selectedCountry && countriesOf(byCountry, selectedContinent).map(iso => (
                    <div
                      key={iso}
                      onClick={() => selectCountry(iso)}
                      className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-cyan-500 cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-bold text-white">{COUNTRIES[iso].name}</h3>
                        <p className="text-xs text-slate-400">{byCountry[iso].length} Surfspots</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}

                  {/* Ebene 3: Spots */}
                  {!searchQuery.trim() && !selectedSpot && selectedCountry && countrySpots.map(s => (
                    <SpotCard key={s.id} spot={s} onClick={() => setSelectedSpotId(s.id)} />
                  ))}
                  {!searchQuery.trim() && !selectedSpot && selectedCountry && countrySpots.length === 0 && (
                    <p className="text-xs text-slate-500">Keine Spots für dieses Level in diesem Land.</p>
                  )}

                  {/* Spot-Details mit Fotos */}
                  {!searchQuery.trim() && selectedSpot && (
                    <SpotDetail
                      key={selectedSpot.id}
                      spot={selectedSpot}
                      onBack={() => { setSelectedSpotId(null); setViewNonce(n => n + 1); }}
                    />
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: CAMPS */}
        {activeTab === 'camps' && (
          <div className="max-w-7xl w-full mx-auto p-6 space-y-6 flex-1">
            <h2 className="text-xl font-bold">Surfcamps & Hostels</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CAMPS_LISTINGS.filter(l => l.type === 'Camp').map(camp => (
                <div key={camp.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition flex flex-col">
                  <img src={camp.image} alt={camp.title} className="w-full h-48 object-cover" />
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full font-medium">{camp.country}</span>
                      <h3 className="font-bold text-lg mt-2">{camp.title}</h3>
                      <p className="text-xs text-slate-400">{camp.location}</p>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-900">
                      <span className="font-bold text-cyan-400 text-sm">{camp.price}</span>
                      <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition">Anfragen</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RENTALS */}
        {activeTab === 'rentals' && (
          <div className="max-w-7xl w-full mx-auto p-6 space-y-6 flex-1">
            <h2 className="text-xl font-bold">Rentals & Equipment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CAMPS_LISTINGS.filter(l => l.type === 'Rental').map(rental => (
                <div key={rental.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden p-5 flex gap-4 items-center">
                  <img src={rental.image} alt={rental.title} className="w-28 h-28 object-cover rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <span className="text-xs bg-slate-900 text-cyan-400 px-2 py-0.5 rounded border border-slate-800">Verleih</span>
                    <h3 className="font-bold text-md">{rental.title}</h3>
                    <p className="text-xs text-slate-400">{rental.location}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-cyan-400">{rental.price}</span>
                      <button className="bg-cyan-500 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl">Buchen</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CHAT */}
        {activeTab === 'chat' && (
          <div className="max-w-3xl w-full mx-auto p-6 flex-1 flex flex-col">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[550px] shadow-xl">
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-sm">Community Live-Chat</h2>
                  <p className="text-xs text-slate-400">Tausche dich mit Surfern weltweit aus</p>
                </div>
                {!user && (
                  <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Login zum Schreiben nötig
                  </span>
                )}
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map(m => (
                  <div key={m.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl max-w-lg">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-cyan-400">{m.user}</span>
                      <span className="text-slate-500">{m.time}</span>
                    </div>
                    <p className="text-sm text-slate-200">{m.text}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder={user ? "Nachricht schreiben..." : "Bitte zuerst einloggen..."}
                  disabled={!user}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
                <button
                  onClick={() => { if (newMessage && user) { setMessages([...messages, { id: Date.now().toString(), user: user.name, text: newMessage, time: 'Gerade eben' }]); setNewMessage(''); } }}
                  disabled={!user}
                  className="bg-cyan-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs disabled:opacity-50 transition"
                >
                  Senden
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EVENTS */}
        {activeTab === 'events' && (
          <div className="max-w-7xl w-full mx-auto p-6 space-y-6 flex-1">
            <h2 className="text-xl font-bold">Events & Community Meetups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                <span className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full font-semibold">Social Event</span>
                <h3 className="font-bold text-lg">Sunset BBQ & Beach Session</h3>
                <p className="text-xs text-slate-300">Gemeinsames Grillen auf der Dachterrasse mit anschließender Flutlicht- oder Sundown-Session.</p>
                <div className="text-xs text-slate-400 pt-2 border-t border-slate-900 flex justify-between">
                  <span>Ort: Taghazout, Marokko</span>
                  <span className="text-cyan-400 font-bold">Morgen, 18:00 Uhr</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center"><h3 className="font-bold text-lg">Einloggen</h3><button onClick={() => setShowAuthModal(false)}><X className="w-5 h-5 text-slate-500" /></button></div>
            <button onClick={() => { setUser({ name: 'SurfNomad_99' }); setShowAuthModal(false); }} className="w-full bg-cyan-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition hover:bg-cyan-400">Als Demo-User starten</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Karte für einen einzelnen Surfspot in der Seitenliste */
function SpotCard({ spot, onClick, showCountry }: { spot: Spot; onClick: () => void; showCountry?: boolean }) {
  return (
    <div
      onClick={onClick}
      className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-cyan-500 cursor-pointer transition"
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          {showCountry ? `${COUNTRIES[spot.iso].name} • ` : ''}{spot.level}
        </span>
      </div>
      <h3 className="text-md font-bold mt-1 text-white">{spot.name}</h3>
      <p className="text-xs text-slate-400 mb-2">{spot.region}</p>
      <div className="grid grid-cols-2 gap-1 bg-slate-900 p-2 rounded-xl text-[10px] text-slate-300 text-center border border-slate-800/60">
        <div><span className="text-slate-500 block text-[8px]">Wellentyp</span>{spot.wave}</div>
        <div><span className="text-slate-500 block text-[8px]">Beste Zeit</span>{spot.season}</div>
      </div>
    </div>
  );
}


/* Detailansicht eines Spots: Fotos, Level und Infos */
function SpotDetail({ spot, onBack }: { spot: Spot; onBack: () => void }) {
  const [images, setImages] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSpotImages(spot).then(urls => { if (!cancelled) setImages(urls); });
    return () => { cancelled = true; };
  }, [spot]);

  return (
    <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl overflow-hidden">
      {/* Fotos */}
      {images === null ? (
        <div className="h-40 bg-slate-900 animate-pulse" />
      ) : images.length > 0 ? (
        <div className="grid grid-cols-2 gap-0.5 bg-slate-900">
          {images.map((url, i) => (
            <img
              key={url}
              src={url}
              alt={`${spot.name} ${i + 1}`}
              loading="lazy"
              className={`w-full object-cover ${i === 0 ? 'col-span-2 h-40' : 'h-24'}`}
            />
          ))}
        </div>
      ) : (
        <div className="h-24 bg-slate-900 flex items-center justify-center text-xs text-slate-500">
          Keine Fotos für diesen Spot gefunden
        </div>
      )}

      <div className="p-4 space-y-4">
        <button onClick={onBack} className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Zurück zur Liste
        </button>

        <div>
          <h3 className="text-lg font-bold text-white">{spot.name}</h3>
          <p className="text-xs text-slate-400">{spot.region}, {COUNTRIES[spot.iso].name}</p>
        </div>

        <div>
          <p className="text-[11px] text-slate-500 mb-1.5">Geeignet für</p>
          <div className="flex gap-1.5 flex-wrap">
            {ALL_LEVELS.map(l => {
              const ok = spot.suitable.includes(l);
              return (
                <span
                  key={l}
                  className={`text-xs px-3 py-1 rounded-full border font-medium ${ok ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40' : 'bg-slate-900 text-slate-600 border-slate-800 line-through'}`}
                >
                  {l}
                </span>
              );
            })}
          </div>
          <p className="text-xs text-slate-300 mt-2">{LEVEL_INFO[spot.lv]}</p>
        </div>

        <div className="grid grid-cols-2 gap-1 bg-slate-900 p-2 rounded-xl text-[11px] text-slate-300 text-center border border-slate-800/60">
          <div><span className="text-slate-500 block text-[9px]">Wellentyp</span>{spot.wave}</div>
          <div><span className="text-slate-500 block text-[9px]">Beste Zeit</span>{spot.season}</div>
        </div>

        <p className="text-xs text-slate-300">{WAVE_INFO[spot.wave]}</p>

        <a
          href={`https://www.google.com/maps?q=${spot.lat},${spot.lng}`}
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition"
        >
          In Google Maps öffnen
        </a>

        <p className="text-[10px] text-slate-500">
          Allgemeine Einschätzung. Prüfe vor Ort immer aktuelle Bedingungen und frage Locals. Fotos: Wikimedia Commons (Aufnahmen aus der Umgebung, nicht immer Surf-Motive).
        </p>
      </div>
    </div>
  );
}
