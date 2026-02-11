import Snoowrap from 'snoowrap';
import { logger } from '../../utils/logger.js';
import { CONSTANTS } from '../../config/constants.js';

let redditClient = null;

const initReddit = () => {
  if (!redditClient) {
    redditClient = new Snoowrap({
      userAgent: process.env.REDDIT_USER_AGENT,
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      username: '',
      password: '',
    });
  }
  return redditClient;
};

export const scrapeReddit = async (productName) => {
  logger.info(`Starting Reddit scrape for: ${productName}`);

  try {
    const reddit = initReddit();
    const allPosts = [];
    const allComments = [];

    for (const subreddit of CONSTANTS.REDDIT.SUBREDDITS) {
      try {
        const posts = await reddit
          .getSubreddit(subreddit)
          .search({
            query: productName,
            sort: 'relevance',
            time: 'all',
            limit: 5,
          });

        for (const post of posts) {
          allPosts.push({
            title: post.title,
            body: post.selftext,
            score: post.score,
            subreddit: post.subreddit.display_name,
            url: `https://reddit.com${post.permalink}`,
            created: new Date(post.created_utc * 1000).toISOString(),
          });

          try {
            const comments = await post.comments.fetchAll({ amount: CONSTANTS.REDDIT.MAX_COMMENTS_PER_POST });
            
            comments.forEach((comment) => {
              if (comment.body && comment.body.length > 20) {
                allComments.push({
                  body: comment.body,
                  score: comment.score,
                  subreddit: subreddit,
                });
              }
            });
          } catch (commentError) {
            logger.warn(`Failed to fetch comments for post in r/${subreddit}:`, commentError.message);
          }
        }
      } catch (subredditError) {
        logger.warn(`Failed to search r/${subreddit}:`, subredditError.message);
      }
    }

    logger.info(`Reddit scrape successful: ${allPosts.length} posts, ${allComments.length} comments`);

    return {
      success: true,
      data: {
        source: 'Reddit',
        posts: allPosts.slice(0, CONSTANTS.REDDIT.MAX_POSTS),
        comments: allComments,
        totalPosts: allPosts.length,
        totalComments: allComments.length,
      },
    };

  } catch (error) {
    logger.error('Reddit scraper error:', error);
    return { success: false, error: error.message };
  }
};
