/**
 * Quality Monitor - מערכת ניטור איכות תוכן
 * זיהוי אוטומטי של תשובות גנריות / fallback
 */
class QualityMonitor {
  /**
   * בדיקה אם תיק מוצר הוא generic fallback (לא אמיתי)
   */
  static isDossierGeneric(dossierData) {
    const issues = [];

    // 1. בדיקת confidence score
    if (dossierData.confidence && dossierData.confidence < 50) {
      issues.push({
        severity: 'warning',
        type: 'low_confidence',
        message: `Confidence score is only ${dossierData.confidence}%`,
        threshold: 50,
      });
    }

    // 2. בדיקת fallback phrases
    const fallbackPhrases = [
      'limited data available',
      'limited verified review data',
      'not enough verified review signals',
      'early analysis',
      'widely available',
      'strong brand presence',
      'plenty of user discussion online',
      'general users seeking popular products',
      'those needing detailed verified reviews',
    ];

    const allText = [
      dossierData.summary,
      ...(dossierData.pros || []),
      ...(dossierData.cons || []),
      ...(dossierData.common_issues || []),
      ...(dossierData.best_for || []),
      ...(dossierData.not_for || []),
    ].join(' ').toLowerCase();

    const foundPhrases = fallbackPhrases.filter((phrase) =>
      allText.includes(phrase.toLowerCase())
    );

    if (foundPhrases.length > 2) {
      issues.push({
        severity: 'critical',
        type: 'generic_content',
        message: `Found ${foundPhrases.length} generic fallback phrases`,
        phrases: foundPhrases,
      });
    }

    // 3. בדיקת pros/cons כמות
    const prosCount = (dossierData.pros || []).length;
    const consCount = (dossierData.cons || []).length;

    if (prosCount < 3) {
      issues.push({
        severity: 'warning',
        type: 'insufficient_pros',
        message: `Only ${prosCount} pros (expected 3+)`,
      });
    }

    if (consCount < 2) {
      issues.push({
        severity: 'warning',
        type: 'insufficient_cons',
        message: `Only ${consCount} cons (expected 2+)`,
      });
    }

    // 4. בדיקה אם common_issues הוא רק "Limited data"
    const commonIssues = dossierData.common_issues || [];
    if (
      commonIssues.length === 1 &&
      commonIssues[0].toLowerCase().includes('limited data')
    ) {
      issues.push({
        severity: 'critical',
        type: 'no_real_issues',
        message: 'Common issues is just "Limited data available" (fallback)',
      });
    }

    // 5. בדיקת תבניות מתקדמות (patterns, predictions)
    if (!dossierData.patterns || Object.keys(dossierData.patterns).length === 0) {
      issues.push({
        severity: 'info',
        type: 'no_patterns',
        message: 'No advanced pattern analysis available',
      });
    }

    if (!dossierData.predictions || Object.keys(dossierData.predictions).length === 0) {
      issues.push({
        severity: 'info',
        type: 'no_predictions',
        message: 'No predictive insights available',
      });
    }

    return {
      isGeneric: issues.filter((i) => i.severity === 'critical').length > 0,
      isLowQuality: issues.length > 3,
      issues,
      qualityScore: this.calculateQualityScore(issues),
    };
  }

  /**
   * חישוב ציון איכות (0-100)
   */
  static calculateQualityScore(issues) {
    let score = 100;

    for (const issue of issues) {
      if (issue.severity === 'critical') score -= 30;
      else if (issue.severity === 'warning') score -= 10;
      else if (issue.severity === 'info') score -= 5;
    }

    return Math.max(0, score);
  }

  /**
   * המלצה אם צריך rebuild
   */
  static shouldRebuild(qualityCheck) {
    return qualityCheck.isGeneric || qualityCheck.qualityScore < 40;
  }

  /**
   * הוספת warning למשתמש
   */
  static getUserWarning(qualityCheck) {
    if (qualityCheck.isGeneric) {
      return {
        type: 'low_data',
        message: 'Limited data available for this product. Analysis may be generic.',
        action: 'Try searching for a more popular product or wait for more reviews.',
      };
    }

    if (qualityCheck.qualityScore < 60) {
      return {
        type: 'low_quality',
        message: 'Analysis quality is lower than usual.',
        action: 'Consider rebuilding this dossier later when more data is available.',
      };
    }

    return null;
  }

  /**
   * לוג איכות (למעקב)
   */
  static logQualityCheck(productName, qualityCheck) {
    const emoji = qualityCheck.isGeneric
      ? '🚨'
      : qualityCheck.qualityScore < 60
      ? '⚠️'
      : '✅';

    console.log(
      `${emoji} Quality Check: ${productName} (score: ${qualityCheck.qualityScore}/100)`
    );

    if (qualityCheck.issues.length > 0) {
      console.log('   Issues found:');
      for (const issue of qualityCheck.issues) {
        console.log(`   - [${issue.severity.toUpperCase()}] ${issue.message}`);
      }
    }

    if (this.shouldRebuild(qualityCheck)) {
      console.log('   💡 Recommendation: Consider rebuilding this dossier with better AI prompt');
    }
  }
}

module.exports = QualityMonitor;
