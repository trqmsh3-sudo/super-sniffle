// תיק מוצר דינמי - מתעדכן אוטומטית עם נתונים חדשים
class ProductDossierEngine {
  constructor() {
    this.dossiers = new Map(); // Map של תיקים פעילים
    this.updateInterval = 60000; // דקה בין עדכונים
    this.learningRate = 0.1; // קצב למידה
  }

  // יצירת תיק מוצר חדש - ריק!
  createDossier(productId, initialData) {
    const dossier = {
      id: productId,
      name: initialData.name || productId,
      category: initialData.category || 'unknown',
      
      // נתונים דינמיים - ריקים בהתחלה
      reviews: [],
      prices: [],
      mentions: [],
      
      // ציונים - יתעדכנו כשיהיו נתונים
      scores: {
        overall: 0,
        reliability: 0,
        value: 0,
        performance: 0
      },
      
      // ניתוח - יתמלא אוטומטית
      pros: [],
      cons: [],
      common_failures: [],
      
      // המלצות - יתעדכנו לפי הנתונים
      best_for: [],
      not_for: [],
      
      // מטא-דאטה
      created_at: new Date(),
      last_updated: new Date(),
      total_reviews_analyzed: 0,
      learning_iterations: 0,
      status: 'building' // 'building', 'ready', 'updating'
    };

    this.dossiers.set(productId, dossier);
    this.startAutoUpdate(productId);
    
    return dossier;
  }

  // התחלת עדכונים אוטומטיים
  startAutoUpdate(productId) {
    const interval = setInterval(() => {
      this.updateDossier(productId);
    }, this.updateInterval);

    // שמירת ה-interval כדי לעצור אותו אם צריך
    this.dossiers.get(productId).updateInterval = interval;
  }

  // עדכון תיק מוצר
  async updateDossier(productId) {
    const dossier = this.dossiers.get(productId);
    if (!dossier) return;

    try {
      // 1. איסוף נתונים חדשים
      const newReviews = await this.fetchNewReviews(productId);
      const newPrices = await this.fetchNewPrices(productId);
      const newMentions = await this.fetchNewMentions(productId);

      // 2. עדכון התיק
      dossier.reviews.push(...newReviews);
      dossier.prices.push(...newPrices);
      dossier.mentions.push(...newMentions);

      // 3. למידה והתפתחות
      await this.learnFromNewData(dossier);

      // 4. חישוב ציונים מחדש
      this.calculateScores(dossier);

      // 5. עדכון המלצות
      this.updateRecommendations(dossier);

      // 6. מטא-דאטה
      dossier.last_updated = new Date();
      dossier.learning_iterations++;
      dossier.total_reviews_analyzed = dossier.reviews.length;

      console.log(`🔄 תיק ${dossier.name} עודכן (${dossier.learning_iterations} עדכונים)`);
      
    } catch (error) {
      console.error(`❌ שגיאה בעדכון תיק ${productId}:`, error);
    }
  }

  // למידה מנתונים חדשים
  async learnFromNewData(dossier) {
    const newReviews = dossier.reviews.slice(-50); // 50 הביקורות האחרונות
    
    // ניתוח סנטימנט חדש
    const sentimentAnalysis = await this.analyzeSentiment(newReviews);
    
    // זיהוי תבניות חדשות
    const newPatterns = this.identifyPatterns(newReviews);
    
    // התאמת המודל
    this.adjustModel(dossier, sentimentAnalysis, newPatterns);
  }

  // ניתוח סנטימנט
  async analyzeSentiment(reviews) {
    // סימולציה - בעתיד יהיה API call ל-LLM
    const positive = reviews.filter(r => r.rating >= 4).length;
    const negative = reviews.filter(r => r.rating <= 2).length;
    const neutral = reviews.length - positive - negative;

    return {
      positive: positive / reviews.length,
      negative: negative / reviews.length,
      neutral: neutral / reviews.length
    };
  }

  // זיהוי תבניות
  identifyPatterns(reviews) {
    const patterns = {
      pros: {},
      cons: {},
      failures: {}
    };

    reviews.forEach(review => {
      // חילוץ יתרונות
      review.pros?.forEach(pro => {
        patterns.pros[pro] = (patterns.pros[pro] || 0) + 1;
      });

      // חילוץ חסרונות
      review.cons?.forEach(con => {
        patterns.cons[con] = (patterns.cons[con] || 0) + 1;
      });

      // חילוץ תקלות
      if (review.failure) {
        patterns.failures[review.failure] = (patterns.failures[review.failure] || 0) + 1;
      }
    });

    return patterns;
  }

  // התאמת המודל
  adjustModel(dossier, sentiment, patterns) {
    // התאמת ציונים על פי סנטימנט חדש
    const sentimentScore = (sentiment.positive * 100) - (sentiment.negative * 50);
    dossier.scores.overall = this.smoothUpdate(dossier.scores.overall, sentimentScore);

    // התאמת יתרונות/חסרונות
    this.updateProsCons(dossier, patterns);

    // התאמת תקלות נפוצות
    this.updateFailures(dossier, patterns.failures);
  }

