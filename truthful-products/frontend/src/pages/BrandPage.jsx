import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2, Globe, MapPin, Calendar, Star, TrendingUp,
  ChevronRight, ExternalLink, BarChart3, Package, Award,
  AlertTriangle, Search
} from 'lucide-react';
import { Badge, Button, Card, Skeleton } from '../components/ui';

// Smart API URL detection (shared pattern)
const getAPIUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const hostname = window.location.hostname;
  if (hostname === 'www.clearpickai.com' || hostname === 'clearpickai.com' || hostname.includes('vercel.app')) {
    return 'https://10w0d94b94.onrender.com/api';
  }
  return 'http://localhost:3000/api';
};
const API_URL = getAPIUrl();

// Score color helper
const scoreColor = (score) => {
  if (score == null) return 'text-slate-400';
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-500';
};

const scoreBg = (score) => {
  if (score == null) return 'bg-slate-100 border-slate-200';
  if (score >= 80) return 'bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
};

const scoreGradient = (score) => {
  if (score == null) return 'from-slate-400 to-slate-500';
  if (score >= 80) return 'from-emerald-500 to-teal-500';
  if (score >= 60) return 'from-amber-500 to-orange-500';
  return 'from-red-500 to-rose-500';
};

// Product Card for brand page
const BrandProductCard = ({ product, onClick }) => (
  <Card
    className="p-4 cursor-pointer hover:shadow-mint-soft-lg hover:-translate-y-0.5 transition-all duration-200 group"
    onClick={onClick}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="font-bold text-ink truncate group-hover:text-mint-700 transition-colors">
          {product.name}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="neutral">{product.category || 'general'}</Badge>
          {product.total_reviews > 0 && (
            <span className="text-xs text-slate-400">{product.total_reviews} reviews</span>
          )}
        </div>
      </div>
      {product.overall_score != null && (
        <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${scoreGradient(product.overall_score)} text-white flex items-center justify-center font-black text-sm shadow-sm`}>
          {product.overall_score}
        </div>
      )}
    </div>
    {product.summary && (
      <p className="mt-3 text-sm text-slate-600 line-clamp-2">{product.summary}</p>
    )}
    <div className="mt-3 text-xs font-semibold text-mint-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
      View dossier <ChevronRight className="h-3 w-3" />
    </div>
  </Card>
);

// Stat card
const StatCard = ({ icon: Icon, label, value, color = 'mint' }) => {
  const colors = {
    mint: 'bg-mint-50 border-mint-200 text-mint-700',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.mint}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <div className="text-2xl font-black">{value ?? '—'}</div>
    </div>
  );
};

// Category section
const CategorySection = ({ category, navigate }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      <Package className="h-4 w-4 text-slate-400" />
      <h3 className="font-bold text-ink capitalize">{category.name}</h3>
      <Badge variant="neutral">{category.count}</Badge>
      {category.averageScore != null && (
        <span className={`text-sm font-semibold ${scoreColor(category.averageScore)}`}>
          Avg: {category.averageScore}/100
        </span>
      )}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {category.products.map((p) => (
        <BrandProductCard
          key={p.id}
          product={p}
          onClick={() => navigate(`/product/${p.id}`)}
        />
      ))}
    </div>
  </div>
);

// Loading skeleton
const BrandSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-2xl" />
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-24 rounded-xl" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  </div>
);

const BrandPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!name) return;
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/brands/${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setData(d);
        } else {
          setError(d.error || 'Failed to load brand profile');
        }
      })
      .catch((err) => setError(err.message || 'Network error'))
      .finally(() => setLoading(false));
  }, [name]);

  const brand = data?.brand;
  const stats = data?.stats;

  // Satisfaction tier
  const satisfactionTier = useMemo(() => {
    if (!stats?.satisfactionRate) return null;
    if (stats.satisfactionRate >= 80) return { label: 'Excellent', color: 'emerald', icon: Award };
    if (stats.satisfactionRate >= 60) return { label: 'Good', color: 'amber', icon: TrendingUp };
    return { label: 'Mixed', color: 'red', icon: AlertTriangle };
  }, [stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <BrandSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Card className="p-10 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-ink mb-2">Brand Not Found</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/')} leftIcon={<Search className="h-4 w-4" />}>
            Back to Search
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-mint-50/30 to-white" />
      <div className="absolute -z-10 -top-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-mint-200/20 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Back nav */}
        <button
          onClick={() => navigate('/')}
          className="text-sm font-semibold text-slate-500 hover:text-mint-700 transition-colors mb-6 block"
        >
          ← Back to search
        </button>

        {/* Brand Header */}
        <div className="flex items-start gap-5 mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-mint-600 to-cyan-500 flex items-center justify-center shadow-mint-soft shrink-0">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-black text-ink">
              {brand?.displayName || name}
            </h1>
            <p className="mt-2 text-slate-600 max-w-2xl">{brand?.description}</p>

            {/* Meta info pills */}
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
              {brand?.founded && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Founded {brand.founded}
                </span>
              )}
              {brand?.headquarters && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {brand.headquarters}
                </span>
              )}
              {brand?.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-mint-700 hover:text-mint-900 transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" /> {brand.website.replace(/^https?:\/\/(www\.)?/, '')}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Sectors */}
            {brand?.sectors?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {brand.sectors.map((s) => (
                  <Badge key={s} variant="mint">{s}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Package} label="Products Analyzed" value={stats?.productsAnalyzed || 0} color="mint" />
          <StatCard icon={Star} label="Average Score" value={stats?.averageScore ? `${stats.averageScore}/100` : '—'} color="cyan" />
          <StatCard
            icon={satisfactionTier?.icon || TrendingUp}
            label="Satisfaction"
            value={stats?.satisfactionRate ? `${stats.satisfactionRate}%` : '—'}
            color={satisfactionTier?.color || 'amber'}
          />
          <StatCard icon={BarChart3} label="Total Reviews" value={stats?.totalReviews?.toLocaleString() || '0'} color="emerald" />
        </div>

        {/* Known For */}
        {brand?.knownFor?.length > 0 && (
          <Card className="p-5 mb-8">
            <h2 className="font-black text-ink flex items-center gap-2 mb-3">
              <Award className="h-5 w-5 text-mint-600" />
              Known For
            </h2>
            <div className="flex flex-wrap gap-2">
              {brand.knownFor.map((item, i) => (
                <span key={i} className="text-sm bg-mint-50 text-mint-800 border border-mint-100 rounded-full px-3 py-1 font-medium">
                  {item}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Score Breakdown */}
        {stats?.averageScore != null && (
          <Card className="p-5 mb-8">
            <h2 className="font-black text-ink mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-600" />
              Score Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Quality', value: stats.averageQuality, icon: '🏗️' },
                { label: 'Value for Money', value: stats.averageValue, icon: '💰' },
                { label: 'Reliability', value: stats.averageReliability, icon: '🔧' },
              ].map(({ label, value, icon }) => (
                <div key={label} className={`rounded-xl border p-4 ${scoreBg(value)}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600">{icon} {label}</span>
                    <span className={`text-xl font-black ${scoreColor(value)}`}>{value ?? '—'}</span>
                  </div>
                  {value != null && (
                    <div className="mt-2 h-2 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${scoreGradient(value)} transition-all duration-500`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Top Products */}
        {data?.topProducts?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-black text-ink mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Top Rated Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {data.topProducts.map((p) => (
                <BrandProductCard
                  key={p.id}
                  product={p}
                  onClick={() => navigate(`/product/${p.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Products by Category */}
        {data?.categories?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-black text-ink mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-slate-500" />
              Products by Category
            </h2>
            {data.categories.map((cat) => (
              <CategorySection key={cat.name} category={cat} navigate={navigate} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {stats?.productsAnalyzed === 0 && (
          <Card className="p-10 text-center">
            <div className="h-16 w-16 rounded-2xl bg-mint-100 border border-mint-200 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-mint-600" />
            </div>
            <h3 className="text-xl font-black text-ink mb-2">
              No products analyzed yet for {brand?.displayName || name}
            </h3>
            <p className="text-slate-600 max-w-md mx-auto mb-6">
              Search for a specific {brand?.displayName || name} product to build an intelligence report. 
              For example: "{brand?.displayName || name} + model name".
            </p>
            <Button onClick={() => navigate('/')} leftIcon={<Search className="h-4 w-4" />}>
              Search Products
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BrandPage;
