export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.warn('Analytics event failed:', error);
  }
}
