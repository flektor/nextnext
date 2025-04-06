import { IncomingMessage, ServerResponse } from 'http';

export class SSEServer {
  private clients: Set<ServerResponse> = new Set();

  // Handle new client connection
  handler(req: IncomingMessage, res: ServerResponse) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    res.write('\n'); // Initial keep-alive
    this.clients.add(res);

    req.on('close', () => {
      this.clients.delete(res);
    });
  }

  // Send a named event to all clients
  send<T = any>(event: string, data: T): void {
    const formatted = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach(client => {
      client.write(formatted);
    });
  }

  // Send default unnamed "message" event
  broadcast<T = any>(data: T): void {
    this.send('message', data);
  }

  clientCount(): number {
    return this.clients.size;
  }
}