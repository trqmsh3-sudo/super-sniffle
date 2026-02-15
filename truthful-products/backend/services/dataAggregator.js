/**
 * Data Aggregator Service
 * 
 * אוסף נתונים ממקורות שונים (Reddit, YouTube, Amazon בעתיד)
 * ומבצע ניתוח: sentiment, patterns, pros/cons
 */
class DataAggregator {
  constructor() {
    // מילון sentiment מורחב - מילים חיוביות ושליליות
    this.positiveWords = [
      // General positive
      'great', 'excellent', 'amazing', 'perfect', 'love', 'best', 'awesome',
      'fantastic', 'wonderful', 'superb', 'outstanding', 'incredible',
      'brilliant', 'impressed', 'stellar', 'phenomenal', 'magnificent',
      
      // Quality
      'solid', 'reliable', 'quality', 'premium', 'durable', 'sturdy',
      'well-made', 'high-quality', 'top-notch', 'professional', 'robust',
      
      // Value
      'worth', 'bargain', 'affordable', 'value', 'deal', 'steal',
      
      // Experience
      'recommend', 'happy', 'pleased', 'satisfied', 'delighted',
      'comfortable', 'easy', 'smooth', 'fast', 'powerful', 'responsive',
      
      // Audio-specific
      'clear', 'crisp', 'loud', 'bass', 'balanced', 'immersive',
      'rich', 'detailed', 'clean', 'punchy',
      
      // Performance
      'efficient', 'effective', 'consistent', 'stable', 'accurate',
      'precise', 'sharp', 'bright', 'vivid'
    ];
    
    this.negativeWords = [
      // General negative
      'bad', 'terrible', 'awful', 'poor', 'worst', 'hate', 'horrible',
      'disappointing', 'mediocre', 'subpar', 'inferior',
      
      // Quality issues
      'waste', 'useless', 'broken', 'defective', 'cheap', 'flimsy',
      'fragile', 'unreliable', 'faulty', 'shoddy', 'poorly-made',
      
      // Problems
      'issue', 'problem', 'fail', 'failed', 'failure', 'failing',
      'malfunction', 'died', 'stopped', 'broke', 'cracked',
      
      // Experience
      'uncomfortable', 'difficult', 'hard', 'confusing', 'frustrating',
      'annoying', 'inconvenient',
      
      // Performance
      'slow', 'weak', 'laggy', 'buggy', 'glitchy', 'unstable',
      
      // Audio-specific
      'muffled', 'distorted', 'tinny', 'muddy', 'quiet', 'crackling',
      'buzzing', 'hissing', 'rattling',
      
      // Regret
      'regret', 'returned', 'refund', 'avoid', 'never', 'don\'t buy',
      'garbage', 'trash', 'junk'
    ];
    
    // מילים להתעלמות (stop words)
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his',
      'her', 'its', 'our', 'their', 'me', 'him', 'them', 'us'
    ]);
  }

  /**
   * ניתוח sentiment של טקסט בודד (with negation handling)
   */
  analyzeSentiment(text) {
    if (!text || typeof text !== 'string') return 0;
    
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    // Negation words that flip the sentiment of the next word
    const negators = new Set(['not', "don't", 'dont', "doesn't", 'doesnt', "isn't", 'isnt',
      "wasn't", 'wasnt', "aren't", 'arent', "won't", 'wont', "can't", 'cant',
      "wouldn't", 'wouldnt', "shouldn't", 'shouldnt', 'never', 'no', 'neither', 'nor', 'hardly', 'barely']);
    
    // Phrase-level sentiment (checked first)
    const positivePhrasesMap = [
      ['game changer', 2], ['worth every penny', 2], ['highly recommend', 2],
      ['must have', 1.5], ['must buy', 1.5], ['no complaints', 1.5],
      ['works perfectly', 1.5], ['exceeded expectations', 2], ['pleasant surprise', 1.5],
      ['well worth', 1.5], ['love it', 1.5], ['absolutely love', 2],
    ];
    
    const negativePhrasesMap = [
      ['waste of money', -2], ['total waste', -2], ['do not buy', -2], ["don't buy", -2],
      ['not worth', -1.5], ['fell apart', -1.5], ['stopped working', -1.5],
      ['complete garbage', -2], ['huge disappointment', -2], ['buyer beware', -1.5],
      ['does not work', -1.5], ["doesn't work", -1.5], ['broke after', -1.5],
      ['returned it', -1], ['asked for refund', -1.5],
    ];
    
    let score = 0;
    
    // 1) Phrase matching first
    for (const [phrase, val] of positivePhrasesMap) {
      if (lowerText.includes(phrase)) score += val;
    }
    for (const [phrase, val] of negativePhrasesMap) {
      if (lowerText.includes(phrase)) score += val; // val is already negative
    }
    
    // 2) Word-level with negation handling
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const prevWord = i > 0 ? words[i - 1] : '';
      const isNegated = negators.has(prevWord);
      
      if (this.positiveWords.includes(word)) {
        score += isNegated ? -0.8 : 1; // "not great" → negative
      }
      if (this.negativeWords.includes(word)) {
        score += isNegated ? 0.5 : -1; // "not bad" → slightly positive
      }
    }
    
    // נורמליזציה
    const normalized = Math.max(-1, Math.min(1, score / Math.sqrt(words.length)));
    return normalized;
  }

  /**
   * ניתוח sentiment של כל הביקורות
   */
  analyzeSentiments(reviews) {
    if (!reviews || reviews.length === 0) {
      return {
        overall: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        perReview: []
      };
    }
    
    const sentiments = reviews.map(review => {
      const text = review.title + ' ' + (review.content || '');
      const score = this.analyzeSentiment(text);
      
      return {
        reviewId: review.url,
        score,
        label: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral'
      };
    });
    
    const positive = sentiments.filter(s => s.label === 'positive').length;
    const neutral = sentiments.filter(s => s.label === 'neutral').length;
    const negative = sentiments.filter(s => s.label === 'negative').length;
    
    const overallScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
    
    return {
      overall: Math.round(overallScore * 100) / 100,
      positive,
      neutral,
      negative,
      percentPositive: Math.round((positive / sentiments.length) * 100),
      percentNegative: Math.round((negative / sentiments.length) * 100),
      perReview: sentiments
    };
  }

  /**
   * חילוץ n-grams (ביטויים חוזרים) - improved!
   */
  extractNGrams(text, n = 2) {
    // ניקוי טקסט מתווים מיוחדים
    const cleanedText = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // הסרת פיסוק
      .replace(/\s+/g, ' ')  // נורמליזציה של רווחים
      .trim();
    
    const words = cleanedText
      .split(/\s+/)
      .filter(w => {
        // סינון מילים:
        // 1. אורך > 2
        // 2. לא stop words
        // 3. לא מספרים בלבד
        // 4. לא תווים חוזרים (כמו "00", "aa")
        return w.length > 2 && 
               !this.stopWords.has(w) &&
               !/^\d+$/.test(w) &&  // לא מספרים בלבד
               !/^(.)\1+$/.test(w);  // לא תווים חוזרים
      });
    
    const ngrams = [];
    
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(' ');
      // סינון n-grams ריקים או קצרים מדי
      if (ngram.length > 5) {
        ngrams.push(ngram);
      }
    }
    
    return ngrams;
  }

  /**
   * זיהוי patterns (ביטויים חוזרים)
   */
  detectPatterns(reviews, minFrequency = 3) {
    if (!reviews || reviews.length === 0) return [];
    
    const allText = reviews.map(r => r.title + ' ' + (r.content || '')).join(' ');
    
    // חילוץ bigrams (2 מילים) ו-trigrams (3 מילים)
    const bigrams = this.extractNGrams(allText, 2);
    const trigrams = this.extractNGrams(allText, 3);
    
    // ספירת תפוצה
    const frequency = {};
    [...bigrams, ...trigrams].forEach(ngram => {
      frequency[ngram] = (frequency[ngram] || 0) + 1;
    });
    
    // סינון לפי תפוצה מינימלית
    const patterns = Object.entries(frequency)
      .filter(([ngram, count]) => count >= minFrequency)
      .sort((a, b) => b[1] - a[1])  // מיון לפי תפוצה
      .slice(0, 20)  // רק 20 הראשונים
      .map(([pattern, count]) => ({
        pattern,
        frequency: count,
        percentage: Math.round((count / reviews.length) * 100)
      }));
    
    return patterns;
  }

  /**
   * חילוץ pros (יתרונות) - improved!
   */
  extractPros(reviews, sentimentAnalysis) {
    if (!reviews || reviews.length === 0) return [];
    
    const positiveSentences = [];
    
    reviews.forEach((review, idx) => {
      const sentiment = sentimentAnalysis.perReview[idx];
      
      // אוסף משפטים מביקורות חיוביות או ניטראליות (לפעמים יש pros גם בביקורות מעורבות)
      if (sentiment.label === 'negative' && sentiment.score < -0.5) return;
      
      const text = review.title + ' ' + (review.content || '');
      
      // חיפוש משפטים עם מילות מפתח חיוביות
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
      
      sentences.forEach(sentence => {
        const sentenceScore = this.analyzeSentiment(sentence);
        const lowerSentence = sentence.toLowerCase();
        
        // תנאים לזיהוי pro:
        // 1. Sentiment חיובי (> 0.2)
        // 2. או מכיל מילים כמו "pros:", "love", "recommend", "best"
        const hasProsKeywords = lowerSentence.includes('pros:') || 
                                lowerSentence.includes('love') ||
                                lowerSentence.includes('recommend') ||
                                lowerSentence.includes('best thing') ||
                                lowerSentence.includes('favorite');
        
        if (sentenceScore > 0.2 || (hasProsKeywords && sentenceScore >= 0)) {
          positiveSentences.push({
            text: this.cleanSentence(sentence),
            score: sentenceScore,
            upvotes: review.score || 0,
            hasKeywords: hasProsKeywords
          });
        }
      });
    });
    
    // מיון לפי score + keywords + upvotes
    positiveSentences.sort((a, b) => {
      const scoreA = a.score + (a.hasKeywords ? 0.3 : 0) + (a.upvotes / 100);
      const scoreB = b.score + (b.hasKeywords ? 0.3 : 0) + (b.upvotes / 100);
      return scoreB - scoreA;
    });
    
    // de-duplication
    const uniquePros = [];
    positiveSentences.forEach(s => {
      const isDuplicate = uniquePros.some(existing => 
        this.similarity(existing.text, s.text) > 0.7
      );
      if (!isDuplicate && uniquePros.length < 10) {
        uniquePros.push(s);
      }
    });
    
    return uniquePros.map(p => p.text);
  }
  
  /**
   * ניקוי משפט (הסרת תווים מיותרים)
   */
  cleanSentence(sentence) {
    return sentence
      .trim()
      .replace(/^\W+/, '')  // הסרת תווים לא-אלפבתיים מהתחלה
      .replace(/\s+/g, ' ')  // נורמליזציה של רווחים
      .replace(/&amp;/g, '&')  // HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .slice(0, 200);  // הגבלת אורך
  }

  /**
   * חילוץ cons (חסרונות) - improved!
   */
  extractCons(reviews, sentimentAnalysis) {
    if (!reviews || reviews.length === 0) return [];
    
    const negativeSentences = [];
    
    reviews.forEach((review, idx) => {
      const sentiment = sentimentAnalysis.perReview[idx];
      
      // אוסף משפטים מביקורות שליליות או ניטראליות
      if (sentiment.label === 'positive' && sentiment.score > 0.5) return;
      
      const text = review.title + ' ' + (review.content || '');
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
      
      sentences.forEach(sentence => {
        const sentenceScore = this.analyzeSentiment(sentence);
        const lowerSentence = sentence.toLowerCase();
        
        // תנאים לזיהוי con:
        // 1. Sentiment שלילי (< -0.15)
        // 2. או מכיל מילים כמו "cons:", "issue", "problem", "unfortunately"
        const hasConsKeywords = lowerSentence.includes('cons:') || 
                                lowerSentence.includes('issue') ||
                                lowerSentence.includes('problem') ||
                                lowerSentence.includes('unfortunately') ||
                                lowerSentence.includes('downside') ||
                                lowerSentence.includes('disappointed');
        
        if (sentenceScore < -0.15 || (hasConsKeywords && sentenceScore <= 0.2)) {
          negativeSentences.push({
            text: this.cleanSentence(sentence),
            score: Math.abs(sentenceScore),
            upvotes: review.score || 0,
            hasKeywords: hasConsKeywords
          });
        }
      });
    });
    
    // מיון לפי score + keywords + upvotes
    negativeSentences.sort((a, b) => {
      const scoreA = a.score + (a.hasKeywords ? 0.3 : 0) + (a.upvotes / 100);
      const scoreB = b.score + (b.hasKeywords ? 0.3 : 0) + (b.upvotes / 100);
      return scoreB - scoreA;
    });
    
    // de-duplication
    const uniqueCons = [];
    negativeSentences.forEach(s => {
      const isDuplicate = uniqueCons.some(existing => 
        this.similarity(existing.text, s.text) > 0.7
      );
      if (!isDuplicate && uniqueCons.length < 10) {
        uniqueCons.push(s);
      }
    });
    
    return uniqueCons.map(c => c.text);
  }

  /**
   * חילוץ common issues (בעיות נפוצות)
   */
  extractCommonIssues(reviews) {
    if (!reviews || reviews.length === 0) return [];
    
    // מילות מפתח לזיהוי בעיות
    const issueKeywords = [
      'issue', 'problem', 'broken', 'defective', 'fail', 'failed',
      'stopped working', 'not working', 'defect', 'malfunction',
      'rattling', 'crackling', 'battery', 'warranty', 'replacement'
    ];
    
    const issues = [];
    
    reviews.forEach(review => {
      const text = (review.title + ' ' + (review.content || '')).toLowerCase();
      
      // חיפוש משפטים עם מילות מפתח של בעיות
      const sentences = text.split(/[.!?]+/);
      
      sentences.forEach(sentence => {
        const hasIssueKeyword = issueKeywords.some(keyword => sentence.includes(keyword));
        if (hasIssueKeyword && sentence.length > 30) {
          issues.push({
            text: sentence.trim(),
            upvotes: review.score || 0
          });
        }
      });
    });
    
    // מיון לפי upvotes (בעיות שיותר אנשים מדווחים עליהן)
    issues.sort((a, b) => b.upvotes - a.upvotes);
    
    // de-duplication
    const uniqueIssues = [];
    issues.forEach(issue => {
      const isDuplicate = uniqueIssues.some(existing => 
        this.similarity(existing.text, issue.text) > 0.6
      );
      if (!isDuplicate && uniqueIssues.length < 5) {
        uniqueIssues.push(issue);
      }
    });
    
    return uniqueIssues.map(i => i.text);
  }

  /**
   * חישוב similarity בין 2 strings (Jaccard similarity)
   */
  similarity(str1, str2) {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * אגרגציה מלאה - מקבל ביקורות, מחזיר ניתוח מלא
   */
  async aggregate(reviews, productName) {
    console.log(`\n📊 Data Aggregator: Analyzing ${reviews.length} reviews for "${productName}"`);
    
    if (reviews.length === 0) {
      return this.emptyFallback(productName);
    }

    // 0. Post-scrape relevance filter — drop posts that don't mention the product
    const nameLower = productName.toLowerCase();
    const nameWords = nameLower.split(/\s+/).filter(Boolean);
    const brand = nameWords[0] || '';
    
    const relevantReviews = reviews.filter(r => {
      const text = ((r.title || '') + ' ' + (r.content || '')).toLowerCase();
      // Must contain the full product name OR brand + majority of model words
      if (text.includes(nameLower)) return true;
      if (brand && text.includes(brand)) {
        const modelWords = nameWords.slice(1);
        if (modelWords.length === 0) return true;
        const matched = modelWords.filter(w => text.includes(w)).length;
        return matched >= Math.ceil(modelWords.length * 0.6);
      }
      return false;
    });

    console.log(`   🔍 Relevance filter: ${relevantReviews.length}/${reviews.length} posts are about "${productName}"`);
    
    const finalReviews = relevantReviews.length > 0 ? relevantReviews : reviews.slice(0, 3);
    
    // 1. Sentiment Analysis
    console.log('   ⚙️ Analyzing sentiment...');
    const sentimentAnalysis = this.analyzeSentiments(finalReviews);
    
    // 2. Pattern Detection
    console.log('   ⚙️ Detecting patterns...');
    const patterns = this.detectPatterns(finalReviews);
    
    // 3. Pros & Cons
    console.log('   ⚙️ Extracting pros and cons...');
    const pros = this.extractPros(finalReviews, sentimentAnalysis);
    const cons = this.extractCons(finalReviews, sentimentAnalysis);
    
    // 4. Common Issues
    console.log('   ⚙️ Extracting common issues...');
    const commonIssues = this.extractCommonIssues(finalReviews);
    
    // 5. Summary
    const summary = this.generateSummary(productName, sentimentAnalysis, finalReviews.length);
    
    console.log(`✅ Data Aggregator: Analysis complete!`);
    console.log(`   - Sentiment: ${sentimentAnalysis.percentPositive}% positive, ${sentimentAnalysis.percentNegative}% negative`);
    console.log(`   - Pros: ${pros.length} found`);
    console.log(`   - Cons: ${cons.length} found`);
    console.log(`   - Common Issues: ${commonIssues.length} found`);
    console.log(`   - Top patterns: ${patterns.slice(0, 3).map(p => p.pattern).join(', ')}`);
    
    return {
      productName,
      totalReviews: finalReviews.length,
      sources: {
        reddit: finalReviews.filter(r => r.source === 'reddit').length,
        youtube: finalReviews.filter(r => r.source === 'youtube').length,
        amazon: finalReviews.filter(r => r.source === 'amazon').length
      },
      sentiment: sentimentAnalysis,
      patterns,
      pros,
      cons,
      commonIssues,
      summary,
      confidence: this.calculateConfidence(finalReviews, sentimentAnalysis),
      rawReviews: finalReviews  // שמירת הביקורות המקוריות
    };
  }

  /**
   * יצירת summary
   */
  generateSummary(productName, sentimentAnalysis, reviewCount) {
    const posPercent = sentimentAnalysis.percentPositive;
    const negPercent = sentimentAnalysis.percentNegative;
    
    let sentiment;
    if (posPercent > 70) sentiment = 'highly praised';
    else if (posPercent > 50) sentiment = 'generally well-received';
    else if (posPercent > 30) sentiment = 'mixed reviews';
    else sentiment = 'generally criticized';
    
    return `${productName} is ${sentiment} based on ${reviewCount} real user reviews. ` +
           `${posPercent}% of users report positive experiences, while ${negPercent}% report issues.`;
  }

  /**
   * חישוב confidence score
   */
  calculateConfidence(reviews, sentimentAnalysis) {
    let score = 0;
    
    // מספר ביקורות (0-40 נקודות)
    score += Math.min(40, reviews.length * 2);
    
    // איכות ביקורות - upvotes ממוצע (0-30 נקודות)
    const avgUpvotes = reviews.reduce((sum, r) => sum + (r.score || 0), 0) / reviews.length;
    score += Math.min(30, avgUpvotes * 3);
    
    // consensus - ככל שיש יותר agreement (pos או neg), הconfidence גבוה יותר (0-30 נקודות)
    const maxPercent = Math.max(sentimentAnalysis.percentPositive, sentimentAnalysis.percentNegative);
    score += (maxPercent / 100) * 30;
    
    return Math.min(100, Math.round(score));
  }

  /**
   * Fallback אם אין ביקורות
   */
  emptyFallback(productName) {
    return {
      productName,
      totalReviews: 0,
      sources: { reddit: 0, youtube: 0, amazon: 0 },
      sentiment: {
        overall: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        percentPositive: 0,
        percentNegative: 0,
        perReview: []
      },
      patterns: [],
      pros: [],
      cons: [],
      commonIssues: [],
      summary: `No user reviews found for ${productName}. Analysis not available.`,
      confidence: 0,
      rawReviews: []
    };
  }
}

module.exports = new DataAggregator();
