export interface EnergyCycleMetrics {
  /**
   * Current phase of the user's energy cycle as reported by the wearable.
   * e.g. "peak", "low", "recovery".
   */
  phase: string;
}

interface WearableAPI {
  requestPermission?: () => Promise<'granted' | 'denied'>;
  getEnergyCycle?: () => Promise<EnergyCycleMetrics>;
}

/**
 * Attempt to fetch energy cycle metrics from a connected wearable device.
 *
 * Returns `null` when the wearable API isn't available or the user hasn't
 * granted the necessary permissions.
 */
export async function fetchEnergyCycleMetrics(): Promise<EnergyCycleMetrics | null> {
  const nav = navigator as Navigator & { wearable?: WearableAPI };
  const wearable: WearableAPI | undefined = nav.wearable;

  if (!wearable?.requestPermission || !wearable?.getEnergyCycle) {
    return null;
  }

  try {
    const permission = await wearable.requestPermission();
    if (permission !== 'granted') {
      return null;
    }

    const metrics = await wearable.getEnergyCycle();
    return metrics ?? null;
  } catch (error) {
    console.error('Failed to fetch energy cycle metrics', error);
    return null;
  }
}
