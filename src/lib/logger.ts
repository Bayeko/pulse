const isProd = import.meta.env.PROD;

type LogArgs = unknown[];

const sanitize = (arg: unknown): unknown => {
  if (typeof arg === 'string') {
    // basic email pattern replacement
    return arg.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[redacted-email]');
  }
  return arg;
};

const sendToRemote = (level: 'info' | 'error', args: LogArgs) => {
  try {
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, args: args.map((a) => sanitize(a)) }),
    });
  } catch {
    // ignore logging errors in production
  }
};

const logger = {
  info: (...args: LogArgs) => {
    if (!isProd) {
      console.log(...args.map((a) => sanitize(a)));
    } else {
      sendToRemote('info', args);
    }
  },
  error: (...args: LogArgs) => {
    if (!isProd) {
      console.error(...args.map((a) => sanitize(a)));
    } else {
      sendToRemote('error', args);
    }
  },
};

export default logger;
