import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Calendar, MessageSquare, Compass, Waves, User, Lock, 
  LogIn, LogOut, Search, Tag, X, Globe, Star, Home, ArrowRight, ArrowLeft, ChevronRight
} from 'lucide-react';

interface Spot {
  id: string;
  name: string;
  continent: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  type: 'Spot' | 'Shop' | 'Camp' | 'Webcam';
  rating: number;
  swell: string;
  wind: string;
  temp: string;
  level: 'Anfänger' | 'Fortgeschritten' | 'Profi' | 'Alle Level';
  description: string;
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

const CONTINENT_COORDS: Record<string, { lat: number; lng: number; zoom: number }> = {
  Welt: { lat: 20, lng: 0, zoom: 2 },
  Europa: { lat: 48.0, lng: 10.0, zoom: 4 },
  Asien: { lat: 15.0, lng: 100.0, zoom: 4 },
  Ozeanien: { lat: -25.0, lng: 140.0, zoom: 4 },
  Amerika: { lat: 15.0, lng: -90.0, zoom: 3 }
};

const COUNTRY_COORDS: Record<string, { lat: number; lng: number; zoom: number }> = {
  Marokko: { lat: 31.7917, lng: -7.0926, zoom: 6 },
  Portugal: { lat: 39.3999, lng: -8.2245, zoom: 7 },
  Spanien: { lat: 40.4637, lng: -3.7492, zoom: 6 },
  Frankreich: { lat: 46.2276, lng: 2.2137, zoom: 6 },
  Großbritannien: { lat: 55.3781, lng: -3.4360, zoom: 6 },
  Indonesien: { lat: -0.7893, lng: 113.9213, zoom: 5 },
  Philippinen: { lat: 12.8797, lng: 121.7740, zoom: 6 },
  'Sri Lanka': { lat: 7.8731, lng: 80.7718, zoom: 7 },
  USA: { lat: 21.3069, lng: -157.8583, zoom: 7 },
  Australien: { lat: -25.2744, lng: 133.7751, zoom: 4 },
  Neuseeland: { lat: -40.9006, lng: 174.8860, zoom: 5 },
  Mexiko: { lat: 23.6345, lng: -102.5528, zoom: 5 },
  Panama: { lat: 8.5380, lng: -80.7821, zoom: 7 },
  'Costa Rica': { lat: 9.7489, lng: -83.7534, zoom: 7 },
  Peru: { lat: -9.1900, lng: -75.0152, zoom: 5 }
};

const GLOBAL_SPOTS: Spot[] = [
  // Europa
  { id: 'e1', name: 'Anchor Point', continent: 'Europa', country: 'Marokko', region: 'Taghazout', lat: 30.5442, lng: -9.7107, type: 'Spot', rating: 4.9, swell: '1.8m / 12s', wind: '10 km/h SO', temp: '21°C', level: 'Fortgeschritten', description: 'Weltberühmter Rechts-Pointbreak mit langen Barrels.' },
  { id: 'e2', name: 'Imsouane Bay', continent: 'Europa', country: 'Marokko', region: 'Imsouane', lat: 30.8402, lng: -9.8242, type: 'Spot', rating: 4.8, swell: '1.2m / 14s', wind: '5 km/h O', temp: '20°C', level: 'Alle Level', description: 'Eine der längsten Longboard-Wellen der Welt.' },
  { id: 'e3', name: 'Supertubes', continent: 'Europa', country: 'Portugal', region: 'Peniche', lat: 39.3558, lng: -9.3750, type: 'Spot', rating: 4.8, swell: '2.0m / 14s', wind: '8 km/h O', temp: '16°C', level: 'Profi', description: 'Europas hohler, kraftvoller Beachbreak.' },
  { id: 'e4', name: 'Ericeira / Coxos', continent: 'Europa', country: 'Portugal', region: 'Ericeira', lat: 38.9667, lng: -9.4167, type: 'Spot', rating: 4.9, swell: '2.2m / 13s', wind: '10 km/h N', temp: '16°C', level: 'Profi', description: 'Weltklasse-Reefbreak in Europas erstem Surf-Reservat.' },
  { id: 'e5', name: 'Mundaka', continent: 'Europa', country: 'Spanien', region: 'Baskenland', lat: 43.4077, lng: -2.6974, type: 'Spot', rating: 4.9, swell: '2.5m / 15s', wind: '12 km/h S', temp: '15°C', level: 'Profi', description: 'Legendäre linke Sandbar-Welle in der Flussmündung.' },
  { id: 'e6', name: 'Hossegor (La Gravière)', continent: 'Europa', country: 'Frankreich', region: 'Landes', lat: 43.6667, lng: -1.4333, type: 'Spot', rating: 4.9, swell: '2.3m / 14s', wind: '10 km/h O', temp: '18°C', level: 'Profi', description: 'Das Surf-Mekka Europas mit heftigen Tube-Wellen.' },
  { id: 'e7', name: 'Fistral Beach', continent: 'Europa', country: 'Großbritannien', region: 'Cornwall', lat: 50.4184, lng: -5.0945, type: 'Spot', rating: 4.5, swell: '1.5m / 10s', wind: '12 km/h W', temp: '14°C', level: 'Alle Level', description: 'Das Epizentrum des britischen Surfsports.' },

  // Asien
  { id: 'as1', name: 'Uluwatu', continent: 'Asien', country: 'Indonesien', region: 'Bali', lat: -8.8149, lng: 115.0884, type: 'Spot', rating: 4.9, swell: '2.0m / 13s', wind: '8 km/h SO', temp: '28°C', level: 'Fortgeschritten', description: 'Ikonischer Peak vor imposanter Klippenkulisse.' },
  { id: 'as2', name: 'Canggu (Echo Beach)', continent: 'Asien', country: 'Indonesien', region: 'Bali', lat: -8.6575, lng: 115.1325, type: 'Spot', rating: 4.7, swell: '1.6m / 12s', wind: '6 km/h O', temp: '28°C', level: 'Alle Level', description: 'Lebendiger Surf-Hotspot mit konstanteren Wellen.' },
  { id: 'as3', name: 'Cloud 9', continent: 'Asien', country: 'Philippinen', region: 'Siargao', lat: 9.8058, lng: 126.1622, type: 'Spot', rating: 4.9, swell: '2.0m / 13s', wind: '10 km/h O', temp: '29°C', level: 'Profi', description: 'Die berühmteste hohle Welle der Philippinen.' },
  { id: 'as4', name: 'Arugam Bay', continent: 'Asien', country: 'Sri Lanka', region: 'Ostküste', lat: 6.8432, lng: 81.8337, type: 'Spot', rating: 4.8, swell: '1.3m / 11s', wind: '8 km/h SW', temp: '29°C', level: 'Alle Level', description: 'Perfekter Right-Pointbreak für unendliche Rides.' },

  // Ozeanien
  { id: 'oz1', name: 'Pipeline', continent: 'Ozeanien', country: 'USA', region: 'Hawaii (Oahu)', lat: 21.6640, lng: -158.0539, type: 'Spot', rating: 5.0, swell: '2.5m / 15s', wind: '12 km/h O', temp: '25°C', level: 'Profi', description: 'Der gefürchtetste und berühmteste Reefbreak der Welt.' },
  { id: 'oz2', name: 'Waikiki Beach', continent: 'Ozeanien', country: 'USA', region: 'Hawaii (Honolulu)', lat: 21.2765, lng: -157.8284, type: 'Spot', rating: 4.5, swell: '1.0m / 11s', wind: '10 km/h O', temp: '26°C', level: 'Anfänger', description: 'Sanfte Wellen und die Wiege der Surf-Kultur.' },
  { id: 'oz3', name: 'Byron Bay (The Pass)', continent: 'Ozeanien', country: 'Australien', region: 'New South Wales', lat: -28.6431, lng: 153.6157, type: 'Spot', rating: 4.8, swell: '1.5m / 10s', wind: '6 km/h W', temp: '22°C', level: 'Alle Level', description: 'Legendäre Right-Hand Wellen für entspanntes Gleiten.' },
  { id: 'oz4', name: 'Snapper Rocks', continent: 'Ozeanien', country: 'Australien', region: 'Gold Coast', lat: -28.1633, lng: 153.5447, type: 'Spot', rating: 4.9, swell: '1.8m / 12s', wind: '7 km/h S', temp: '23°C', level: 'Fortgeschritten', description: 'Einer der längsten Sand-Pointbreaks.' },
  { id: 'oz5', name: 'Raglan (Manu Bay)', continent: 'Ozeanien', country: 'Neuseeland', region: 'Waikato', lat: -37.8000, lng: 174.8667, type: 'Spot', rating: 4.8, swell: '2.0m / 13s', wind: '9 km/h O', temp: '17°C', level: 'Fortgeschritten', description: 'Weltberühmte linke Hand aus "The Endless Summer".' },

  // Amerika
  { id: 'am1', name: 'Puerto Escondido', continent: 'Amerika', country: 'Mexiko', region: 'Oaxaca', lat: 15.8598, lng: -97.0700, type: 'Spot', rating: 4.9, swell: '2.8m / 16s', wind: '5 km/h N', temp: '28°C', level: 'Profi', description: 'Die mexikanische Pipeline mit gewaltigen Beachbreak-Wellen.' },
  { id: 'am2', name: 'Bocas del Toro', continent: 'Amerika', country: 'Panama', region: 'Isla Colón', lat: 9.3400, lng: -82.2540, type: 'Spot', rating: 4.7, swell: '1.7m / 11s', wind: '6 km/h SO', temp: '27°C', level: 'Fortgeschritten', description: 'Karibisches Surfen mit erstklassigen Reefbreaks.' },
  { id: 'am3', name: 'Pavones', continent: 'Amerika', country: 'Costa Rica', region: 'Puntarenas', lat: 8.3540, lng: -83.5350, type: 'Spot', rating: 4.9, swell: '2.1m / 14s', wind: '5 km/h O', temp: '28°C', level: 'Fortgeschritten', description: 'Eine der längsten linken Wellen des Planeten.' },
  { id: 'am4', name: 'Chicama', continent: 'Amerika', country: 'Peru', region: 'La Libertad', lat: -7.8422, lng: -79.1419, type: 'Spot', rating: 4.9, swell: '1.9m / 15s', wind: '10 km/h S', temp: '17°C', level: 'Alle Level', description: 'Guinness-Rekordhalter für die längste surfbare Welle.' }
];

const CAMPS_LISTINGS: CampListing[] = [
  { id: 'c1', title: 'Solid Surf House Taghazout', location: 'Taghazout, Marokko', country: 'Marokko', price: 'ab 449 € / Woche', rating: 4.9, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600', type: 'Camp' },
  { id: 'c2', title: 'Bali Surf & Yoga Villa', location: 'Canggu, Bali', country: 'Indonesien', price: 'ab 599 € / Woche', rating: 4.9, image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600', type: 'Camp' },
  { id: 'c3', title: 'Ericeira Surf Lodge', location: 'Ericeira, Portugal', country: 'Portugal', price: 'ab 499 € / Woche', rating: 4.8, image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae30?w=600', type: 'Camp' },
  { id: 'c4', title: 'High-Performance Shortboard Rental', location: 'Taghazout & Imsouane', country: 'Marokko', price: '15 € / Tag', rating: 4.9, image: 'https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=600', type: 'Rental' },
  { id: 'c5', title: 'Pro Surf Equipment & Softtop Rental', location: 'Canggu, Bali', country: 'Indonesien', price: '12 € / Tag', rating: 4.7, image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600', type: 'Rental' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'spots' | 'camps' | 'rentals' | 'chat' | 'events'>('home');
  const [selectedContinent, setSelectedContinent] = useState<string>('Alle');
  const [selectedCountry, setSelectedCountry] = useState<string>('Alle');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', user: 'Julian', text: 'Hey Leute, wie sind die Bedingungen am Anchor Point heute?', time: '10:12' },
    { id: '2', user: 'Sarah', text: 'Mega Wellen heute morgen in Imsouane!', time: '10:45' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const mapRef = useRef<any>(null);

  // Steuerung der interaktiven Leaflet-Karte mit automatischer Größenanpassung
  useEffect(() => {
    if (activeTab === 'spots' && (window as any).L) {
      const L = (window as any).L;
      const container = L.DomUtil.get('leaflet-map');
      
      if (container != null) {
        container._leaflet_id = null;
      }

      const map = L.map('leaflet-map', { zoomControl: true }).setView([20, 0], 2);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Pins hinzufügen
      GLOBAL_SPOTS.forEach(spot => {
        const marker = L.marker([spot.lat, spot.lng]).addTo(map);
        marker.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif;">
            <b style="font-size: 14px;">${spot.name}</b><br/>
            <span style="color: #64748b; font-size: 11px;">${spot.region}, ${spot.country}</span><br/>
            <small style="color: #0284c7; font-weight: bold;">Level: ${spot.level}</small>
          </div>
        `);
      });

      // WICHTIG: Erzwingt das Neu-Berechnen der Kartengröße nach dem Laden
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }
  }, [activeTab]);

  // Sanfter Kamera-Zoom
  useEffect(() => {
    if (mapRef.current) {
      if (selectedCountry !== 'Alle' && COUNTRY_COORDS[selectedCountry]) {
        const target = COUNTRY_COORDS[selectedCountry];
        mapRef.current.flyTo([target.lat, target.lng], target.zoom, { duration: 1.5 });
      } else if (selectedContinent !== 'Alle' && CONTINENT_COORDS[selectedContinent]) {
        const target = CONTINENT_COORDS[selectedContinent];
        mapRef.current.flyTo([target.lat, target.lng], target.zoom, { duration: 1.5 });
      } else {
        const target = CONTINENT_COORDS['Welt'];
        mapRef.current.flyTo([target.lat, target.lng], target.zoom, { duration: 1.5 });
      }
    }
  }, [selectedContinent, selectedCountry]);

  // Gefilterte Spots
  const filteredSpots = GLOBAL_SPOTS.filter(s => {
    const matchesContinent = selectedContinent === 'Alle' || s.continent === selectedContinent;
    const matchesCountry = selectedCountry === 'Alle' || s.country === selectedCountry;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.region.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesContinent && matchesCountry && matchesSearch;
  });

  const availableCountries = selectedContinent === 'Alle' 
    ? Array.from(new Set(GLOBAL_SPOTS.map(s => s.country)))
    : Array.from(new Set(GLOBAL_SPOTS.filter(s => s.continent === selectedContinent).map(s => s.country)));

  const selectContinent = (cont: string) => {
    setSelectedContinent(cont);
    setSelectedCountry('Alle');
  };

  const selectCountry = (country: string) => {
    setSelectedCountry(country);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
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
            
            {/* Breadcrumbs & Navigation */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-2 text-sm font-semibold">
                  <button 
                    onClick={() => { selectContinent('Alle'); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${selectedContinent === 'Alle' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                  >
                    <Globe className="w-4 h-4" /> Weltweit
                  </button>

                  {selectedContinent !== 'Alle' && (
                    <>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                      <button 
                        onClick={() => { selectCountry('Alle'); }}
                        className={`px-3 py-1.5 rounded-xl transition ${selectedCountry === 'Alle' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                      >
                        {selectedContinent}
                      </button>
                    </>
                  )}

                  {selectedCountry !== 'Alle' && (
                    <>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                      <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-xl">
                        {selectedCountry}
                      </span>
                    </>
                  )}
                </div>

                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Spot oder Stadt suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Schnellauswahl Buttons */}
              <div className="pt-2 border-t border-slate-900 flex flex-wrap gap-2">
                {selectedContinent === 'Alle' ? (
                  <>
                    <span className="text-xs text-slate-500 flex items-center gap-1 self-center mr-2">Wähle einen Kontinent:</span>
                    {['Europa', 'Asien', 'Ozeanien', 'Amerika'].map(cont => (
                      <button
                        key={cont}
                        onClick={() => selectContinent(cont)}
                        className="bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>{cont}</span>
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => selectContinent('Alle')} 
                      className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 mr-3"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Zurück zur Weltkarte
                    </button>
                    <span className="text-xs text-slate-500 flex items-center gap-1 self-center mr-2">Länder in {selectedContinent}:</span>
                    {availableCountries.map(c => (
                      <button
                        key={c}
                        onClick={() => selectCountry(c)}
                        className={`px-3 py-1 rounded-xl text-xs font-medium transition ${selectedCountry === c ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Die Karte & Ergebnisse */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Interaktive Weltkarte (mit z-0 Fix) */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden h-[540px] lg:col-span-2 shadow-xl relative z-0">
                <div id="leaflet-map" className="w-full h-full min-h-[540px] bg-slate-950"></div>
              </div>

              {/* Spots Liste */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-sm font-bold flex items-center space-x-2 text-slate-300">
                  <MapPin className="text-cyan-400 w-4 h-4" />
                  <span>Spots in dieser Region ({filteredSpots.length})</span>
                </h2>

                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
                  {filteredSpots.map(spot => (
                    <div 
                      key={spot.id} 
                      onClick={() => {
                        if (mapRef.current) {
                          mapRef.current.flyTo([spot.lat, spot.lng], 12, { duration: 1.2 });
                        }
                      }}
                      className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-cyan-500 cursor-pointer transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {spot.country} • {spot.level}
                          </span>
                          <div className="flex items-center space-x-1 text-amber-400 text-xs font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{spot.rating}</span>
                          </div>
                        </div>
                        <h3 className="text-md font-bold mt-1 text-white">{spot.name}</h3>
                        <p className="text-xs text-slate-400 mb-2">{spot.region}</p>
                        <p className="text-xs text-slate-300 mb-3 line-clamp-2">{spot.description}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-1 bg-slate-900 p-2 rounded-xl text-[10px] text-slate-300 text-center border border-slate-800/60">
                        <div><span className="text-slate-500 block text-[8px]">Swell</span>{spot.swell}</div>
                        <div><span className="text-slate-500 block text-[8px]">Wind</span>{spot.wind}</div>
                        <div><span className="text-slate-500 block text-[8px]">Temp</span>{spot.temp}</div>
                      </div>
                    </div>
                  ))}
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
                  onClick={() => { if(newMessage && user) { setMessages([...messages, {id: Date.now().toString(), user: user.name, text: newMessage, time: 'Gerade eben'}]); setNewMessage(''); }}}
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
