import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";

// Test data
const testUser = {
    id: "test-user-id",
    role: "student",
    firstName: "Test",
    lastName: "User"
};

const testJWT = "your-jwt-token-here"; // Replace with actual JWT token

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Authorization": `Bearer ${testJWT}`,
        "Content-Type": "application/json"
    }
});

// Test functions
const testHealthCheck = async () => {
    try {
        const response = await axios.get("http://localhost:4000/health");
        console.log("✅ Health check:", response.data);
    } catch (error) {
        console.error("❌ Health check failed:", error);
    }
};

const testGetConversations = async () => {
    try {
        const response = await api.get("/messages/conversations");
        console.log("✅ Get conversations:", response.data);
    } catch (error) {
        console.error("❌ Get conversations failed:", error);
    }
};

const testCreateConversation = async () => {
    try {
        const response = await api.post("/messages/conversations", {
            participants: ["user1", "user2"],
            name: "Test Conversation",
            isGroup: false,
            conversationType: "direct"
        });
        console.log("✅ Create conversation:", response.data);
        return response.data.data._id;
    } catch (error) {
        console.error("❌ Create conversation failed:", error);
        return null;
    }
};

const testSendMessage = async (conversationId: string) => {
    try {
        const response = await api.post("/messages", {
            conversationId,
            content: "Hello, this is a test message!",
            type: "text"
        });
        console.log("✅ Send message:", response.data);
    } catch (error) {
        console.error("❌ Send message failed:", error);
    }
};

const testSendToAI = async (conversationId: string) => {
    try {
        const response = await api.post("/messages/ai", {
            conversationId,
            prompt: "What is the capital of Vietnam?",
            aiTutorId: "general-tutor"
        });
        console.log("✅ Send to AI:", response.data);
    } catch (error) {
        console.error("❌ Send to AI failed:", error);
    }
};

const testGetNotifications = async () => {
    try {
        const response = await api.get("/notifications");
        console.log("✅ Get notifications:", response.data);
    } catch (error) {
        console.error("❌ Get notifications failed:", error);
    }
};

const testGetUnreadCount = async () => {
    try {
        const response = await api.get("/notifications/unread-count");
        console.log("✅ Get unread count:", response.data);
    } catch (error) {
        console.error("❌ Get unread count failed:", error);
    }
};

// Run all tests
const runAllTests = async () => {
    console.log("🧪 Starting API tests...\n");

    // Test health check
    await testHealthCheck();
    console.log("");

    // Test conversations
    await testGetConversations();
    const conversationId = await testCreateConversation();
    console.log("");

    if (conversationId) {
        // Test messages
        await testSendMessage(conversationId);
        await testSendToAI(conversationId);
        console.log("");
    }

    // Test notifications
    await testGetNotifications();
    await testGetUnreadCount();
    console.log("");

    console.log("✅ All tests completed!");
};

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

export {
    testHealthCheck,
    testGetConversations,
    testCreateConversation,
    testSendMessage,
    testSendToAI,
    testGetNotifications,
    testGetUnreadCount,
    runAllTests
};
