import { useState, useEffect } from 'react';
import { X, ShieldCheck, Building, TrendingUp, Coins, FileText, CheckCircle2, BarChart3, DollarSign, Percent } from 'lucide-react';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PASSKEY = 'analytics2026';

const mockDeals = [
  { id: 'UW-8801', asset: 'Hudson Yards Class-A Office ($120M)', sponsor: 'Blackstone RE Partner', dscr: '1.42x', capRate: '6.2%', status: 'approved' },
  { id: 'UW-8802', asset: 'Austin Innovation Tech Campus ($85M)', sponsor: 'Cypress Point Capital', dscr: '1.28x', capRate: '5.8%', status: 'in-committee' },
  { id: 'UW-8803', asset: 'Miami Brickell Luxury Multi-Family ($64M)', sponsor: 'Starwood Debt Fund', dscr: '1.35x', capRate: '5.4%', status: 'approved' },
  { id: 'UW-8804', asset: 'Nashville Industrial Logistics Park ($42M)', sponsor: 'Prologis JV', dscr: '1.51x', capRate: '6.9%', status: 'funding-ready' },
];

const metrics = [
  { label: 'Underwritten Volume', value: '$311M', icon: DollarSign, color: 'text-emerald-400' },
  { label: 'Weighted Avg DSCR', value: '1.38x', icon: TrendingUp, color: 'text-amber-400' },
  { label: 'Cap Rate Spread', value: '+185 bps', icon: Percent, color: 'text-sky-400' },
  { label: 'Committee Deals', value: '14 Active', icon: Building, color: 'text-purple-400' },
];

export default function AdminPortalModal({ isOpen, onClose }: AdminPortalModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'covenants' | 'settings'>('overview');
  const [passkey, setPasskey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setAuthenticated(false);
      setPasskey('');
      setAuthError('');
      setActiveTab('overview');
    }
  }, [isOpen]);

  const handleAuth = () => {
    if (passkey === PASSKEY) {
      setAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid passkey. Use the 1-click auto-fill below.');
    }
  };

  if (!isOpen) return null;

  const statusColors: Record<string, string> = {
    'funding-ready': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    'approved': 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    'in-committee': 'text-sky-400 bg-sky-400/10 border-sky-400/30',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#090A0F] border border-emerald-500/25 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <Building className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Real Estate Analytics Hub OS</p>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Credit Risk & Underwriting Committee Gate</h2>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 hover:text-white transition-all cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {!authenticated ? (
            <div className="flex flex-col items-center justify-center p-10 space-y-6 min-h-[380px]">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <ShieldCheck className="h-8 w-8 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider mt-4">Investment Committee Access</h3>
                <p className="text-xs text-zinc-400 font-mono max-w-xs mx-auto">Commercial Debt & Equity Underwriting Gate. Enter committee passkey or use 1-click bypass demo.</p>
              </div>

              <div className="w-full max-w-sm space-y-3">
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                  placeholder="Enter committee passkey..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50 placeholder:text-zinc-700"
                />
                {authError && <p className="text-xs text-red-400 font-mono">{authError}</p>}
                <button onClick={handleAuth} className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-bold uppercase tracking-wider text-black hover:bg-emerald-400 transition-all cursor-pointer">
                  Unlock Underwriting Suite
                </button>
                <button
                  onClick={() => { setPasskey(PASSKEY); setAuthError(''); }}
                  className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/5 py-2.5 text-xs font-mono text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                >
                  [ 1-CLICK DEMO AUTO-FILL: analytics2026 ]
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div className="flex gap-1 bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                {([
                  { id: 'overview', label: 'Portfolio Health', icon: BarChart3 },
                  { id: 'deals', label: 'Underwritten Deals', icon: Building },
                  { id: 'covenants', label: 'Credit Covenants', icon: ShieldCheck },
                  { id: 'settings', label: 'System', icon: FileText },
                ] as const).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === id ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {metrics.map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
                        <Icon className={`h-4 w-4 ${color}`} />
                        <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
                    <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Active Credit Deals in Review</h4>
                    {mockDeals.slice(0, 3).map((d) => (
                      <div key={d.id} className="flex items-center justify-between py-2 border-b border-zinc-800/60 last:border-0">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{d.asset}</span>
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">DSCR {d.dscr}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{d.sponsor} · Exit Cap {d.capRate}</p>
                        </div>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${statusColors[d.status]}`}>{d.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'deals' && (
                <div className="space-y-2">
                  {mockDeals.map((d) => (
                    <div key={d.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-zinc-500">{d.id}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${statusColors[d.status]}`}>{d.status}</span>
                        </div>
                        <p className="text-sm font-bold text-white">{d.asset}</p>
                        <p className="text-xs text-zinc-400 font-mono">{d.sponsor} · DSCR: {d.dscr} · Cap Rate: {d.capRate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'covenants' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { rule: 'Minimum DSCR Hurdle', threshold: '1.25x (Senior Debt)', status: 'Strict' },
                    { rule: 'Maximum Loan-to-Value (LTV)', threshold: '65.0% As-Stabilized', status: 'Strict' },
                    { rule: 'Debt Yield Minimum', threshold: '9.00% Net Operating Income', status: 'Required' },
                    { rule: 'Interest Rate Stress Test', threshold: '+250 bps Base Rate Shift', status: 'Mandatory' },
                  ].map((c) => (
                    <div key={c.rule} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">{c.rule}</span>
                        <span className="text-[9px] font-mono text-emerald-400 uppercase bg-emerald-500/10 px-1 py-0.5 rounded">{c.status}</span>
                      </div>
                      <p className="text-xs text-zinc-300 font-mono">{c.threshold}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
                    <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Institutional Credentials</h4>
                    {[
                      { label: 'Platform Name', value: 'Real Estate Analytics Hub' },
                      { label: 'Committee Passkey', value: 'analytics2026' },
                      { label: 'Live Showcase', value: 'real-estate-analytics-hub-os.onrender.com' },
                      { label: 'Engine', value: 'CommercialFinanceEngine (DSCR + CapRate + SaaS)' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center py-2 border-b border-zinc-800/60 last:border-0">
                        <span className="text-xs text-zinc-500 font-mono uppercase">{label}</span>
                        <span className="text-xs text-zinc-200 font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-300 font-mono">
                    ✅ Ghost Factory™ Verified — Target #49 | Private Wealth & Real Estate Vault (8/35)
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
