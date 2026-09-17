// ws.js - WebSocket module for FletBox
import { WebSocketServer as WSS } from 'ws';

/**
 * # WEBSOCKET MODULE
 * - WebSocket server for real-time communication
 * - Room support
 * - Authentication
 *
 * @example
 * import { createWebSocketServer } from '@flet-box/ws';
 *
 * const wss = createWebSocketServer(3001);
 *
 * wss.onConnection((ws, req) => {
 *   ws.send('Welcome!');
 * });
 *
 * wss.onMessage((ws, message) => {
 *   console.log('Received:', message);
 * });
 */

export class WebSocketServer {
  constructor(server) {
    this.wss = server instanceof WSS ? server : new WSS({ server });
    this.clients = new Set();
    this.rooms = new Map();
    this.middlewares = [];
    this.handlers = {
      connection: [],
      message: [],
      close: [],
      error: [],
    };
    
    this._setup();
  }

  _setup() {
    this.wss.on('connection', (ws, req) => {
      this.clients.add(ws);
      
      // Apply middlewares
      let canConnect = true;
      for (const middleware of this.middlewares) {
        const result = middleware(ws, req);
        if (result === false) {
          canConnect = false;
          break;
        }
      }
      
      if (!canConnect) {
        ws.close();
        return;
      }
      
      // Trigger connection handlers
      for (const handler of this.handlers.connection) {
        handler(ws, req);
      }
      
      ws.on('message', (data) => {
        let message = data;
        try {
          message = JSON.parse(data);
        } catch {}
        
        // Handle room subscription
        if (message?.type === 'subscribe' && message?.room) {
          this._joinRoom(ws, message.room);
          return;
        }
        if (message?.type === 'unsubscribe' && message?.room) {
          this._leaveRoom(ws, message.room);
          return;
        }
        
        for (const handler of this.handlers.message) {
          handler(ws, message);
        }
      });
      
      ws.on('close', () => {
        this.clients.delete(ws);
        this._removeFromAllRooms(ws);
        for (const handler of this.handlers.close) {
          handler(ws);
        }
      });
      
      ws.on('error', (error) => {
        for (const handler of this.handlers.error) {
          handler(ws, error);
        }
      });
    });
  }

  _joinRoom(ws, room) {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room).add(ws);
    ws._rooms = ws._rooms || new Set();
    ws._rooms.add(room);
  }

  _leaveRoom(ws, room) {
    if (this.rooms.has(room)) {
      this.rooms.get(room).delete(ws);
    }
    if (ws._rooms) {
      ws._rooms.delete(room);
    }
  }

  _removeFromAllRooms(ws) {
    if (!ws._rooms) return;
    for (const room of ws._rooms) {
      this._leaveRoom(ws, room);
    }
    ws._rooms = new Set();
  }

  /**
   * Register a middleware
   * @param {Function} fn - Middleware function (ws, req) => boolean
   */
  use(fn) {
    this.middlewares.push(fn);
    return this;
  }

  /**
   * Register connection handler
   * @param {Function} fn - Handler function (ws, req) => void
   */
  onConnection(fn) {
    this.handlers.connection.push(fn);
    return this;
  }

  /**
   * Register message handler
   * @param {Function} fn - Handler function (ws, message) => void
   */
  onMessage(fn) {
    this.handlers.message.push(fn);
    return this;
  }

  /**
   * Register close handler
   * @param {Function} fn - Handler function (ws) => void
   */
  onClose(fn) {
    this.handlers.close.push(fn);
    return this;
  }

  /**
   * Register error handler
   * @param {Function} fn - Handler function (ws, error) => void
   */
  onError(fn) {
    this.handlers.error.push(fn);
    return this;
  }

  /**
   * Send message to a specific client
   * @param {WebSocket} ws - Client connection
   * @param {any} data - Data to send
   */
  send(ws, data) {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  }

  /**
   * Send message to all clients
   * @param {any} data - Data to send
   * @param {Function} filter - Optional filter function
   */
  broadcast(data, filter = null) {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    for (const client of this.clients) {
      if (client.readyState === client.OPEN) {
        if (filter && !filter(client)) continue;
        client.send(message);
      }
    }
  }

  /**
   * Send message to a room
   * @param {string} room - Room name
   * @param {any} data - Data to send
   */
  to(room, data) {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    const clients = this.rooms.get(room);
    if (!clients) return;
    for (const client of clients) {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    }
  }

  /**
   * Get connected clients count
   * @returns {number}
   */
  getClientCount() {
    return this.clients.size;
  }

  /**
   * Close the server
   * @returns {Promise<void>}
   */
  close() {
    return new Promise((resolve) => {
      this.wss.close(() => resolve());
    });
  }
}

/**
 * Create WebSocket server
 * @param {number|Server} server - Port number or HTTP server
 * @returns {WebSocketServer}
 */
export function createWebSocketServer(server) {
  return new WebSocketServer(server);
}

export default {
  WebSocketServer,
  createWebSocketServer,
};
