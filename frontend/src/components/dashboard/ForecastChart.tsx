import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'Mon', demand: 320, supply: 280 },
  { name: 'Tue', demand: 360, supply: 330 },
  { name: 'Wed', demand: 400, supply: 380 },
  { name: 'Thu', demand: 450, supply: 410 },
  { name: 'Fri', demand: 520, supply: 460 },
  { name: 'Sat', demand: 610, supply: 540 },
  { name: 'Sun', demand: 580, supply: 560 },
];

export function ForecastChart() {
  return (
    <div className="bg-white rounded-3xl border border-[#33251E]/5 p-6 shadow-sm h-full flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#33251E]/50 mb-1">Trend</div>
          <h2 className="font-serif text-2xl text-[#33251E]">Demand vs supply · this week</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#33251E]/70 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F07154]"></span> Demand
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#33251E]/70 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Supply
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[240px] -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F07154" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#F07154" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#33251E', opacity: 0.6 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#33251E', opacity: 0.6 }} dx={-10} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid rgba(51,37,30,0.1)', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(51,37,30,0.5)', marginBottom: '4px' }}
            />
            <Area type="monotone" dataKey="demand" stroke="#F07154" strokeWidth={2} fillOpacity={1} fill="url(#colorDemand)" />
            <Area type="monotone" dataKey="supply" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorSupply)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
