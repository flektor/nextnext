type SSECallback = (data: any) => void;

export class SSEClient {
  private source: EventSource;
  private listeners: Record<string, SSECallback> = {};

  constructor(url: string) {
    this.source = new EventSource(url);

    this.source.onmessage = (e: MessageEvent) => {
      this.listeners['message']?.(JSON.parse(e.data));
    };

    this.source.onerror = (e: Event) => {
      console.error('SSE error:', e);
    };
  }

  on(event: string, callback: SSECallback) {
    if (event === 'message') {
      this.listeners[event] = callback;
    } else {
      this.source.addEventListener(event, (e: MessageEvent) => {
        callback(JSON.parse(e.data));
      });
    }
  }

  close() {
    this.source.close();
  }
}


