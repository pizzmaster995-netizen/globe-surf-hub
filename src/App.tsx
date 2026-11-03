import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, MessageSquare, Compass, Waves, User, Lock, 
  LogIn, LogOut, Search, Tag, X, Globe, Star, Filter, Home, DollarSign, Award, ArrowRight
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

const GLOBAL_SPOTS: Spot[] = [
  // Europa
  { id: 'e1', name: 'Anchor Point', continent: 'Europa', country: 'Marokko', region: 'Taghazout', lat: 30.5442, lng: -9.7107, type: 'Spot', rating: 4.9, swell: '1.8m / 12s', wind: '10 km/h SO', temp: '21°C', level: 'Fortgeschritten', description: 'Weltberühmter Rechts-Pointbreak mit langen Barrels.' },
  { id: 'e2', name: 'Imsuane Bay', continent: 'Europa', country: 'Marokko', region: 'Imsouane', lat: 30.8402, lng: -9.8242, type: 'Spot', rating: 4.8, swell: '1.2m / 14s', wind: '5 km/h O', temp: '20°C', level: 'Alle Level', description: 'Eine der längsten Longboard-Wellen der Welt.' },
  { id: 'e3', name: 'Supertubes', continent: 'Europa', country: 'Portugal', region: 'Peniche', lat: 39.3558, lng: -9.3750, type: 'Spot', rating: 4.8, swell: '2.0m / 14s', wind: '8 km/h O', temp: '16°C', level: 'Profi', description: 'Europas hohler, kraftvoller Beachbreak.' },
  { id: 'e4', name: 'Ericeira / Coxos', continent: 'Europa', country: 'Portugal', region: 'Ericeira', lat: 38.9667, lng: -9.4167, type: 'Spot', rating: 4.9, swell: '2.2m / 13s', wind: '10 km/h N', temp: '16°C', level: 'Profi', description: 'Weltklasse-Reefbreak in Europas erstem Surf-Reserat.' },
  { id: 'e5', name: 'Mundaka', continent: 'Europa', country: 'Spanien', region: 'Baskenland', lat: 43.4077, lng: -2.6974, type: 'Spot', rating: 4.9, swell: '2.5m / 15s', wind: '12 km/h S', temp: '15°C', level: 'Profi', description: 'Legendäre linke Sandbar-Welle in der Flussmündung.' },
  { id: 'e6', name: 'Hossegor (La Gravière)', continent: 'Europa', country: 'Frankreich', region: 'Landes', lat: 43.6667, lng: -1.4333, type: 'Spot', rating: 4.9, swell: '2.3m / 14s', wind: '10 km/h O', temp: '18°C', level: 'Profi', description: 'Das Surf-Mekka Europas mit heftigen Tube-Wellen.' },
  { id: 'e7', name: 'English Bay / Fistral', continent: 'Europa', country: 'Großbritannien', region: 'Cornwall', lat: 50.4184, lng: -5.0945, type: 'Spot', rating: 4.5, swell: '1.5m / 10s', wind: '12 km/h W', temp: '14°C', level: 'Alle Level', description: 'Das Epizentrum des britischen Surfsports.' },

  // Asien
  { id: 'as1', name: 'Uluwatu', continent: 'Asien', country: 'Indonesien', region: 'Bali', lat: -8.8149, lng: 115.0884, type: 'Spot', rating: 4.9, swell: '2.0m / 13s', wind: '8 km/h SO', temp: '28°C', level: 'Fortgeschritten', description: 'Ikonischer Peak vor imposanter Klippenkulisse.' },
  { id: 'as2', name: 'Canggu (Echo Beach)', continent: 'Asien', country: 'Indonesien', region: 'Bali', lat: -8.6575, lng: 115.1325, type: 'Spot', rating: 4.7, swell: '1.6m / 12s', wind: '6 km/h O', temp: '28°C', level: 'Alle Level', description: 'Lebendiger Surf-Hotspot mit konstanteren Wellen.' },
  { id: 'as3', name: 'Medewi', continent: 'Asien', country: 'Indonesien', region: 'Lombok / Bali', lat: -8.4333, lng: 114.8333, type: 'Spot', rating: 4.6, swell: '1.5m / 14s', wind: '5 km/h N', temp: '28°C', level: 'Anfänger', description: 'Lange, entspannte Linke über steinigem Untergrund.' },
  { id: 'as4', name: 'Cloud 9', continent: 'Asien', country: 'Philippinen', region: 'Siargao', lat: 9.8058, lng: 126.1622, type: 'Spot', rating: 4.9, swell: '2.0m / 13s', wind: '10 km/h O', temp: '29°C', level: 'Profi', description: 'Die berühmteste hohle Welle der Philippinen.' },
  { id: 'as5', name: 'Arugam Bay', continent: 'Asien', country: 'Sri Lanka', region: 'Ostküste', lat: 6.8432, lng: 81.8337, type: 'Spot', rating: 4.8, swell: '1.3m / 11s', wind: '8 km/h SW', temp: '29°C', level: 'Alle Level', description: 'Perfekter Right-Pointbreak für unendliche Rides.' },

  // Ozeanien
  { id: 'oz1', name: 'Pipeline', continent: 'Ozeanien', country: 'USA', region: 'Hawaii (Oahu)', lat: 21.6640, lng: -158.0539, type: 'Spot', rating: 5.0, swell: '2.5m / 15s', wind: '12 km/h O', temp: '25°C', level: 'Profi', description: 'Der gefürchtetste und berühmteste Reefbreak der Welt.' },
  { id: 'oz2', name: 'Waikiki Beach', continent: 'Ozeanien', country: 'USA', region: 'Hawaii (Honolulu)', lat: 21.2765, lng: -157.8284, type: 'Spot', rating: 4.5, swell: '1.0m / 11s', wind: '10 km/h O', temp: '26°C', level: 'Anfänger', description: 'Sanfte Wellen und die Wiege der Surf-Kultur.' },
  { id: 'oz3', name: 'Byron Bay (The Pass)', continent: 'Ozeanien', country: 'Australien', region: 'New South Wales', lat: -28.6431, lng: 153.6157, type: 'Spot', rating: 4.8, swell: '1.5m / 10s', wind: '6 km/h W', temp: '22°C', level: 'Alle Level', description: 'Legendäre Right-Hand Wellen für entspanntes Gleiten.' },
  { id: 'oz4', name: 'Snapper Rocks', continent: 'Ozeanien', country: 'Australien', region: 'Gold Coast', lat: -28.1633, lng: 153.5447, type: 'Spot', rating: 4.9, swell: '1.8m / 12s', wind: '7 km/h S', temp: '23°C', level: 'Fortgeschritten', description: 'Einer der längsten künstlich unterstützten Sand-Pointbreaks.' },
  { id: 'oz5', name: 'Raglan (Manu Bay)', continent: 'Ozeanien', country: 'Neuseeland', region: 'Waikato', lat: -37.8000, lng: 174.8667, type: 'Spot', rating: 4.8, swell: '2.0m / 13s', wind: '9 km/h O', temp: '17°C', level: 'Fortgeschritten', description: 'Weltberühmte linke Hand aus dem Film "The Endless Summer".' },

  // Amerika (Nord- & Südamerika)
  { id: 'am1', name: 'Puerto Escondido', continent: 'Amerika', country: 'Mexiko', region: 'Oaxaca', lat: 15.8598, lng: -97.0700, type: 'Spot', rating: 4.9, swell: '2.8m / 16s', wind: '5 km/h N', temp: '28°C', level: 'Profi', description: 'Die mexikanische Pipeline mit gewaltigen Beachbreak-Wellen.' },
  { id: 'am2', name: 'Malibu (First Point)', continent: 'Amerika', country: 'USA', region: 'Kalifornien', lat: 34.0381, lng: -118.6644, type: 'Spot', rating: 4.7, swell: '1.4m / 12s', wind: '8 km/h NW', temp: '18°C', level: 'Alle Level', description: 'Kalifornischer Kult-Pointbreak.' },
  { id: 'am3', name: 'Bocas del Toro', continent: 'Amerika', country: 'Panama', region: 'Isla Colón', lat: 9.3400, lng: -82.2540, type: 'Spot', rating: 4.7, swell: '1.7m / 11s', wind: '6 km/h SO', temp: '27°C', level: 'Fortgeschritten', description: 'Karibisches Surfen mit erstklassigen Reefbreaks.' },
  { id: 'am4', name: 'Pavones', continent: 'Amerika', country: 'Costa Rica', region: 'Puntarenas', lat: 8.3540, lng: -83.5350, type: 'Spot', rating: 4.9, swell: '2.1m / 14s', wind: '5 km/h O', temp: '28°C', level: 'Fortgeschritten', description: 'Eine der längsten linken Wellen des Planeten.' },
  { id: 'am5', name: 'Chicama', continent: 'Amerika', country: 'Peru', region: 'La Libertad', lat: -7.8422, lng: -79.1419, type: 'Spot', rating: 4.9, swell: '1.9m / 15s', wind: '10 km/h S', temp: '17°C', level: 'Alle Level', description: 'Guinness-Rekordhalter für die längste surfbare Welle.' }
];

