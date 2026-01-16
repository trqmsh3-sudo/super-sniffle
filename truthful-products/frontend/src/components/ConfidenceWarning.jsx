import React from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

/**
 * ConfidenceWarning Component
 * Displays warning/info based on confidence score
 * Helps users understand data quality
 */
const ConfidenceWarning = ({ confidence, totalReviews }) => {
  if (!confidence && confidence !== 0) return null;
  
  const getWarningLevel = () => {
    if (confidence >= 70) return 'high';
    if (confidence >= 50) return 'medium';
    if (confidence >= 30) return 'low';
    return 'critical';
  };
  
  const level = getWarningLevel();
  
  const configs = {
    critical: {
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
      barColor: 'bg-red-500',
      title: '⚠️ נתונים מוגבלים מאוד',
      message: `מצאנו רק ${totalReviews || 'מעט מאוד'} ביקורות לגבי המוצר הזה. הניתוח אינו אמין מספיק. מומלץ לחפש מוצר פופולרי יותר או לחכות למידע נוסף.`
    },
    low: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-900',
      barColor: 'bg-yellow-500',
      title: '⚠️ נתונים מוגבלים',
      message: `מצאנו ${totalReviews || 'מעט'} ביקורות בלבד. הניתוח מבוסס על מידע מוגבל, קח בחשבון שיתכן שיש מוצרים דומים עם יותר מידע.`
    },
    medium: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900',
      barColor: 'bg-blue-500',
      title: 'ℹ️ בטחון בינוני',
      message: `הניתוח מבוסס על ${totalReviews || 'מספר סביר של'} ביקורות. יש בסיס טוב, אבל מומלץ לקרוא גם ביקורות ספציפיות ולהשוות עם מוצרים דומים.`
    },
    high: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-900',
      barColor: 'bg-green-500',
      title: '✅ רמת בטחון גבוהה',
      message: `מבוסס על ${totalReviews || 'מספר רב של'} ביקורות מאומתות. הנתונים אמינים ומקיפים!`
    }
  };
  
  const config = configs[level];
  const Icon = config.icon;
  
  // Don't show for high confidence (it's the default good case)
  if (level === 'high') return null;
  
  return (
    <div className={`rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-5 mb-6`}>
      <div className="flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className={`font-bold ${config.textColor} mb-1`}>
            {config.title}
          </div>
          
          <p className={`text-sm ${config.textColor} leading-relaxed mb-3`}>
            {config.message}
          </p>
          
          {/* Confidence bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/50 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full ${config.barColor} transition-all duration-500`}
                style={{ width: `${confidence}%` }}
              />
            </div>
            <span className={`font-bold ${config.textColor} min-w-[3.5rem] text-right text-sm`}>
              {confidence}%
            </span>
          </div>
          
          {/* Additional info */}
          {totalReviews && (
            <div className={`mt-2 text-xs ${config.textColor} opacity-75`}>
              מבוסס על {totalReviews} ביקורות שנאספו מהאינטרנט
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfidenceWarning;