  // עדכון חלק של ציון (smooth update)
  smoothUpdate(currentValue, newValue) {
    return currentValue + (newValue - currentValue) * this.learningRate;
  }

  // עדכון יתרונות וחסרונות
  updateProsCons(dossier, patterns) {
    // הוספת יתרונות חדשים
    Object.entries(patterns.pros).forEach(([pro, count]) => {
      if (count > 3) { // רק אם מוזכר מספר פעמים
        const existing = dossier.pros.find(p => p.point === pro);
        if (existing) {
          existing.frequency += count;
        } else {
          dossier.pros.push({
            point: pro,
            frequency: count,
            top_quote: "..." // בעתיד יהיה ציטוט אמיתי
          });
        }
      }
    });

    // דומה עבור חסרונות
    Object.entries(patterns.cons).forEach(([con, count]) => {
      if (count > 3) {
        const existing = dossier.cons.find(c => c.point === con);
        if (existing) {
          existing.frequency += count;
        } else {
          dossier.cons.push({
            point: con,
            frequency: count,
            top_quote: "..."
          });
        }
      }
    });

    // מיון לפי תדירות
    dossier.pros.sort((a, b) => b.frequency - a.frequency);
    dossier.cons.sort((a, b) => b.frequency - a.frequency);
  }

  // חישוב ציונים
  calculateScores(dossier) {
    // ציון ביצועים - מבוסס על יתרונות חזקים
    const performancePros = dossier.pros.filter(p => 
      p.point.includes('עוצמה') || 
      p.point.includes('ביצועים') || 
      p.point.includes('יעילות')
    );
    dossier.scores.performance = Math.min(95, 60 + (performancePros.length * 5));

    // ציון אמינות - מבוסס על חסרונות ותקלות
    const reliabilityIssues = dossier.cons.filter(c => 
      c.point.includes('תקלה') || 
      c.point.includes('שבירה') || 
      c.point.includes('בעייה')
    );
    dossier.scores.reliability = Math.max(40, 90 - (reliabilityIssues.length * 8) - (dossier.common_failures.length * 5));

    // ציון תמורה - מבוסס על מחיר מול ביצועים
    const avgPrice = dossier.prices.reduce((sum, p) => sum + p.price, 0) / dossier.prices.length;
    const valueScore = dossier.scores.performance > 80 ? 85 : 70;
    dossier.scores.value = avgPrice < 300 ? Math.min(95, valueScore + 10) : valueScore;

    // ציון כללי - ממוצע משוקלל
    dossier.scores.overall = (
      dossier.scores.performance * 0.4 +
      dossier.scores.reliability * 0.35 +
      dossier.scores.value * 0.25
    );
  }

  // עדכון המלצות
  updateRecommendations(dossier) {
    // מומלץ ל...
    dossier.best_for = [];
    
    if (dossier.scores.performance > 85) {
      dossier.best_for.push('ביצועים מירביים');
    }
    
    if (dossier.scores.reliability > 80) {
      dossier.best_for.push('שימוש ארוך טווח');
    }
    
    if (dossier.scores.value > 85) {
      dossier.best_for.push('תקציב מוגבל');
    }

    // לא מומלץ ל...
    dossier.not_for = [];
    
    if (dossier.scores.performance < 60) {
      dossier.not_for.push('משימות דורשות');
    }
    
    if (dossier.scores.reliability < 60) {
      dossier.not_for.push('סביבה עסקית');
    }
    
    if (dossier.prices.some(p => p.price > 500)) {
      dossier.not_for.push('תקציב נמוך');
    }
  }

  // סימולציית איסוף נתונים חדשים - ריק כרגע!
  async fetchNewReviews(productId) {
    // עכשיו: מחזיר מערך ריק
    // בעתיד: יהיה כאן API call ל-Reddit, Amazon וכו'
    return [];
  }

  async fetchNewPrices(productId) {
    // עכשיו: מחזיר מערך ריק
    // בעתיד: יהיה כאן API call לאתרי קניות
    return [];
  }

  async fetchNewMentions(productId) {
    // עכשיו: מחזיר מערך ריק
    // בעתיד: יהיה כאן API call לפורומים ורשתות חברתיות
    return [];
  }

  // קבלת תיק מוצר
  getDossier(productId) {
    return this.dossiers.get(productId);
  }

  // עצירת עדכונים
  stopAutoUpdate(productId) {
    const dossier = this.dossiers.get(productId);
    if (dossier && dossier.updateInterval) {
      clearInterval(dossier.updateInterval);
    }
  }

  // מחיקת תיק
  deleteDossier(productId) {
    this.stopAutoUpdate(productId);
    this.dossiers.delete(productId);
  }
}

// יצוא המנוע
export default ProductDossierEngine;
