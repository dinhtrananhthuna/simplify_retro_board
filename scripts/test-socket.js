const { io } = require('socket.io-client');

console.log('Testing socket connection...');

// Initialize socket server first
fetch('http://localhost:3001/api/socket')
  .then(() => {
    console.log('Socket server initialized');
    
    // Test socket connection
    const socket = io('http://localhost:3001', {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected successfully!', socket.id);
      
      // Test basic events
      socket.emit('presence:join', { 
        boardId: 'test-board', 
        email: 'test@example.com' 
      });
      
      setTimeout(() => {
        socket.disconnect();
        console.log('Socket test completed');
        process.exit(0);
      }, 2000);
    });

    socket.on('connect_error', (error) => {
      console.log('❌ Socket connection error:', error.message);
      process.exit(1);
    });

    socket.on('error', (error) => {
      console.log('❌ Socket error:', error);
    });

    socket.on('presence:list', (data) => {
      console.log('📝 Received presence list:', data);
    });
    
  })
  .catch((error) => {
    console.log('❌ Failed to initialize socket server:', error.message);
    process.exit(1);
  }); 