import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Headphones, CheckCircle, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react';
import { Button, Card } from '../components/ui';
import api from '../services/api';
import toast from 'react-hot-toast';

const HeadphonesWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  // Form state
  const [budget, setBudget] = useState(500);
  const [useCase, setUseCase] = useState('');
  const [features, setFeatures] = useState([]);
  const [brand, setBrand] = useState('לא משנה');
  
  const navigate = useNavigate();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Step 1: Budget
  const budgetOptions = [
    { label: 'עד 300₪', value: 300 },
    { label: '300-500₪', value: 400 },
    { label: '500-800₪', value: 650 },
    { label: '800-1200₪', value: 1000 },
    { label: '1200-2000₪', value: 1600 },
    { label: 'מעל 2000₪', value: 2000 }
  ];

  // Step 2: Use Case
  const useCaseOptions = [
    { label: 'ריצה', icon: '🏃', value: 'ריצה' },
    { label: 'עבודה', icon: '💼', value: 'עבודה' },
    { label: 'משחקים', icon: '🎮', value: 'משחקים' },
    { label: 'מוזיקה', icon: '🎵', value: 'מוזיקה' },
    { label: 'שיחות', icon: '📞', value: 'שיחות' }
  ];

  // Step 3: Features
  const featureOptions = [
    { label: 'ביטול רעשים', value: 'ביטול רעשים' },
    { label: 'אלחוטי', value: 'אלחוטי' },
    { label: 'עמיד למים', value: 'עמיד למים' },
    { label: 'סוללה ארוכה', value: 'סוללה ארוכה' }
  ];

  // Step 4: Brand
  const brandOptions = [
    'לא משנה',
    'Sony',
    'Bose',
    'JBL',
    'Samsung',
    'Apple',
    'אחר'
  ];

  const handleFeatureToggle = (feature) => {
    setFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleNext = () => {
    if (currentStep === 4) {
      handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const response = await api.post('/headphones/recommend', {
        budget,
        useCase,
        features,
        brand
      });

      if (response.data.success) {
        setResults(response.data);
        setCurrentStep(5); // Show results
        toast.success('המלצות נמצאו! 🎧');
      } else {
        throw new Error(response.data.error || 'Failed to get recommendations');
      }
    } catch (error) {
      console.error('Recommendation error:', error);
      toast.error(error.response?.data?.error || 'שגיאה בחיפוש המלצות. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-ink text-center">מה התקציב שלך?</h2>
            <p className="text-slate-600 text-center">בחר טווח מחיר</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {budgetOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setBudget(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    budget === option.value
                      ? 'border-mint-500 bg-mint-50 text-mint-700 font-semibold'
                      : 'border-border bg-surface hover:border-mint-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="mt-6 text-center">
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full h-2 bg-mint-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="mt-2 text-lg font-bold text-mint-700">{budget}₪</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-ink text-center">מה השימוש העיקרי?</h2>
            <p className="text-slate-600 text-center">בחר את השימוש העיקרי שלך</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {useCaseOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setUseCase(option.value)}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 ${
                    useCase === option.value
                      ? 'border-mint-500 bg-mint-50 text-mint-700 font-semibold'
                      : 'border-border bg-surface hover:border-mint-300'
                  }`}
                >
                  <span className="text-3xl">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-ink text-center">אילו תכונות חשובות לך?</h2>
            <p className="text-slate-600 text-center">בחר את כל התכונות שחשובות לך</p>
            <div className="space-y-3 mt-8">
              {featureOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFeatureToggle(option.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                    features.includes(option.value)
                      ? 'border-mint-500 bg-mint-50 text-mint-700 font-semibold'
                      : 'border-border bg-surface hover:border-mint-300'
                  }`}
                >
                  <span>{option.label}</span>
                  {features.includes(option.value) && (
                    <CheckCircle className="h-5 w-5 text-mint-600" />
                  )}
                </button>
              ))}
            </div>
            {features.length === 0 && (
              <p className="text-sm text-slate-500 text-center mt-4">
                (לא חובה - תוכל לדלג על זה)
              </p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-ink text-center">מותג מועדף?</h2>
            <p className="text-slate-600 text-center">יש לך מותג שאתה מעדיף?</p>
            <div className="space-y-3 mt-8">
              {brandOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setBrand(option)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                    brand === option
                      ? 'border-mint-500 bg-mint-50 text-mint-700 font-semibold'
                      : 'border-border bg-surface hover:border-mint-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return renderResults();

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!results || !results.recommendations || results.recommendations.length === 0) {
      return (
        <div className="text-center py-12">
          <Headphones className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-ink mb-2">לא נמצאו המלצות</h2>
          <p className="text-slate-600 mb-6">נסה לשנות את ההעדפות שלך</p>
          <Button onClick={() => setCurrentStep(1)}>חזור להתחלה</Button>
        </div>
      );
    }

    const recs = results.recommendations;
    const typeIcons = {
      best: { icon: TrendingUp, color: 'text-mint-600' },
      cheapest: { icon: DollarSign, color: 'text-cyan-600' },
      value: { icon: CheckCircle, color: 'text-purple-600' }
    };

    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-ink mb-2">המלצות מותאמות אישית! 🎧</h2>
          <p className="text-slate-600">מצאנו את האוזניות המושלמות עבורך</p>
        </div>

        <div className="grid gap-6">
          {recs.map((rec, index) => {
            const TypeIcon = typeIcons[rec.recommendationType]?.icon || CheckCircle;
            const iconColor = typeIcons[rec.recommendationType]?.color || 'text-mint-600';

            return (
              <Card key={index} className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image */}
                  {rec.imageUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={rec.imageUrl}
                        alt={rec.name}
                        className="w-full md:w-48 h-48 object-cover rounded-xl"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <TypeIcon className={`h-5 w-5 ${iconColor}`} />
                          <h3 className="text-xl font-bold text-ink">{rec.name}</h3>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">{rec.title}</p>
                        <p className="text-xs text-slate-400">{rec.subtitle}</p>
                      </div>
                      {rec.score && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-mint-600">{rec.score}</div>
                          <div className="text-xs text-slate-500">ציון</div>
                        </div>
                      )}
                    </div>

                    {/* Pros/Cons */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {rec.pros && rec.pros.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-green-700 mb-2">✅ יתרונות:</h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {rec.pros.slice(0, 3).map((pro, i) => (
                              <li key={i}>• {pro}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {rec.cons && rec.cons.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-red-700 mb-2">❌ חסרונות:</h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {rec.cons.slice(0, 3).map((con, i) => (
                              <li key={i}>• {con}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        {rec.cheapestPrice && rec.cheapestPrice !== 'N/A' && (
                          <div>
                            <p className="text-xs text-slate-500">המחיר הזול ביותר:</p>
                            <p className="text-2xl font-bold text-ink">{rec.cheapestPrice}</p>
                            {rec.cheapestSeller && (
                              <p className="text-xs text-mint-600 mt-1">ב-{rec.cheapestSeller}</p>
                            )}
                          </div>
                        )}
                      </div>
                      {rec.cheapestUrl && (
                        <a
                          href={rec.cheapestUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Button rightIcon={<ShoppingBag className="h-4 w-4" />}>
                            קנה עכשיו
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-4 justify-center">
          <Button variant="secondary" onClick={() => setCurrentStep(1)}>
            חיפוש חדש
          </Button>
          <Button onClick={() => navigate('/search')}>
            חפש מוצר אחר
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        {currentStep <= 4 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600">
                שלב {currentStep} מתוך {totalSteps}
              </span>
              <span className="text-sm font-medium text-mint-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-mint-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <Card className="p-8 md:p-12">
          {currentStep <= 4 && (
            <div className="flex justify-center mb-8">
              <div className="h-16 w-16 rounded-full bg-mint-100 flex items-center justify-center">
                <Headphones className="h-8 w-8 text-mint-600" />
              </div>
            </div>
          )}

          {renderStepContent()}

          {/* Navigation Buttons */}
          {currentStep <= 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
                leftIcon={<ArrowRight className="h-4 w-4" />}
              >
                חזור
              </Button>
              <Button
                onClick={handleNext}
                loading={loading}
                disabled={
                  (currentStep === 1 && !budget) ||
                  (currentStep === 2 && !useCase) ||
                  (currentStep === 4 && !brand) ||
                  loading
                }
                rightIcon={currentStep === 4 ? null : <ArrowLeft className="h-4 w-4" />}
              >
                {currentStep === 4 ? 'מצא המלצות' : 'המשך'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default HeadphonesWizard;
