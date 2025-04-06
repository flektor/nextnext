export class SSEClient {
  source;
  listeners;

  constructor(url) {
    this.source = new EventSource(url);

    this.source.onmessage = (e) => {
      this.listeners['message']?.(JSON.parse(e.data));
    };

    this.source.onerror = (e) => {
      console.error('SSE error:', e);
    };
  }

  on(event, callback) {
    if (event === 'message') {
      this.listeners[event] = callback;
    } else {
      this.source.addEventListener(event, (e) => {
        callback(JSON.parse(e.data));
      });
    }
  }

  close() {
    this.source.close();
  }
}

