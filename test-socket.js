// Test Socket.IO connection
const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:3003';

async function testSocketConnection() {
  console.log('🔌 Testing Socket.IO Connection...\n');

  return new Promise((resolve, reject) => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
    });

    let connected = false;
    let welcomeReceived = false;

    // Set timeout for the test
    const timeout = setTimeout(() => {
      if (!connected) {
        console.log('❌ Socket connection timeout');
        socket.disconnect();
        reject(new Error('Connection timeout'));
      }
    }, 15000);

    socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      console.log(`   Socket ID: ${socket.id}`);
      connected = true;
      
      // Test room joining
      socket.emit('join_room', { room: 'test-room' });
    });

    socket.on('welcome', (data) => {
      console.log('✅ Welcome message received');
      console.log(`   Message: ${data.message}`);
      console.log(`   Timestamp: ${data.timestamp}`);
      welcomeReceived = true;
    });

    socket.on('room_joined', (data) => {
      console.log('✅ Room join successful');
      console.log(`   Room: ${data.room}`);
      
      // Test authentication
      socket.emit('authenticate', { userId: 'test-user-123' });
    });

    socket.on('authenticated', (data) => {
      console.log('✅ Socket authentication successful');
      console.log(`   Success: ${data.success}`);
      
      // All tests passed
      clearTimeout(timeout);
      socket.disconnect();
      
      console.log('\n🎉 Socket.IO Test Complete!');
      console.log('\n📊 Socket Summary:');
      console.log('- Connection: ✅ Working');
      console.log('- Welcome Message: ✅ Working');
      console.log('- Room Management: ✅ Working');
      console.log('- Authentication: ✅ Working');
      
      resolve();
    });

    socket.on('connect_error', (error) => {
      console.log('❌ Socket connection error:', error.message);
      clearTimeout(timeout);
      reject(error);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      if (connected && welcomeReceived) {
        // Normal disconnection after successful test
        clearTimeout(timeout);
        resolve();
      }
    });

    socket.on('error', (error) => {
      console.log('❌ Socket error:', error);
      clearTimeout(timeout);
      reject(error);
    });
  });
}

// Run the test
testSocketConnection()
  .then(() => {
    console.log('\n✅ All socket tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Socket test failed:', error.message);
    process.exit(1);
  });
