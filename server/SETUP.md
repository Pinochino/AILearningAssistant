# ATIUI Messaging & Notifications Service Setup

## Environment Variables

Tạo file `.env` trong thư mục `server` với nội dung sau:

```env
# Server Configuration
PORT=9000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/atiui

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# AI Service Configuration
AI_SERVICE_URL=http://localhost:3001
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

## Installation

```bash
cd server
yarn install
```

## Running the Server

```bash
# Development
yarn dev

# Production
yarn start
```

## Features Implemented

### Messaging System
- ✅ Real-time chat với WebSocket
- ✅ Student ↔ AI Tutor conversations
- ✅ Student ↔ Teacher conversations  
- ✅ Teacher ↔ Admin conversations
- ✅ Group conversations
- ✅ Message read status
- ✅ Typing indicators
- ✅ Message attachments
- ✅ Reply to messages

### Notifications System
- ✅ Real-time push notifications
- ✅ Class announcements
- ✅ School-wide announcements
- ✅ Message notifications
- ✅ AI reply notifications
- ✅ Grade update notifications
- ✅ Class invite notifications
- ✅ System notifications
- ✅ Notification read status
- ✅ Notification statistics

### AI Integration
- ✅ AI Tutor conversations
- ✅ Multiple AI tutors (math, science, english, etc.)
- ✅ Context-aware responses
- ✅ Fallback to OpenAI if internal service unavailable
- ✅ Typing indicators for AI responses

### Technical Features
- ✅ MongoDB for data persistence
- ✅ Redis for real-time features and caching
- ✅ JWT authentication
- ✅ Socket.IO with Redis adapter for scaling
- ✅ REST API endpoints
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Error handling
- ✅ TypeScript support

## API Endpoints

### Messages
- `POST /api/messages` - Send message
- `POST /api/messages/ai` - Send message to AI
- `GET /api/messages/conversations` - Get user conversations
- `POST /api/messages/conversations` - Create conversation
- `GET /api/messages/conversations/:id/messages` - Get conversation messages
- `POST /api/messages/conversations/:id/read` - Mark conversation as read
- `GET /api/messages/direct/:userId` - Get/create direct conversation
- `GET /api/messages/ai/:aiTutorId` - Get/create AI conversation
- `POST /api/messages/:messageId/read` - Mark message as read
- `POST /api/messages/announcements` - Create announcement

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/stats` - Get notification statistics
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications/system` - Create system notification (admin only)
- `POST /api/notifications/class-invite` - Create class invite notification
- `POST /api/notifications/grade-update` - Create grade update notification

## Socket Events

### Client → Server
- `join_conversation` - Join conversation room
- `leave_conversation` - Leave conversation room
- `send_message` - Send message
- `ai_message` - Send message to AI
- `mark_message_read` - Mark message as read
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `mark_notification_read` - Mark notification as read
- `mark_all_notifications_read` - Mark all notifications as read
- `update_status` - Update user status

### Server → Client
- `connection_established` - Connection confirmed
- `new_message` - New message received
- `ai_response` - AI response received
- `ai_typing` - AI typing indicator
- `user_typing` - User typing indicator
- `notification` - New notification
- `user_status_changed` - User status changed
- `message_read` - Message marked as read
- `notification_read` - Notification marked as read
- `all_notifications_read` - All notifications marked as read

## Database Models

### User
- Basic user information with roles (student, teacher, admin)
- Class and subject associations
- Activity tracking

### Conversation
- Support for direct, group, AI, and announcement conversations
- Participant management
- Conversation metadata

### Message
- Rich message content with attachments
- Read status tracking
- AI response metadata
- Reply functionality

### Notification
- Multiple notification types
- Priority levels
- Read status tracking
- Expiration support

## Testing

Để test hệ thống, bạn có thể sử dụng:

1. **Postman** - Test REST API endpoints
2. **Socket.IO Client** - Test real-time features
3. **MongoDB Compass** - View database data
4. **Redis CLI** - Monitor Redis data

## Deployment

Hệ thống đã được thiết kế để scale với:
- Redis adapter cho Socket.IO
- MongoDB cho data persistence
- JWT authentication
- Rate limiting
- CORS configuration

Có thể deploy trên Docker với docker-compose hoặc các cloud platforms như AWS, Google Cloud, Azure.
