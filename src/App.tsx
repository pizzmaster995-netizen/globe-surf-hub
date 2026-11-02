import React, { useState } from 'react';
import { 
  MapPin, Calendar, MessageSquare, Compass, Waves, User, Lock, 
  LogIn, LogOut, Search, ExternalLink, ShieldCheck, PlusCircle,
  Wind, Thermometer, Video, Filter, ChevronRight, Star, Tag, X
} from 'lucide-react';

interface Spot {
  id: string;
  name: string;
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
  webcamUrl?: string;
  description: string;
}

interface EventItem {
  id: string;
  title: string;
  organizer: string;
  location: string;
  date: string;
  price: string;
  category: string;
  description: string;
}

interface Listing {
  id: string;
  title: string;
  type: 'Rental' | 'Hostel' | 'Lesson' | 'Trip';
  location: string;
  price: string;
  rating: number;
  image: string;
}

const GLOBAL_SPOTS: Spot[] = [
  { id: '1', name: 'Anchor Point', country: 'Marokko', region: 'Taghazout', lat: 30.5442, lng: -9.7107, type: 'Spot', rating: 4.9, swell: '1.8m / 12s', wind: '10 km/h SO', temp: '21°C Wasser', level: 'Fortgeschritten', webcamUrl: 'https://www.youtube.com', description: 'Weltberühmter Rechts-Pointbreak mit langen Barrels.' },
  { id: '2', name: 'The Bay (Imsouane)', country: 'Marokko', region: 'Imsouane', lat: 30.8402, lng: -9.8242, type: 'Spot', rating: 4.8, swell: '1.2m / 14s', wind: '5 km/h O', temp: '20°C Wasser', level: 'Alle Level', description: 'Eine der längsten Longboard-Wellen der Welt.' },
  { id: '3', name: 'Tamazirt Surf Shop', country: 'Marokko', region: 'Taghazout', lat: 30.5420, lng: -9.7080, type: 'Shop', rating: 4.9, swell: '-', wind: '-', temp: '-', level: 'Alle Level', description: 'Top Board-Verleih, Wetsuits und Reparaturen.' },
  { id: '4', name: 'Pipeline', country: 'USA', region: 'Oahu, Hawaii', lat: 21.6640, lng: -158.0539, type: 'Spot', rating: 5.0, swell: '2.5m / 15s', wind: '12 km/h O', temp: '25°C Wasser', level: 'Profi', description: 'Der legendärste Reefbreak der Welt.' },
  { id: '5', name: 'Uluwatu', country: 'Indonesien', region: 'Bali', lat: -8.8149, lng: 115.0884, type: 'Spot', rating: 4.9, swell: '2.0m / 13s', wind: '8 km/h SO', temp: '28°C Wasser', level: 'Fortgeschritten', description: 'Ikonischer Peak vor imposanter Klippenkulisse.' }
];

const INITIAL_EVENTS: EventItem[] = [
  { id: 'e1', title: 'Sunset BBQ & Sunset Surf Session', organizer: 'Solid Surf House', location: 'Taghazout, Marokko', date: 'Morgen, 18:00', price: 'Gratis für Gäste / 10€', category: 'Social', description: 'Gemeinsames Grillen auf der Dachterrasse mit Live-DJ.' },
  { id: 'e2', title: 'Video-Analyse Workshop für Intermediate Surfer', organizer: 'Nomad Surf Academy', location: 'Tamraght, Marokko', date: 'Übermorgen, 14:00', price: '15€', category: 'Coaching', description: 'Lerne deine Bewegungsabläufe auf der Welle zu optimieren.' }
];

