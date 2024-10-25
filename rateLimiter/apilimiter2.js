class ApiRateLimiter {
  constructor(maxCalls, timeWindow) {
    this.maxCalls = maxCalls; // Max API calls allowed
    this.timeWindow = timeWindow; // Time window in milliseconds
    this.callQueue = []; // Queue for API calls
    this.currentCalls = 0; // Current call count
    this.isPenalized = false; // Flag for penalty
    this.lastResetTime = Date.now(); // Track last reset time
  }

  async callApi(input) {
    return new Promise((resolve, reject) => {
      // Add to the call queue
      this.callQueue.push({ input, resolve, reject });
      console.log(
        `Added to queue: ${input}. Queue length: ${this.callQueue.length}`
      );

      // Process the queue if not already processing
      if (this.callQueue.length === 1) {
        this.processQueue();
      }
    });
  }

  async processQueue() {
    while (this.callQueue.length > 0) {
      // Reset the call count if the time window has passed
      if (Date.now() - this.lastResetTime >= this.timeWindow) {
        console.log("Time window reset. Current calls reset to 0.");
        this.currentCalls = 0; // Reset call count
        this.lastResetTime = Date.now(); // Update last reset time
      }

      // Check if we can make API calls
      if (this.currentCalls < this.maxCalls) {
        const { input, resolve, reject } = this.callQueue[0];
        console.log(
          `Processing API call: ${input}. Current calls: ${this.currentCalls}`
        );
        try {
          const result = await this.call_me(input);
          resolve(result);
          this.callQueue.shift(); // Remove processed call
          this.currentCalls++;

          console.log(
            `API call successful for: ${input}. Total calls made: ${this.currentCalls}`
          );

          // Introduce delay between calls to control the rate
          const delayTime = this.timeWindow / this.maxCalls;
          console.log(
            `Waiting for ${delayTime} milliseconds before the next API call.`
          );
          await this.delay(delayTime); // Spread out calls evenly
        } catch (error) {
          reject(error);
        }
      } else {
        console.log("Rate limit exceeded. Waiting for time window to reset...");
        await this.delay(this.timeWindow); // Wait for the current time window to reset
        console.log("You can now make new API calls.");
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
  for (let i = 1; i <= 20; i++) {
    calls.push(apiLimiter.callApi(`Request ${i}`));
  }

  const results = await Promise.all(calls);
  console.log("All results:", results);
})();

