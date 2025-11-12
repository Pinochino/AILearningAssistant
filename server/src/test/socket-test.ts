import { io, Socket } from "socket.io-client";

// Test script for Socket.IO functionality
const testSocketConnection = () => {
    const socket: Socket = io("http://localhost:9000", {
        auth: {
            token: "your-jwt-token-here" // Replace with actual JWT token
        }
    });

    socket.on("connect", () => {
        console.log("✅ Connected to server");

        // Test joining a conversation
        socket.emit("join_conversation", { conversationId: "test-conversation-id" });
    });

    socket.on("connection_established", (data) => {
        console.log("✅ Connection established:", data);
    });

    socket.on("joined_conversation", (data) => {
        console.log("✅ Joined conversation:", data);
    });

    socket.on("new_message", (message) => {
        console.log("📨 New message received:", message);
    });

    socket.on("notification", (notification) => {
        console.log("🔔 Notification received:", notification);
    });

    socket.on("error", (error) => {
        console.error("❌ Socket error:", error);
    });

    socket.on("disconnect", () => {
        console.log("❌ Disconnected from server");
    });

    // Test sending a message after 2 seconds
    setTimeout(() => {
        socket.emit("send_message", {
            conversationId: "test-conversation-id",
            content: "Hello, this is a test message!",
            type: "text"
        });
    }, 2000);

    // Test AI message after 4 seconds
    setTimeout(() => {
        socket.emit("ai_message", {
            conversationId: "test-conversation-id",
            prompt: "What is 2+2?",
            aiTutorId: "math-tutor"
        });
    }, 4000);

    // Disconnect after 10 seconds
    setTimeout(() => {
        socket.disconnect();
        process.exit(0);
    }, 10000);
};

// Run the test
if (require.main === module) {
    console.log("🧪 Starting Socket.IO test...");
    testSocketConnection();
}

export { testSocketConnection };
