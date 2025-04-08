type SSECallback = (data: any) => void

export class SSEClient {

  private source: EventSource

  private listeners: Record<string, SSECallback>

  constructor(url: string)

  on(event: string, callback: SSECallback)

  close()

}


