import { getDatabase } from '../config/database';
import { ChatMessage } from '../types';

export class ChatHistoryModel {
  static addMessage(userId: number, message: string, role: 'user' | 'assistant'): ChatMessage {
    const db = getDatabase();
    
    const result = db.prepare(`
      INSERT INTO chat_history (user_id, message, role)
      VALUES (?, ?, ?)
    `).run(userId, message, role);
    
    return db.prepare('SELECT * FROM chat_history WHERE id = ?')
      .get(result.lastInsertRowid) as ChatMessage;
  }

  static getRecentMessages(userId: number, limit: number = 50): ChatMessage[] {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT * FROM chat_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
    
    const messages = stmt.all(userId, limit) as ChatMessage[];
    return messages.reverse(); // Return in chronological order
  }

  static getConversationContext(userId: number, limit: number = 10): ChatMessage[] {
    return this.getRecentMessages(userId, limit);
  }
}
