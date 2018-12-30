const sleeper = timeout => new Promise(resolve => setTimeout(resolve, timeout))

module.exports = function avoidReplicationLag (sleep = sleeper) {
  let shouldSleep = true

  return async (options) => {
    // Only GET requests are affected by replication lag
    if (shouldSleep && options.method === 'GET') {
      await sleep(1000)
    }
    shouldSleep = false
  }
}
