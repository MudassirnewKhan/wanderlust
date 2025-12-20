'use client';

import React, { useState } from 'react';
import { 
  MapPin, Calendar, Wallet, Loader2, Plane, Navigation, Utensils, 
  Camera, Sun, ArrowRight, CheckCircle2, Sparkles, Search, 
  Info, Backpack, Coins, CloudSun, Copy, Check, Map as MapIcon, 
  Printer, List, ExternalLink, Users, Heart
} from 'lucide-react';

// --- SUB-COMPONENTS ---

const Header = () => (
  <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 no-print">
    <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
          <Plane size={24} />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          WanderLust AI
        </h1>
      </div>
      <div className="text-sm font-medium text-slate-500 hidden sm:block">
        gemini-2.5-flash-preview
      </div>
    </div>
  </header>
);

const TripHero = ({ data }: { data: any }) => (
  <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl group bg-slate-900 mb-8 print:h-64 print:mb-4 print:shadow-none print:border print:border-slate-300">
    <div className="absolute inset-0 bg-slate-900">
      <img 
        src={data.heroImage} 
        alt="Destination"
        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 print:opacity-100"
      />
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-8 print:bg-none print:text-black print:p-0 print:relative">
      <div className="text-indigo-300 text-sm font-bold tracking-wider uppercase mb-2 flex items-center gap-2 print:text-indigo-600 print:mt-4">
        <Sparkles size={16} />
        Your Personalized Journey
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight print:text-black">{data.tripTitle}</h2>
      <p className="text-slate-200 line-clamp-2 max-w-2xl text-lg font-light leading-relaxed print:text-slate-700">{data.summary}</p>
    </div>
  </div>
);

const IntelCard = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow h-full print:border-slate-300 print:shadow-none">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg print:bg-transparent print:p-0">
        <Icon size={20} />
      </div>
      <h3 className="font-bold text-slate-800">{title}</h3>
    </div>
    <div className="text-slate-600 text-sm leading-relaxed">
      {children}
    </div>
  </div>
);