const INITIAL_LISTINGS: Listing[] = [
  { id: 'l1', title: 'High-Performance Shortboard Rental', type: 'Rental', location: 'Taghazout', price: '15 € / Tag', rating: 4.9, image: 'https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=400' },
  { id: 'l2', title: 'Oceanfront Surf Hostel & Breakfast', type: 'Hostel', location: 'Imsouane', price: '25 € / Nacht', rating: 4.8, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400' },
  { id: 'l3', title: 'Paradise Valley & Fishing Day Trip', type: 'Trip', location: 'Agadir / Taghazout', price: '35 € / Person', rating: 5.0, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400' }
];

export default function App() {
  const [user, setUser] = useState<{ name: string; level: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'chat' | 'booking' | 'events'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Alle');

  const [messages, setMessages] = useState([
    { id: 'm1', user: 'Julian (GER)', text: 'Jemand bock auf eine Sunset Session am Anchor Point heute?', time: '16:45', location: 'Taghazout' },
    { id: 'm2', user: 'Sarah (FRA)', text: 'Wie sind die Gezeiten in Imsouane morgen früh?', time: '17:02', location: 'Imsouane' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!newMessage.trim()) return;

    setMessages([...messages, {
      id: Date.now().toString(),
      user: user.name,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: selectedRegion === 'Alle' ? 'Global' : selectedRegion
    }]);
    setNewMessage('');
  };

  const filteredSpots = GLOBAL_SPOTS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header Navigation */}
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
            { id: 'map', label: 'Spots & Karte', icon: Compass },
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
                  activeTab === tab.id 
                    ? 'bg-cyan-500 text-slate-950 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
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
            <div className="flex items-center space-x-3 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
              <User className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium">{user.name}</span>
              <button onClick={() => setUser(null)} className="text-slate-400 hover:text-red-400">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl text-sm font-semibold transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Einloggen</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {/* TAB 1: SPOTS & MAP */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Suche nach Land, Ort oder Spot (z.B. Taghazout, Pipeline, Bali)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold flex items-center space-x-2">
                  <MapPin className="text-cyan-400 w-5 h-5" />
                  <span>Ergebnisse ({filteredSpots.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSpots.map(spot => (
                    <div key={spot.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {spot.type}
                          </span>
                          <h3 className="text-lg font-bold mt-1">{spot.name}</h3>
                          <p className="text-xs text-slate-400">{spot.region}, {spot.country}</p>
                        </div>
                        <div className="flex items-center space-x-1 text-amber-400 text-sm font-semibold">
                          <Star className="w-4 h-4 fill-amber-400" />
                          <span>{spot.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 mb-4">{spot.description}</p>
                      {spot.type === 'Spot' && (
                        <div className="grid grid-cols-3 gap-2 bg-slate-900 p-2.5 rounded-xl text-xs text-slate-300">
                          <div><span className="text-slate-500 block">Swell</span>{spot.swell}</div>
                          <div><span className="text-slate-500 block">Wind</span>{spot.wind}</div>
                          <div><span className="text-slate-500 block">Temp</span>{spot.temp}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl h-[450px] flex flex-col justify-center items-center text-center">
                <Compass className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                <h3 className="font-bold text-lg">Interaktive Weltkarte</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-2">
                  Alle {filteredSpots.length} geladenen Surfspots werden auf deiner Vercel-Website auf der echten Leaflet-Karte gerendert.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHAT */}
        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="font-bold">Community Chat</h2>
                <p className="text-xs text-slate-400">Tausche dich live mit Surfern vor Ort aus</p>
              </div>
              {!user && (
                <span className="flex items-center space-x-1 text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
                  <Lock className="w-3 h-3" />
                  <span>Login nötig zum Schreiben</span>
                </span>
              )}
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl max-w-md">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                    <span className="font-bold text-cyan-400">{m.user}</span>
                    <span>{m.time}</span>
                  </div>
                  <p className="text-sm">{m.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder={user ? "Schreibe eine Nachricht..." : "Bitte melde dich an, um zu schreiben..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!user}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={!user}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-50 transition"
              >
                Senden
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: BOOKING MARKETPLACE */}
        {activeTab === 'booking' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Rentals, Hostels & Surfkurse</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {INITIAL_LISTINGS.map(l => (
                <div key={l.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition">
                  <img src={l.image} alt={l.title} className="w-full h-40 object-cover" />
                  <div className="p-4 space-y-2">
                    <span className="text-xs bg-slate-900 text-cyan-400 px-2 py-0.5 rounded border border-slate-800">{l.type}</span>
                    <h3 className="font-bold">{l.title}</h3>
                    <p className="text-xs text-slate-400">{l.location}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-cyan-400">{l.price}</span>
                      <button className="bg-cyan-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg">Anfragen</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: COMMUNITY EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Community Events & Workshops</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INITIAL_EVENTS.map(e => (
                <div key={e.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full">{e.category}</span>
                    <span className="text-xs font-semibold text-slate-400">{e.price}</span>
                  </div>
                  <h3 className="font-bold text-lg">{e.title}</h3>
                  <p className="text-xs text-slate-300">{e.description}</p>
                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-900 flex justify-between">
                    <span>Von: {e.organizer}</span>
                    <span>{e.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Einloggen / Anmelden</h3>
              <button onClick={() => setShowAuthModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <p className="text-xs text-slate-400">Nutze den Demo-Login, um sofort im Chat zu schreiben:</p>
            <button
              onClick={() => {
                setUser({ name: 'SurfNomad_99', level: 'Intermediate' });
                setShowAuthModal(false);
              }}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition"
            >
              Als Demo-User einloggen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