const CAMPS_LISTINGS: CampListing[] = [
  { id: 'c1', title: 'Solid Surf House Taghazout', location: 'Taghazout, Marokko', country: 'Marokko', price: 'ab 449 € / Woche', rating: 4.9, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600', type: 'Camp' },
  { id: 'c2', title: 'Bali Surf & Yoga Villa', location: 'Canggu, Bali', country: 'Indonesien', price: 'ab 599 € / Woche', rating: 4.9, image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600', type: 'Camp' },
  { id: 'c3', title: 'Ericeira Surf Lodge', location: 'Ericeira, Portugal', country: 'Portugal', price: 'ab 499 € / Woche', rating: 4.8, image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae30?w=600', type: 'Camp' },
  { id: 'c4', title: 'High-Performance Shortboard & Longboard Rental', location: 'Taghazout & Imsouane', country: 'Marokko', price: '15 € / Tag', rating: 4.9, image: 'https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=600', type: 'Rental' },
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

  // Leaflet Karte laden wenn Spot-Tab aktiv ist
  useEffect(() => {
    if (activeTab === 'spots' && (window as any).L) {
      const container = (window as any).L.DomUtil.get('leaflet-map');
      if (container != null) {
        container._leaflet_id = null;
      }
      const map = (window as any).L.map('leaflet-map').setView([20, 0], 2);
      
      (window as any).L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      GLOBAL_SPOTS.forEach(spot => {
        (window as any).L.marker([spot.lat, spot.lng])
          .addTo(map)
          .bindPopup(`<b>${spot.name}</b><br>${spot.region}, ${spot.country}<br>Level: ${spot.level}`);
      });
    }
  }, [activeTab]);

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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-cyan-500 p-2 rounded-xl text-slate-950">
            <Waves className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            GlobeSurf Hub
          </span>
        </div>

        {/* Navigation */}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        
        {/* TAB 0: HOME / HERO SEITE */}
        {activeTab === 'home' && (
          <div className="space-y-12 pb-12">
            {/* Hero Section */}
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
                  Finde perfekte Wellen, verbinde dich mit Surfern rund um den Globus und buche unvergessliche Surf-Abenteuer.
                </p>
                <div className="flex justify-center gap-4 pt-4">
                  <button 
                    onClick={() => setActiveTab('spots')} 
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-3.5 rounded-2xl text-base transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                  >
                    <span>Spots entdecken</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('camps')} 
                    className="bg-slate-800/80 hover:bg-slate-700 text-white font-bold px-8 py-3.5 rounded-2xl text-base transition border border-slate-700 backdrop-blur"
                  >
                    Surfcamps ansehen
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Features */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-3">
                <div className="bg-cyan-500/10 text-cyan-400 p-3 rounded-xl w-fit"><Globe className="w-6 h-6"/></div>
                <h3 className="text-lg font-bold">Weltweite Spot-Datenbank</h3>
                <p className="text-xs text-slate-400">Filibriere gezielt nach Kontinenten, Ländern und Schwierigkeitsgraden von Anfänger bis Profi.</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-3">
                <div className="bg-cyan-500/10 text-cyan-400 p-3 rounded-xl w-fit"><Home className="w-6 h-6"/></div>
                <h3 className="text-lg font-bold">Top Surfcamps & Hostels</h3>
                <p className="text-xs text-slate-400">Entdecke handverlesene Unterkünfte direkt am Spot mit direktem Anschluss an die Community.</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-3">
                <div className="bg-cyan-500/10 text-cyan-400 p-3 rounded-xl w-fit"><MessageSquare className="w-6 h-6"/></div>
                <h3 className="text-lg font-bold">Live Community</h3>
                <p className="text-xs text-slate-400">Tausche dich im Live-Chat über aktuelle Bedingungen, Swells und Session-Zeiten aus.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: SURFSPOTS (Kontinente -> Länder -> Spots mit Karte) */}
        {activeTab === 'spots' && (
          <div className="max-w-7xl w-full mx-auto p-6 space-y-6 flex-1">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <Globe className="w-4 h-4 text-cyan-400"/> Kontinent:
                  </span>
                  {['Alle', 'Europa', 'Asien', 'Ozeanien', 'Amerika'].map(cont => (
                    <button
                      key={cont}
                      onClick={() => { setSelectedContinent(cont); setSelectedCountry('Alle'); }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${selectedContinent === cont ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                    >
                      {cont}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Land:</span>
                  <select 
                    value={selectedCountry} 
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                  >
                    <option value="Alle">Alle Länder ({availableCountries.length})</option>
                    {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Nach Spot-Name oder Region suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden h-[520px] lg:col-span-1 shadow-lg">
                <div id="leaflet-map" className="w-full h-full"></div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-md font-semibold flex items-center space-x-2 text-slate-300">
                  <MapPin className="text-cyan-400 w-4 h-4" />
                  <span>Gefundene Surfspots ({filteredSpots.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[470px] overflow-y-auto pr-2">
                  {filteredSpots.map(spot => (
                    <div key={spot.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {spot.country} • {spot.level}
                            </span>
                            <h3 className="text-md font-bold mt-1 text-white">{spot.name}</h3>
                            <p className="text-xs text-slate-400">{spot.region}, {spot.continent}</p>
                          </div>
                          <div className="flex items-center space-x-1 text-amber-400 text-xs font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{spot.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 mb-3">{spot.description}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-1 bg-slate-900 p-2 rounded-xl text-[11px] text-slate-300 text-center border border-slate-800/60">
                        <div><span className="text-slate-500 block text-[9px]">Swell</span>{spot.swell}</div>
                        <div><span className="text-slate-500 block text-[9px]">Wind</span>{spot.wind}</div>
                        <div><span className="text-slate-500 block text-[9px]">Temp</span>{spot.temp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SURFCAMPS & HOSTELS */}
        {activeTab === 'camps' && (
          <div className="max-w-7xl w-full mx-auto p-6 space-y-6 flex-1">
            <h2 className="text-xl font-bold">Handverlesene Surfcamps & Hostels</h2>
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
            <h2 className="text-xl font-bold">Surfboard & Equipment Rentals</h2>
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

        {/* TAB 4: COMMUNITY CHAT */}
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
            <h2 className="text-xl font-bold">Surf Events & Workshops</h2>
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
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                <span className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full font-semibold">Workshop</span>
                <h3 className="font-bold text-lg">Video-Analyse & Surf Coaching</h3>
                <p className="text-xs text-slate-300">Optimiere deinen Take-Off und deine Turns durch professionelle Videoanalyse am Abend.</p>
                <div className="text-xs text-slate-400 pt-2 border-t border-slate-900 flex justify-between">
                  <span>Ort: Canggu, Bali</span>
                  <span className="text-cyan-400 font-bold">Samstag, 15:00 Uhr</span>
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
            <p className="text-xs text-slate-400">Klicke unten, um dich direkt mit dem Demo-Account anzumelden:</p>
            <button onClick={() => { setUser({ name: 'SurfNomad_99' }); setShowAuthModal(false); }} className="w-full bg-cyan-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition hover:bg-cyan-400">Als Demo-User starten</button>
          </div>
        </div>
      )}
    </div>
  );
}
