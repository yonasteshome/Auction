"use client";

interface SourcingMapProps {
  location?: string;
}

export function SourcingMap({ location = "Ada'a, Bishoftu, Ethiopia" }: SourcingMapProps) {
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=10&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="bg-white dark:bg-[#1e2330] rounded-3xl border border-[#e5e7eb] dark:border-[#2a3140] p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#111318] dark:text-white">Sourcing Regions</h3>
        <p className="text-sm text-[#616f89] mt-1">Concentration of premium yields</p>
      </div>

      <div className="flex-1 relative rounded-2xl bg-slate-100 dark:bg-slate-800/50 overflow-hidden min-h-[240px] flex items-center justify-center">
        <iframe 
          src={mapUrl} 
          width="100%" 
          height="100%" 
          style={{ border: 0, position: 'absolute', top: 0, left: 0 }} 
          allowFullScreen={false} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${location}`}
        />
        
        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
          <div className="bg-white/90 dark:bg-[#1e2330]/90 backdrop-blur-md p-2 rounded-lg border border-white/20 shadow-lg pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-[8px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">Primary Source: {location.split(',')[0]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
