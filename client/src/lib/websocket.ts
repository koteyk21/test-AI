import { WebSocketMessage } from "@/types";

let socket: WebSocket | null = null;
let reconnectInterval: number | null = null;
const listeners: ((message: WebSocketMessage) => void)[] = [];

export function setupWebSocket(userId: number) {
  if (socket) {
    socket.close();
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log('WebSocket connection established');
    
    // Register the client with userId
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ userId }));
    }
    
    // Clear any reconnect interval
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
  };
  
  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      
      // Notify all listeners
      listeners.forEach(listener => listener(message));
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };
  
  socket.onclose = () => {
    console.log('WebSocket connection closed');
    
    // Setup reconnect if not already reconnecting
    if (!reconnectInterval) {
      reconnectInterval = window.setInterval(() => {
        console.log('Attempting to reconnect WebSocket...');
        setupWebSocket(userId);
      }, 5000); // Try to reconnect every 5 seconds
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return socket;
}

export function sendMessage(userId: number, receiverId: number, content: string) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'message',
      userId,
      receiverId,
      content
    }));
  } else {
    console.error('WebSocket is not connected');
  }
}

export function addMessageListener(listener: (message: WebSocketMessage) => void) {
  listeners.push(listener);
  
  // Return a function to remove the listener
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

export function closeWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
  
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
  
  // Clear all listeners
  listeners.length = 0;
}
