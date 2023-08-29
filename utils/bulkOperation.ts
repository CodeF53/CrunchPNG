// Distributes contents of input array into arrays of size N
// Large files tend to be in the same folder, so we use Round Robin distribution in an attempt to give each thread an equal amount of work
// Round robin item distribution results is ~1.6x faster
function chunkArray(array: unknown[], size: number): unknown[][] {
  const chunks: unknown[][] = Array.from({ length: size }, () => [])

  for (let i = 0; i < array.length; i++)
    chunks[i % size].push(array[i])

  return chunks
}

// Create a utility function to create a web worker and return a promise
function createWorkerPromise(array: unknown[], WorkerConstructor: new () => Worker, iterProgress: () => void): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const worker = new WorkerConstructor()
    worker.postMessage(array)

    worker.onmessage = (event: { data: { type: 'done' | 'update'; data: unknown } }) => {
      if (event.data.type === 'done') {
        resolve(event.data.data)
        worker.terminate()
      }
      else { iterProgress() }
    }

    worker.onerror = (error) => {
      reject(error)
      worker.terminate()
    }
  })
}

export default async function bulkOperation(array: unknown[], WorkerConstructor: new () => Worker, iterProgress: () => void): Promise<unknown[]> {
  // Split array into chunks
  const arrayChunks = chunkArray(array, Math.min(Math.max(navigator.hardwareConcurrency - 2, 1), array.length))

  // Create promises for each worker operation
  const workerPromises = arrayChunks.map(chunk => createWorkerPromise(chunk, WorkerConstructor, iterProgress))

  // Await results of worker promises
  const results = await Promise.all(workerPromises)

  // Combine worker results
  const combinedResults = results.reduce((acc: unknown[], result: unknown) => acc.concat(result), [])

  return combinedResults
}
