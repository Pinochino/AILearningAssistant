import { REDIS_CLIENT } from '../configs/redis.js'

export class OnlineService {
  static async addOnlineSocket(userId: string, socketId: string) {
    // Add socket to user's online set
    await REDIS_CLIENT.sAdd(`online:${userId}`, socketId)
    await REDIS_CLIENT.expire(`online:${userId}`, 60 * 60 * 24) // auto-expire in 24h

    // Update user's last seen
    await REDIS_CLIENT.hSet(`user:${userId}`, 'lastSeen', new Date().toISOString())
    await REDIS_CLIENT.hSet(`user:${userId}`, 'status', 'online')

    await REDIS_CLIENT.expire(`user:${userId}`, 60 * 60 * 24)
  }

  static async removeOnlineSocket(userId: string, socketId: string) {
    await REDIS_CLIENT.sRem(`online:${userId}`, socketId)

    // Check if user has any remaining sockets
    const remainingSockets = await REDIS_CLIENT.sMembers(`online:${userId}`)
    if (remainingSockets.length === 0) {
      // User is offline
      await REDIS_CLIENT.hSet(`user:${userId}`, 'lastSeen', new Date().toISOString())
      await REDIS_CLIENT.hSet(`user:${userId}`, 'status', 'offline')
    }
  }

  static async getOnlineSockets(userId: string): Promise<string[]> {
    return await REDIS_CLIENT.sMembers(`online:${userId}`)
  }

  static async isUserOnline(userId: string): Promise<boolean> {
    const sockets = await this.getOnlineSockets(userId)
    return sockets.length > 0
  }

  static async getOnlineUsers(): Promise<string[]> {
    const keys = await REDIS_CLIENT.keys('online:*')
    return keys.map((key) => key.replace('online:', ''))
  }

  static async getUserStatus(userId: string): Promise<{ status: string; lastSeen: string } | null> {
    const userData = await REDIS_CLIENT.hGetAll(`user:${userId}`)
    if (Object.keys(userData).length === 0) return null

    return {
      status: userData.status || 'offline',
      lastSeen: userData.lastSeen || new Date().toISOString()
    }
  }

  static async setUserOffline(userId: string) {
    await REDIS_CLIENT.del(`online:${userId}`)

    await REDIS_CLIENT.hSet(`user:${userId}`, 'lastSeen', new Date().toISOString())
    await REDIS_CLIENT.hSet(`user:${userId}`, 'status', 'offline')
  }
}
