class TokenBucket {
  constructor(maxTokens, refillRate) {
    this.maxTokens = maxTokens; // Max tokens in the bucket
    this.tokens = maxTokens; // Current tokens
    this.refillRate = refillRate; // Rate at which tokens are refilled (tokens per second)
    this.lastRefillTimestamp = Date.now(); // Last refill timestamp
  }

  // Method to add tokens to the bucket
  refill() {
    const now = Date.now();
    const elapsedTime = (now - this.lastRefillTimestamp) / 1000; // Convert to seconds
    const tokensToAdd = Math.floor(elapsedTime * this.refillRate);

    // Update the number of tokens in the bucket
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.tokens + tokensToAdd, this.maxTokens);
      this.lastRefillTimestamp = now; // Update last refill time
      console.log(`Refilled ${tokensToAdd} tokens. Current tokens: ${this.tokens}`);
    }
  }

  // Method to request a token
  requestToken() {
    this.refill(); // Refill tokens before processing the request

    if (this.tokens > 0) {
      this.tokens--; // Use a token
      console.log(`Token granted. Remaining tokens: ${this.tokens}`);
      return true; // Token granted
    } else {
      console.log("No tokens available. Rate limit exceeded.");
      return false; // No tokens available
    }
  }
}

class ApiRateLimiter {
  constructor(maxCalls, timeWindow) {
    this.tokenBucket = new TokenBucket(maxCalls, maxCalls / (timeWindow / 1000)); // Create a token bucket
  }

  async callApi(input) {
    return new Promise((resolve, reject) => {
      if (this.tokenBucket.requestToken()) {
        // If token is available, process the API call
        console.log(`Processing API call with input: "${input}"`);
        this.call_me(input)
          .then((result) => {
            console.log(`Successfully processed API call with input: "${input}"`);
            resolve(result);
          })
          .catch((error) => {
            console.error(`Error processing API call with input: "${input}": ${error.message}`);
            reject(error);
          });
      } else {
        console.log("Rate limit exceeded. Please try again later.");
        reject(new Error("Rate limit exceeded."));
      }
    });
  }

  async call_me(input) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`API called with input: ${input}`);
        resolve(`Response for ${input}`);
      }, 100); // Simulate API response time
    });
  }
}

// Example usage
(async () => {
  const apiLimiter = new ApiRateLimiter(15, 60000); // 15 calls per minute

  // Simulate multiple API calls
  const calls = [];
  for (let i = 1; i <= 20; i++) {
    calls.push(apiLimiter.callApi(`Request ${i}`));
  }

  try {
    const results = await Promise.all(calls);
    console.log("All results:", results);
  } catch (error) {
    console.error("Error in processing API calls:", error.message);
  }
})();
//3. Use Token Bucket Algorithm