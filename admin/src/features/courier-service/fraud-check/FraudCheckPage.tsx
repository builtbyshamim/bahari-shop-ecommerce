import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MdOutlineSearch, MdWarning, MdCheckCircle, MdError, MdInfo } from 'react-icons/md';
import { useLazyCheckFraudQuery } from './fraudCheckApi';

interface FraudResult {
  provider: string;
  available: boolean;
  phone: string;
  data?: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    pendingOrders: number;
    fraudActivity: boolean;
    fraudLevel: string;
  };
  error?: string;
}

const FRAUD_LEVEL_CONFIG: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  Safe:    { bg: 'bg-green-50 border-green-200',  text: 'text-green-700',  icon: <MdCheckCircle size={20} className="text-green-500" /> },
  Low:     { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', icon: <MdInfo size={20} className="text-yellow-500" /> },
  Medium:  { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', icon: <MdWarning size={20} className="text-orange-500" /> },
  High:    { bg: 'bg-red-50 border-red-200',      text: 'text-red-700',    icon: <MdError size={20} className="text-red-500" /> },
  Unknown: { bg: 'bg-gray-50 border-gray-200',    text: 'text-gray-600',   icon: <MdInfo size={20} className="text-gray-400" /> },
};

const StatBox = ({ label, value, color = 'text-gray-800' }: { label: string; value: number; color?: string }) => (
  <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
  </div>
);

const ProviderCard = ({ result }: { result: FraudResult }) => {
  if (!result.available) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 opacity-60">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">{result.provider}</h3>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Not Configured</span>
        </div>
        <p className="text-sm text-gray-400">{result.error || 'API credentials not set up. Go to Courier Service Tokens to configure.'}</p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <MdError className="text-red-500" size={18} />
          <h3 className="font-semibold text-red-700">{result.provider}</h3>
        </div>
        <p className="text-sm text-red-600">{result.error}</p>
      </div>
    );
  }

  const d = result.data!;
  const level = d.fraudLevel || 'Unknown';
  const cfg = FRAUD_LEVEL_CONFIG[level] ?? FRAUD_LEVEL_CONFIG.Unknown;

  return (
    <div className={`rounded-xl shadow-sm p-5 border-2 ${cfg.bg}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">{result.provider}</h3>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${cfg.bg} ${cfg.text} border`}>
          {cfg.icon}
          {level}
        </div>
      </div>

      {/* Fraud activity banner */}
      {d.fraudActivity && (
        <div className="flex items-center gap-2 bg-red-100 border border-red-200 rounded-lg px-3 py-2 mb-4">
          <MdWarning className="text-red-500 shrink-0" size={18} />
          <p className="text-sm font-medium text-red-700">Fraud activity detected for this number</p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBox label="Total Orders" value={d.totalOrders} />
        <StatBox label="Completed" value={d.completedOrders} color="text-green-600" />
        <StatBox label="Cancelled" value={d.cancelledOrders} color="text-red-500" />
        <StatBox label="Pending" value={d.pendingOrders} color="text-yellow-600" />
      </div>

      {/* Cancel rate indicator */}
      {d.totalOrders > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Cancel Rate</span>
            <span className="font-medium">
              {Math.round((d.cancelledOrders / d.totalOrders) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${d.cancelledOrders / d.totalOrders > 0.4 ? 'bg-red-500' : d.cancelledOrders / d.totalOrders > 0.2 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(100, Math.round((d.cancelledOrders / d.totalOrders) * 100))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const FraudCheckPage = () => {
  const [searchParams] = useSearchParams();
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [submittedPhone, setSubmittedPhone] = useState('');
  const [checkFraud, { data, isFetching, error }] = useLazyCheckFraudQuery();

  // Auto-check when phone comes from URL (e.g. from order details)
  useEffect(() => {
    const urlPhone = searchParams.get('phone');
    if (urlPhone?.trim()) {
      setPhone(urlPhone.trim());
      setSubmittedPhone(urlPhone.trim());
      checkFraud(urlPhone.trim());
    }
  }, []);

  const results: FraudResult[] = data?.data || [];
  const hasAnyFraud = results.some((r) => r.data?.fraudActivity);
  const allSafe = results.length > 0 && results.every((r) => !r.data?.fraudActivity && !r.error);

  const handleCheck = () => {
    const cleaned = phone.trim().replace(/\s+/g, '');
    if (!cleaned) return;
    setSubmittedPhone(cleaned);
    checkFraud(cleaned);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Courier Fraud Check</h1>
        <p className="text-gray-500 mt-1">
          Verify a customer's phone number against Steadfast and RedX courier databases to detect fraudulent order history
        </p>
      </div>

      {/* Search form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone Number</label>
        <div className="flex gap-3">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            className="flex-1 px-3 py-2 border border-gray-200 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm hover:border-gray-300"
            placeholder="01XXXXXXXXX"
            maxLength={14}
          />
          <button
            onClick={handleCheck}
            disabled={isFetching || !phone.trim()}
            className="btn bg-primary-500 text-white px-5 py-2 rounded-lg hover:bg-primary-400 transition disabled:opacity-60 flex items-center gap-2 shrink-0"
          >
            <MdOutlineSearch size={18} />
            {isFetching ? 'Checking…' : 'Check'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Enter the Bangladeshi mobile number (01XXXXXXXXX format). Results are fetched live from courier APIs.
        </p>
      </div>

      {/* Error state */}
      {error && !isFetching && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4">
          <MdError size={20} />
          <span className="text-sm">{(error as any)?.data?.message || 'Failed to fetch fraud check results'}</span>
        </div>
      )}

      {/* Summary banner */}
      {results.length > 0 && !isFetching && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border mb-4 ${
          hasAnyFraud
            ? 'bg-red-50 border-red-200 text-red-700'
            : allSafe
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-gray-50 border-gray-200 text-gray-600'
        }`}>
          {hasAnyFraud ? <MdWarning size={22} /> : allSafe ? <MdCheckCircle size={22} /> : <MdInfo size={22} />}
          <div>
            <p className="font-semibold text-sm">
              {hasAnyFraud
                ? `Fraud activity detected for ${submittedPhone}`
                : allSafe
                ? `${submittedPhone} appears safe across checked couriers`
                : `Partial results for ${submittedPhone}`}
            </p>
            <p className="text-xs opacity-80 mt-0.5">
              {results.filter((r) => r.available && !r.error).length} of {results.length} courier services responded
            </p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isFetching && (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((j) => <div key={j} className="h-14 bg-gray-100 rounded-lg" />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!isFetching && results.length > 0 && (
        <div className="space-y-4">
          {results.map((r) => (
            <ProviderCard key={r.provider} result={r} />
          ))}
        </div>
      )}

      {/* How it works */}
      {results.length === 0 && !isFetching && !error && (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6">
          <h3 className="font-semibold text-gray-700 mb-3">How it works</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-start gap-2"><span className="text-primary-500 font-bold mt-0.5">1.</span> Enter the customer's phone number above</li>
            <li className="flex items-start gap-2"><span className="text-primary-500 font-bold mt-0.5">2.</span> We query Steadfast and RedX courier databases in real-time</li>
            <li className="flex items-start gap-2"><span className="text-primary-500 font-bold mt-0.5">3.</span> Results show order history and fraud level for each courier</li>
            <li className="flex items-start gap-2"><span className="text-primary-500 font-bold mt-0.5">4.</span> High cancel rate or fraud flag means higher risk for the order</li>
          </ul>
          <p className="text-xs text-gray-400 mt-4">
            Requires active Steadfast and/or RedX API tokens in <strong>Courier Service Tokens</strong> settings.
          </p>
        </div>
      )}
    </div>
  );
};

export default FraudCheckPage;
