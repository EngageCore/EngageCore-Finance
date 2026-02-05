import * as signalR from '@microsoft/signalr';

class ChatService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.messageId = 0;
    this.defaultReceiver = "player"; // Set default receiver to player since this is admin side
    this.username = "admin";
    this.callbacks = {
      newMessage: null,
      userTyping: null,
      onOnlineUsers: null,
      onChatHistory: null,
      onMessageReadUpdate: null,
      userJoined: null,
      userLeft: null,
      onClose: null,
      onReconnecting: null,
      onReconnected: null
    };
    this.connectedUsers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize the SignalR connection
  async startConnection(username = "admin") {
    try {
      // Close any existing connection
      if (this.connection) {
        await this.connection.stop();
      }
      
      // Store username
      this.username = username;
      
      // Create SignalR connection
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("https://dev-gamingpro-chat-api.azurewebsites.net/chat", {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      // Handle reconnection events
      this.setupConnectionEvents();
      this.connection.onreconnected((connectionId) => {
        console.log("Reconnected with ID:", connectionId);
        this.isConnected = true;
        this.reconnectionAttempts = 0;
        
        // Rejoin chat after reconnection
        if (this.username) {
          this.joinChat({
            userId: this.username,
            username: this.username
          });
        }
      });

      this.connection.onclose((error) => {
        console.log("SignalR connection closed:", error);
        this.isConnected = false;
        
        // Attempt manual reconnection if automatic reconnection fails
        if (this.reconnectionAttempts < this.maxReconnectionAttempts) {
          this.reconnectionAttempts++;
          console.log(`Manual reconnection attempt ${this.reconnectionAttempts}/${this.maxReconnectionAttempts}`);
          setTimeout(() => this.startConnection(this.username), 5000);
        }
      });

      // Start the connection
      await this.connection.start();
      console.log("Connected to SignalR hub");
      this.isConnected = true;
      this.reconnectionAttempts = 0;
      
      return true;
    } catch (error) {
      console.error("Error starting SignalR connection:", error);
      this.isConnected = false;
      
      // Attempt to reconnect
      if (this.reconnectionAttempts < this.maxReconnectionAttempts) {
        this.reconnectionAttempts++;
        console.log(`Connection failed. Reconnection attempt ${this.reconnectionAttempts}/${this.maxReconnectionAttempts}`);
        setTimeout(() => this.startConnection(this.username), 5000);
      }
      
      return false;
    }
  }

  // Set up event handlers for SignalR
  setupEventHandlers() {
    // Handle receiving messages
    this.connection.on('ReceiveMessage', (username, message) => {
      console.log('Message received:', username, message);

      if ((username && username.startsWith('admin_'))) {
        return;
      }
      
      let userId = username;
      let displayName = username;
      
      if (username.startsWith('Guest-')) {
        userId = username;
        displayName = `Guest ${username.split('-')[1]}`;
      }
      
      // Add user to connected users if not already there
      if (!this.connectedUsers.has(userId) && userId !== this.username) {
        this.connectedUsers.set(userId, {
          userId: userId,
          username: displayName,
          isOnline: true,
          avatar: '/avatar.png',
          lastActive: new Date()
        });
        
        // Notify about new user
        if (this.callbacks.onOnlineUsers) {
          this.callbacks.onOnlineUsers(Array.from(this.connectedUsers.values()));
        }
      }
      
      // Create message object
      const messageObj = {
        senderId: userId,
        senderName: displayName,
        receiverId: this.username,
        content: message,
        timestamp: new Date().toISOString(),
        read: false,
        needsAttention: true,
        isIncoming: true // Add flag to identify incoming messages
      };
      
      // Trigger newMessage callback
      if (this.callbacks.newMessage) {
        this.callbacks.newMessage(messageObj);
      }
    });
    
    // Handle typing indicators
    this.connection.on('TypingMessage', (username) => {
      console.log('User typing:', username);
      
      // Extract guest ID if it's a guest user
      let userId = username;
      let displayName = username;
      
      if (username.startsWith('Guest-')) {
        userId = username;
        displayName = `Guest ${username.split('-')[1]}`;
      }
      
      // Update user typing status
      if (this.callbacks.userTyping) {
        this.callbacks.userTyping({
          userId: userId,
          username: displayName,
          isTyping: true
        });
      }
    });

    // Handle leave events
    this.connection.on('LeaveGroup', (message) => {
      console.log('Leave event:', message);
      
      // Extract username from message (format: "username has left the conversation")
      const parts = message.split(' ');
      const username = parts[0];
      
      // Skip if it's the current user
      if (username === this.username) return;
      
      // Format username if it's a guest
      let userId = username;
      let displayName = username;
      
      if (username.startsWith('Guest-')) {
        userId = username;
        displayName = `Guest ${username.split('-')[1]}`;
      }
      
      // Get user from connected users
      const user = this.connectedUsers.get(userId);
      
      if (user) {
        // Update user status
        user.isOnline = false;
        user.lastActive = new Date();
        this.connectedUsers.set(userId, user);
        
        // Trigger userLeft callback
        if (this.callbacks.userLeft) {
          this.callbacks.userLeft(user);
        }
        
        // Update online users list
        if (this.callbacks.onOnlineUsers) {
          this.callbacks.onOnlineUsers(Array.from(this.connectedUsers.values()));
        }
      }
    });
  }

  // Set up connection event handlers
  setupConnectionEvents() {
    // Handle connection close
    this.connection.onclose(error => {
      console.log("Connection closed", error);
      this.isConnected = false;
      
      if (this.callbacks.onClose) {
        this.callbacks.onClose(error);
      }
    });

    // Handle reconnecting
    this.connection.onreconnecting(error => {
      console.log("Reconnecting...", error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.callbacks.onReconnecting) {
        this.callbacks.onReconnecting(error);
      }
    });

    // Handle reconnected
    this.connection.onreconnected(connectionId => {
      console.log("Reconnected with ID:", connectionId);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Rejoin chat after reconnection
      this.joinChat({
        userId: this.username,
        username: this.username
      }).catch(err => console.error("Error rejoining chat after reconnection:", err));
      
      if (this.callbacks.onReconnected) {
        this.callbacks.onReconnected(connectionId);
      }
    });
  }

  // Join chat
  async joinChat(user) {
    if (!this.isConnected) {
      console.error("Cannot join chat: Not connected to SignalR hub");
      return false;
    }
    
    try {
      return true;
    } catch (error) {
      console.error("Error joining chat:", error);
      return false;
    }
  }

  // Send a message
  async sendMessage(message) {
    if (!this.isConnected) {
      console.error("Cannot send message: Not connected to SignalR hub");
      return false;
    }
    
    try {
      // Mark message as outgoing before sending
      message.isOutgoing = true;
      
      await this.connection.invoke("SendMessage", "admin_" + message.receiverId, message.content);
      console.log("Message sent to", message.receiverId);
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  // Send typing indicator
  async sendTypingIndicator(typingData) {
    if (!this.isConnected) {
      return false;
    }
    
    try {
      await this.connection.invoke("TypingMessage", "Admin-" + typingData.targetUserId);
      return true;
    } catch (error) {
      console.error("Error sending typing indicator:", error);
      return false;
    }
  }

  // Register event handler
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    } else {
      console.warn(`Unknown event: ${event}`);
    }
  }

  // Unregister event handler
  off(event) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = null;
    }
  }

  // Disconnect from SignalR hub
  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("Disconnected from SignalR hub");
        this.isConnected = false;
      } catch (error) {
        console.error("Error disconnecting from SignalR hub:", error);
      }
    }
  }

  // Load chat history from server
  async loadChatHistory() {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/admin/chat/history`);
      if (!response.ok) {
        throw new Error('Failed to load chat history');
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading chat history:', error);
      return { messagesByUser: {}, users: [] };
    }
  }

  // Save message to server
  async saveMessage(message) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/admin/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });
      return response.ok;
    } catch (error) {
      console.error('Error saving message:', error);
      return false;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(playerId) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/admin/chat/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playerId })
      });
      return response.ok;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const chatService = new ChatService();
export default chatService;
