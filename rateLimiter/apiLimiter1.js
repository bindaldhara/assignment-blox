class ApiRateLimiter {
  constructor(maxCalls, timeWindow) {
    this.maxCalls = maxCalls; // Max API calls allowed
    this.timeWindow = timeWindow; // Time window in milliseconds
    this.callQueue = []; // Queue for API calls
    this.currentCalls = 0; // Current call count
    this.isPenalized = false; // Flag for penalty
  }

  async callApi(input) {
    return new Promise((resolve, reject) => {
      // Add to the call queue
      this.callQueue.push({ input, resolve, reject });

      // Process the queue if not already processing
      if (this.callQueue.length === 1) {
        this.processQueue();
      }
    });
  }

  async processQueue() {
    while (this.callQueue.length > 0) {
      // Check if we are in a penalty period
      if (this.isPenalized) {
        console.log("In penalty period. Waiting 1 minute...");
        await this.delay(60 * 1000); // Wait for penalty
        this.isPenalized = false; // Reset penalty
      }

      // Check if we can make API calls
      if (this.currentCalls < this.maxCalls) {
        const { input, resolve, reject } = this.callQueue[0];
        try {
          const result = await this.call_me(input);
          resolve(result);
          this.callQueue.shift(); // Remove processed call
          this.currentCalls++;
        } catch (error) {
          reject(error);
        }

        // Wait for a short period before making the next call
        await this.delay(4000); // Delay for 4 seconds (adjust if necessary)
      } else {
        console.log("Rate limit exceeded. Waiting for 1 minute...");
        this.isPenalized = true; // Set penalty flag
        await this.delay(60 * 1000); // Wait for 1 minute
        this.currentCalls = 0; // Reset call count
      }
    }
  }

  // Utility function to delay execution
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Mock API call for demonstration (replace with actual call)
  async call_me(input) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`API called with input: ${input}`);
        resolve(`Response for ${input}`);
      }, 100); // Simulate API response time
    });
  }
}

(async () => {
  const apiLimiter = new ApiRateLimiter(15, 60000); // 15 calls per minute

  // Simulate multiple API calls
  const calls = [];
  for (let i = 1; i <= 30; i++) {
    calls.push(apiLimiter.callApi(`Request ${i}`));
  }

  const results = await Promise.all(calls);
  console.log("All results:", results);
})();
