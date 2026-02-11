/**
 * Feature Flags Configuration
 * 
 * Control which features are enabled/disabled
 */

module.exports = {
  // Claude AI (requires API key - currently using Gemini only)
  CLAUDE_AI: false,

  // Redis caching (requires Redis server)
  REDIS_CACHE: false,
};
