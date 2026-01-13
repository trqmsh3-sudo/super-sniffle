import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductDossier } from '../hooks/useProductDossier';
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, ExternalLink, Share2, Bookmark } from 'lucide-react';
import { Badge, Button, Card } from '../components/ui';

const DossierPagePremium = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { dossier, loading, error } = useProductDossier(productId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Hooks MUST run on every render (even while loading) to avoid React hook order errors.
  const product = dossier?.product;

  const imageUrls = useMemo(() => {
    const urls = [];
    const pushUrl = (u) => {
      if (typeof u === 'string' && u.startsWith('http') && !urls.includes(u)) urls.push(u);
    };

    // Prefer multiple images when available (new schema)
    const imgs = Array.isArray(product?.images) ? product.images : [];
    for (const img of imgs) {
      if (typeof img === 'string') pushUrl(img);
      else pushUrl(img?.url);
    }

    // Backward compat
    pushUrl(product?.image_url);

    return urls;
  }, [product?.images, product?.image_url]);

  useEffect(() => {
    setActiveImageIndex(0);
    setImageError(false);
  }, [productId]);

  useEffect(() => {
    // Clamp index when image list changes
    if (activeImageIndex >= imageUrls.length) {
      setActiveImageIndex(0);
    }
    setImageError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrls.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-mint-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-mint-600 animate-spin"></div>
          </div>
          <p className="text-lg text-slate-600">Loading intelligence…</p>
        </div>
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
            <XCircle className="w-9 h-9 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-ink mb-2">Dossier Not Found</h2>
          <p className="text-slate-600 mb-6">{error || "This product hasn't been analyzed yet."}</p>
          <Button onClick={() => navigate('/search')} className="w-full">Back to Search</Button>
        </Card>
      </div>
    );
  }

  const { scores, analysis, meta } = dossier;
  const overallScore = scores?.overall || 0;
  const verdict =
    overallScore >= 80 ? { label: '✅ BUY', tone: 'mint' } :
    overallScore >= 60 ? { label: '⚠️ CONSIDER ALTERNATIVES', tone: 'warning' } :
    { label: '❌ DON’T BUY', tone: 'danger' };

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-mint-50 to-white" />
      <div className="absolute -z-10 -top-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-mint-200/35 blur-3xl" />
      <div className="absolute -z-10 -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <button
          onClick={() => navigate('/search')}
          className="mb-6 inline-flex items-center gap-2 text-slate-600 hover:text-mint-700 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Search</span>
        </button>

        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Product Image */}
          {imageUrls.length > 0 && (
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="rounded-2xl overflow-hidden border-2 border-border shadow-lg bg-surface">
                {!imageError ? (
                  <img
                    src={imageUrls[activeImageIndex]}
                    alt={product?.name || 'Product'}
                    className="w-full h-auto object-contain"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="p-10 text-center text-slate-500 text-sm">
                    Image unavailable
                  </div>
                )}
              </div>

              {imageUrls.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {imageUrls.map((u, i) => (
                    <button
                      key={`${u}-${i}`}
                      onClick={() => {
                        setActiveImageIndex(i);
                        setImageError(false);
                      }}
                      className={`h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden border ${i === activeImageIndex ? 'border-mint-500 ring-2 ring-mint-200' : 'border-border'} bg-white`}
                      title={`Image ${i + 1}`}
                      type="button"
                    >
                      <img
                        src={u}
                        alt={`Thumbnail ${i + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Hide broken thumbnails
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="flex-1">
            {product?.category ? <Badge variant="mint">{product.category}</Badge> : null}
            <h1 className="mt-4 text-4xl md:text-5xl font-black text-ink">{product?.name || 'Product'}</h1>

            {/* 🚨 LOW QUALITY WARNING */}
            {meta?.confidence && meta.confidence < 50 && (
              <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <div className="font-bold text-yellow-900">Limited Data Available</div>
                  <div className="text-sm text-yellow-700 mt-1">
                    This analysis has low confidence ({meta.confidence}%). We couldn't find enough verified reviews for this product. Consider searching for a more popular alternative.
                  </div>
                </div>
              </div>
            )}

            {/* THE VERDICT */}
            <Card className="mt-6 p-6 border-2">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">The verdict</div>
                  <div className="mt-1 text-2xl font-black text-ink">{verdict.label}</div>
                </div>
                <div className="text-sm text-slate-600">
                  Confidence: <span className="font-semibold text-ink">{meta?.confidence ?? '—'}%</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-mint-100 bg-mint-50 p-5">
                  <div className="font-black text-mint-900 mb-3">✅ BUY IF:</div>
                  <ul className="space-y-2 text-slate-700">
                    {(analysis?.best_for || []).slice(0, 6).map((it, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-mint-700 font-black">•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                    {(analysis?.best_for || []).length === 0 ? (
                      <li className="text-slate-500">Not enough data yet.</li>
                    ) : null}
                  </ul>
                </div>

                <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                  <div className="font-black text-red-700 mb-3">❌ DON’T BUY IF:</div>
                  <ul className="space-y-2 text-slate-700">
                    {(analysis?.not_for || []).slice(0, 6).map((it, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-red-500 font-black">•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                    {(analysis?.not_for || []).length === 0 ? (
                      <li className="text-slate-500">Not enough data yet.</li>
                    ) : null}
                  </ul>
                </div>
              </div>
            </Card>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="p-4">
                <div className="text-sm text-slate-500">Quality</div>
                <div className="text-2xl font-black text-ink">{scores?.quality || 0}%</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-slate-500">Reliability</div>
                <div className="text-2xl font-black text-ink">{scores?.reliability || 0}%</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-slate-500">Value</div>
                <div className="text-2xl font-black text-ink">{scores?.value || 0}%</div>
              </Card>
            </div>

            <div className="mt-6 text-sm text-slate-600 flex flex-wrap gap-2">
              <span>Confidence: <span className="font-semibold text-ink">{meta?.confidence ?? '—'}%</span></span>
              <span className="text-slate-400">•</span>
              <span>Updated: <span className="font-semibold text-ink">{meta?.last_updated ? new Date(meta.last_updated).toLocaleDateString('en-US') : 'recently'}</span></span>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <div className="font-black text-ink mb-3">Pros</div>
                <ul className="space-y-2 text-slate-700">
                  {(analysis?.pros || []).slice(0, 8).map((p, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-mint-700 font-black">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-6 bg-white">
                <div className="font-black text-ink mb-3">Cons</div>
                <ul className="space-y-2 text-slate-700">
                  {(analysis?.cons || []).slice(0, 8).map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-red-500 font-black">✕</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card className="mt-6 p-6">
              <div className="font-black text-ink mb-2">Summary</div>
              <p className="text-slate-700 leading-relaxed">{analysis?.summary || 'No summary yet.'}</p>
            </Card>

            <Card className="mt-6 p-6">
              <div className="font-black text-ink mb-2">Common issues</div>
              <ul className="space-y-2 text-slate-700">
                {(analysis?.common_failures || []).length ? (
                  (analysis?.common_failures || []).slice(0, 8).map((it, i) => (
                    <li key={i} className="flex gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <span>{it}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">No recurring issues found yet.</li>
                )}
              </ul>
            </Card>

            {/* DATA SOURCES / TRANSPARENCY */}
            <Card className="mt-6 p-6">
              <div className="font-black text-ink mb-2">📊 Data sources</div>
              <div className="text-slate-700 space-y-2">
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-slate-500">Total reviews analyzed:</span>
                  <span className="font-semibold text-ink">{meta?.total_reviews ?? '—'}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-slate-500">Confidence:</span>
                  <span className="font-semibold text-ink">{meta?.confidence ?? '—'}%</span>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-slate-500">Last updated:</span>
                  <span className="font-semibold text-ink">
                    {meta?.last_updated ? new Date(meta.last_updated).toLocaleString('en-US') : '—'}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  We’ll expand this section with per-source breakdown (Reddit/YouTube/Amazon/blogs) as soon as the collector exposes it.
                </div>
              </div>
            </Card>

            <div className="mt-6 flex justify-start">
              <Button variant="secondary" onClick={() => navigate('/search')}>
                Search Another Product →
              </Button>
            </div>
          </div>

          <div className="lg:w-80 w-full">
            <Card className="p-6 sticky top-24">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Overall score</div>
              <div className="mt-4 h-32 rounded-3xl bg-gradient-to-br from-mint-600 to-cyan-500 text-white flex items-center justify-center shadow-mint-soft">
                <div className="text-center">
                  <div className="text-6xl font-black">{overallScore}</div>
                  <div className="opacity-90 font-semibold">/ 100</div>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <Button variant="secondary" className="flex-1" leftIcon={<Share2 className="h-5 w-5" />}>
                  Share
                </Button>
                <Button variant="secondary" className="flex-1" leftIcon={<Bookmark className="h-5 w-5" />}>
                  Save
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DossierPagePremium;