const DayCard = ({ day, destination }: { day: any, destination: string }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 print:shadow-none print:border-slate-300 print:mb-6 break-inside-avoid">
    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 print:bg-transparent print:border-b-2 print:border-slate-200">
      <div className="flex items-center gap-3">
        <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm shadow-indigo-200 print:bg-transparent print:text-black print:border print:border-black print:shadow-none">
          Day {day.day}
        </span>
        <h3 className="font-bold text-slate-700 text-lg">{day.theme}</h3>
        {day.date && <span className="text-xs text-slate-400 font-medium ml-auto print:text-slate-600">{day.date}</span>}
      </div>
    </div>
    <div className="p-6 space-y-8">
      {day.activities.map((activity: any, actIdx: number) => {
        const searchKeyword = activity.type === 'food' ? 'food,meal' : 'landmark,travel';
        return (
          <div key={actIdx} className="relative pl-8 border-l-2 border-indigo-100 last:border-0 pb-2 last:pb-0 print:border-slate-200">
            <div className="absolute -left-[9px] top-1 bg-white p-1 rounded-full border-2 border-indigo-100 z-10 print:border-slate-300">
              {activity.type === 'food' ? <Utensils size={14} className="text-orange-500" /> : 
               activity.type === 'sightseeing' ? <Camera size={14} className="text-blue-500" /> :
               <Sun size={14} className="text-yellow-500" />}
            </div>

            <div className="group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                {/* SMART LINK: Google Search */}
                <a 
                  href={`https://www.google.com/search?q=${encodeURIComponent(activity.activity + " " + destination)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors flex items-center gap-2"
                >
                  {activity.activity}
                  <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 no-print" />
                </a>
                <span className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded self-start border border-indigo-100 print:bg-transparent print:border-slate-200 print:text-slate-600">
                  {activity.time}
                </span>
              </div>
              
              <p className="text-slate-600 leading-relaxed mb-3">{activity.description}</p>
              
              {activity.location && (
                // SMART LINK: Google Maps Location
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location + " " + destination)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-400 font-medium mb-4 hover:text-indigo-600 transition-colors"
                >
                  <MapPin size={14} />
                  {activity.location}
                </a>
              )}

              {/* Image hidden on print to save ink/space */}
              <div className="relative h-48 w-full rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all bg-slate-100 print:hidden">
                  <img 
                   src={`https://loremflickr.com/600/400/${searchKeyword}?lock=${actIdx + (day.day * 10)}`}
                   alt={activity.activity}
                   className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                   loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// --- MAIN PAGE LOGIC ---

export default function Page() {
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    budget: 'Medium',
    travelers: 'Couple',
    interests: '',
    startDate: ''
  });

  const [state, setState] = useState({
    itinerary: null as any,
    loading: false,
    loadingStep: '',
    error: '',
    activeTab: 'itinerary' as 'itinerary' | 'intel' | 'map'
  });
  
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    
    if (!formData.destination) {
      setState(prev => ({ ...prev, error: "Please enter a destination." }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: '', itinerary: null }));

    try {
      const steps = ["Connecting to AI Agent...", `Analyzing ${formData.destination}...`, "Checking weather patterns...", "Finalizing details..."];
      for (const step of steps) {
        setState(prev => ({ ...prev, loadingStep: step }));
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Convert interests string to array for API
      const payload = {
        ...formData,
        interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean)
      };

      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server Error: ${response.status}`);
      }

      const data = await response.json();
      setState(prev => ({ ...prev, loading: false, itinerary: data }));

    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, loading: false, error: err.message }));
    }
  };

  const handleCopy = () => {
    if (!state.itinerary) return;
    const text = `Trip to ${formData.destination}\n\n` + 
      state.itinerary.days.map((d: any) => 
        `Day ${d.day}: ${d.theme}\n` + 
        d.activities.map((a: any) => `- ${a.time}: ${a.activity}`).join('\n')
      ).join('\n\n');
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20 selection:bg-indigo-100 print:bg-white print:pb-0">
      
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { -webkit-print-color-adjust: exact; }
          /* Ensure maps/images don't break across pages awkwardly */
          .break-inside-avoid { break-inside: avoid; }
        }
      `}</style>

      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR (Hidden on Print) */}
          <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 no-print">
            <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 p-6 border border-slate-100">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                <Sparkles className="text-indigo-500" size={20} />
                Trip Settings
              </h2>
              
              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination</label>
                  <div className="relative group">
                    <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="e.g., Tokyo, Japan"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input 
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</label>
                    <select 
                      name="days"
                      value={formData.days}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    >
                      {[1,2,3,4,5,7,10,14].map(d => <option key={d} value={d}>{d} Days</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget</label>
                    <select 
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    >
                      <option>Budget</option>
                      <option>Medium</option>
                      <option>Luxury</option>
                    </select>
                  </div>
                </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Travelers</label>
                    <div className="relative">
                      <select 
                        name="travelers" 
                        value={formData.travelers} 
                        onChange={handleInputChange} 
                        className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                      >
                        <option value="Solo">Solo</option>
                        <option value="Couple">Couple</option>
                        <option value="Family">Family</option>
                        <option value="Friends">Friends</option>
                      </select>
                       <Users className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interests</label>
                  <div className="relative">
                     <input
                      name="interests"
                      value={formData.interests}
                      onChange={handleInputChange}
                      placeholder="e.g. History, Food, Hiking"
                      className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <Heart className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={state.loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {state.loading ? (
                    <><Loader2 className="animate-spin" size={20} /> Planning...</>
                  ) : (
                    <>Generate Plan <ArrowRight size={18} /></>
                  )}
                </button>
                {state.error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{state.error}</div>}
              </form>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-8 xl:col-span-9 min-h-[500px]">
            {state.loading ? (
              <div className="h-96 flex flex-col items-center justify-center text-center space-y-6 no-print">
                <div className="bg-white p-6 rounded-full shadow-xl ring-1 ring-slate-100 relative">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">{state.loadingStep}</h3>
                  <p className="text-slate-400 text-sm">Building your perfect itinerary...</p>
                </div>
              </div>
            ) : state.itinerary ? (
              <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 fade-in">
                <TripHero data={state.itinerary} />
                
                {/* TABS (Hidden on Print) */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-1 no-print">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setState(p => ({...p, activeTab: 'itinerary'}))}
                      className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${state.activeTab === 'itinerary' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                    >
                      <List size={16} /> Daily Plan
                    </button>
                    <button 
                      onClick={() => setState(p => ({...p, activeTab: 'intel'}))}
                      className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${state.activeTab === 'intel' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                    >
                      <Info size={16} /> Trip Intel
                    </button>
                    <button 
                      onClick={() => setState(p => ({...p, activeTab: 'map'}))}
                      className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${state.activeTab === 'map' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                    >
                      <MapIcon size={16} /> Map View
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={handlePrint} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 px-3 py-1 rounded hover:bg-slate-100 transition">
                       <Printer size={16} /> Print/PDF
                    </button>
                    <button onClick={handleCopy} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 px-3 py-1 rounded hover:bg-slate-100 transition">
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* TAB CONTENT */}
                {state.activeTab === 'itinerary' && (
                  <div className="grid grid-cols-1 gap-6">
                    {state.itinerary.days.map((day: any, idx: number) => (
                      <DayCard key={idx} day={day} destination={formData.destination} />
                    ))}
                  </div>
                )}

                {state.activeTab === 'intel' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <IntelCard icon={Backpack} title="Packing Essentials">
                      <ul className="space-y-2">
                        {state.itinerary.packingList?.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="bg-indigo-100 text-indigo-500 rounded-full p-0.5 mt-0.5"><Check size={10} strokeWidth={3} /></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </IntelCard>

                    <IntelCard icon={Coins} title="Currency & Money">
                      <div className="space-y-3">
                          <div className="font-medium text-slate-900">Currency: {state.itinerary.currency?.code}</div>
                          <div className="text-xs bg-slate-100 p-2 rounded">Rate: {state.itinerary.currency?.rate}</div>
                          <p>{state.itinerary.currency?.tips}</p>
                      </div>
                    </IntelCard>

                    <IntelCard icon={Info} title="Local Tips & Etiquette">
                        <ul className="space-y-2 list-disc pl-4 marker:text-indigo-400">
                        {state.itinerary.localTips?.map((tip: string, i: number) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </IntelCard>

                    <IntelCard icon={CloudSun} title="Expected Weather">
                      <p className="text-lg font-medium text-slate-700">{state.itinerary.weather}</p>
                    </IntelCard>
                  </div>
                )}

                {state.activeTab === 'map' && (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[600px] w-full relative">
                     <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://www.google.com/maps?q=${encodeURIComponent(formData.destination + " attractions")}&output=embed`}
                     ></iframe>
                     <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-xs text-slate-500 shadow-lg">
                       Interactive map showing general area.
                     </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-white/50 rounded-3xl border border-dashed border-slate-300 no-print">
                <div className="bg-indigo-50 p-6 rounded-full mb-6 ring-4 ring-indigo-50/50">
                  <Navigation className="text-indigo-500" size={48} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to explore?</h3>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                  Enter your destination details to unlock a fully personalized travel dossier containing itineraries, packing lists, and local secrets.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}