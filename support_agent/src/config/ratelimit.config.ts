import {
  rateLimit,
  RateLimitRequestHandler,
  Options,
} from "express-rate-limit";

const rateLimitOptions: Partial<Options> = {
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
};

const ratelimitConfig: RateLimitRequestHandler = rateLimit(rateLimitOptions);

export default ratelimitConfig;
