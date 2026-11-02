import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, MessageSquare, Compass, Waves, User, Lock, 
  LogIn, LogOut, Search, Tag, X, Globe, Star, Filter
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

const GLOBAL_SPOTS: Spot[] = [
  // Europa
  { id: 'e1', name: 'Anchor Point', continent: 'Europa', country: 'Marokko', region: 'Taghazout', lat: 30.5442, lng: -9.7107, type: 'Spot', rating: 4.9, swell: '1.8m / 12s', wind: '10 km/h SO', temp: '21°C', level: 'Fortgeschritten', description: 'Weltberühmter Rechts-Pointbreak.' },
  { id: 'e2', name: 'Supertubes', continent: 'Europa', country: 'Portugal', region: 'Peniche', lat: 39.3558, lng: -9.3750, type: 'Spot', rating: 4.8, swell: '2.0m / 14s', wind: '8 km/h O', temp: '16°C', level: 'Profi', description: 'Europas hohler Beachbreak.' },
  { id: 'e3', name: 'Mundaka', continent: 'Europa', country: 'Spanien', region: 'Baskenland', lat: 43.4077, lng: -2.6974, type: 'Spot', rating: 4.9, swell: '2.5m / 15s', wind: '12 km/h S', temp: '15°C', level: 'Profi', description: 'Eine der besten linken Wellen weltweit.' },
  
  // Asien & Ozeanien
  { id: 'a1', name: 'Uluwatu', continent: 'Asien', country: 'Indonesien', region: 'Bali', lat: -8.8149, lng: 115.0884, type: 'Spot', rating: 4.9, swell: '2.0m / 13s', wind: '8 km/h SO', temp: '28°C', level: 'Fortgeschritten', description: 'Ikonischer Peak vor Klippen.' },
  { id: 'a2', name: 'Pipeline', continent: 'Ozeanien', country: 'USA', region: 'Hawaii', lat: 21.6640, lng: -158.0539, type: 'Spot', rating: 5.0, swell: '2.5m / 15s', wind: '12 km/h O', temp: '25°C', level: 'Profi', description: 'Legendärster Reefbreak.' },
  { id: 'a3', name: 'Byron Bay', continent: 'Ozeanien', country: 'Australien', region: 'New South Wales', lat: -28.6431, lng: 153.6157, type: 'Spot', rating: 4.8, swell: '1.5m / 10s', wind: '6 km/h W', temp: '22°C', level: 'Alle Level', description: 'Entspanntes Surferparadies.' },

  // Amerika
  { id: 'am1', name: 'Waikiki Beach', continent: 'Amerika', country: 'USA', region: 'Hawaii', lat: 21.2765, lng: -157.8284, type: 'Spot', rating: 4.5, swell: '1.0m / 11s', wind: '10 km/h O', temp: '26°C', level: 'Anfänger', description: 'Geburtsort des modernen Surfens.' },
  { id: 'am2', name: 'Puerto Escondido', continent: 'Amerika', country: 'Mexiko', region: 'Oaxaca', lat: 15.8598, lng: -97.0700, type: 'Spot', rating: 4.9, swell: '2.8m / 16s', wind: '5 km/h N', temp: '28°C', level: 'Profi', description: 'Die "Mexikanische Pipeline".' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'chat' | 'booking' | 'events'>('map');
  const [selectedContinent, setSelectedContinent] = useState<string>('Alle');
  const [selectedCountry, setSelectedCountry] = useState<string>('Alle');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', user: 'Julian', text: 'Hey Leute, wie sind die Bedingungen in Taghazout?', time: '10:12' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Leaflet Karte einbinden sobald Map-Tab aktiv ist
  useEffect(() => {
    if (activeTab === 'map' && (window as any).L) {
      const container = (window as any).L.DomUtil.get('leaflet-map');
      if (container != null) {
        container._leaflet_id = null; // Verhindert mehrfaches Rendern
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

  // Gefilterte Spots nach Kontinent, Land & Suche
  const filteredSpots = GLOBAL_SPOTS.filter(s => {
    const matchesContinent = selectedContinent === 'Alle' || s.continent === selectedContinent;
    const matchesCountry = selectedCountry === 'Alle' || s.country === selectedCountry;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesContinent && matchesCountry && matchesSearch;
  });

  const availableCountries = selectedContinent === 'Alle' 
    ? Array.from(new Set(GLOBAL_SPOTS.map(s => s.country)))
    : Array.from(new Set(GLOBAL_SPOTS.filter(s => s.continent === selectedContinent).map(s => s.country)));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-500 p-2 rounded-xl text-slate-950">
            <Waves className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            GlobeSurf Hub
          </span>
        </div>

        <nav className="hidden md:flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'map', label: 'Spots & Weltkarte', icon: Compass },
            { id: 'chat', label: 'Community Chat', icon: MessageSquare },
            { id: 'booking', label: 'Rentals & Camps', icon: Calendar },
            { id: 'events', label: 'Events Board', icon: Tag },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.id ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
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

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Filter-Leiste */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1"><Globe className="w-4 h-4 text-cyan-400"/> Kontinent:</span>
                {['Alle', 'Europa', 'Asien', 'Ozeanien', 'Amerika'].map(cont => (
                  <button
                    key={cont}
                    onClick={() => { setSelectedContinent(cont); setSelectedCountry('Alle'); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${selectedContinent === cont ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
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
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Alle">Alle Länder</option>
                  {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Grid mit echter Karte und Spot-Liste */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Echte Leaflet Karte */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden h-[500px] lg:col-span-1 shadow-lg relative z-0">
                <div id="leaflet-map" className="w-full h-full"></div>
              </div>

              {/* Spots Liste */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold flex items-center space-x-2">
                  <MapPin className="text-cyan-400 w-5 h-5" />
                  <span>Surfspots ({filteredSpots.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-2">
                  {filteredSpots.map(spot => (
                    <div key={spot.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {spot.country} • {spot.level}
                          </span>
                          <h3 className="text-md font-bold mt-1">{spot.name}</h3>
                          <p className="text-xs text-slate-400">{spot.region}</p>
                        </div>
                        <div className="flex items-center space-x-1 text-amber-400 text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{spot.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 mb-3">{spot.description}</p>
                      <div className="grid grid-cols-3 gap-1 bg-slate-900 p-2 rounded-xl text-[11px] text-slate-300 text-center">
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

        {/* Andere Tabs (Chat / Booking / Events) */}
        {activeTab === 'chat' && (
          <div className="max-w-2xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6 h-[500px] flex flex-col">
            <h2 className="font-bold text-lg mb-4">Community Chat</h2>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.map(m => (
                <div key={m.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-sm">
                  <span className="text-cyan-400 font-bold text-xs block mb-1">{m.user} <span className="text-slate-500 font-normal">{m.time}</span></span>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder={user ? "Nachricht schreiben..." : "Bitte erst einloggen..."} 
                disabled={!user}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500" 
              />
              <button 
                onClick={() => { if(newMessage && user) { setMessages([...messages, {id: Date.now().toString(), user: user.name, text: newMessage, time: 'Jetzt'}]); setNewMessage(''); }}}
                disabled={!user}
                className="bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50"
              >
                Senden
              </button>
            </div>
          </div>
        )}

        {activeTab === 'booking' && <div className="text-center py-12 text-slate-400">Hostel & Verleih Marktplatz in Kürze verfügbar...</div>}
        {activeTab === 'events' && <div className="text-center py-12 text-slate-400">Event Board wird geladen...</div>}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center"><h3 className="font-bold text-lg">Einloggen</h3><button onClick={() => setShowAuthModal(false)}><X className="w-5 h-5 text-slate-500" /></button></div>
            <button onClick={() => { setUser({ name: 'SurfNomad' }); setShowAuthModal(false); }} className="w-full bg-cyan-500 text-slate-950 font-bold py-2.5 rounded-xl text-sm">Als Demo-User starten</button>
          </div>
        </div>
      )}
    </div>
  );
}
