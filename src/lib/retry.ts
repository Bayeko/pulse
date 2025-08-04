export async function withRetry<T extends { error?: any }>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 500
): Promise<T> {
  let attempt = 0;
  let result: T;
  while (true) {
    try {
      result = await fn();
      if (!result?.error) {
        return result;
      }
    } catch (error) {
      result = { error } as T;
    }

    attempt++;
    console.error(`Supabase call failed (attempt ${attempt}):`, result.error);
    if (attempt > retries) {
      return result;
    }
    await new Promise((resolve) =>
      setTimeout(resolve, delayMs * Math.pow(2, attempt - 1))
    );
  }
}
