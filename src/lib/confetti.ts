let confettiPromise: Promise<(opts: import('canvas-confetti').Options) => void> | null = null;

export const getConfetti = async () => {
  if (!confettiPromise) {
    confettiPromise = import('canvas-confetti').then((m) => m.default);
  }
  return confettiPromise;
};
