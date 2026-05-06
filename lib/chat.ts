// Real-time chat storage utilities using InsForge
import { insforge } from './insforge';

export interface ChatMessage {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  userInitials: string;
  content: string;
  timestamp: Date;
}

export interface ChatUser {
  id: string;
  name: string;
  initials: string;
  isOnline: boolean;
  lastSeen?: Date;
}

const COMPANY_CHAT_TABLE = 'company_chat_messages';

// Helper to format timestamp
const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleTimeString();
};

// Convert database row to ChatMessage
const dbRowToMessage = (row: any): ChatMessage => {
  return {
    id: row.id,
    companyId: row.company_id,
    userId: row.user_id,
    userName: row.user_name || 'Anonymous',
    userInitials: row.user_initials || 'A',
    content: row.content,
    timestamp: new Date(row.created_at),
  };
};

/**
 * Get chat messages for a company
 */
export const getCompanyChatMessages = async (companyId: string, limit: number = 100): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await insforge.database
      .from(COMPANY_CHAT_TABLE)
      .select()
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching chat messages:', error);
      return getChatMessagesFromLocalStorage(companyId);
    }

    return data ? data.map(dbRowToMessage).reverse() : [];
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return getChatMessagesFromLocalStorage(companyId);
  }
};

/**
 * Add a chat message and publish it via InsForge Realtime
 */
export const addChatMessage = async (
  companyId: string,
  userId: string,
  userName: string,
  userInitials: string,
  content: string
): Promise<ChatMessage | null> => {
  try {
    const { data, error } = await insforge.database
      .from(COMPANY_CHAT_TABLE)
      .insert([
        {
          company_id: companyId,
          user_id: userId,
          user_name: userName,
          user_initials: userInitials,
          content: content,
        },
      ])
      .select();

    if (error) {
      console.error('Error adding chat message:', error);
      const fallbackMessage: ChatMessage = {
        id: Date.now().toString(),
        companyId,
        userId,
        userName,
        userInitials,
        content,
        timestamp: new Date(),
      };
      return addChatMessageToLocalStorage(fallbackMessage);
    }

    const savedMessage = data && data[0] ? dbRowToMessage(data[0]) : null;

    // Publish the new message to InsForge Realtime so other clients receive it
    if (savedMessage) {
      try {
        await insforge.realtime.publish(`company-chat-${companyId}`, 'new_message', {
          id: savedMessage.id,
          company_id: companyId,
          user_id: userId,
          user_name: userName,
          user_initials: userInitials,
          content: content,
          created_at: savedMessage.timestamp.toISOString(),
        });
      } catch (realtimeErr) {
        // Non-fatal — message was saved to DB, realtime publish just failed
        console.warn('Realtime publish failed:', realtimeErr);
      }
    }

    return savedMessage;
  } catch (error) {
    console.error('Error adding chat message:', error);
    const fallbackMessage: ChatMessage = {
      id: Date.now().toString(),
      companyId,
      userId,
      userName,
      userInitials,
      content,
      timestamp: new Date(),
    };
    return addChatMessageToLocalStorage(fallbackMessage);
  }
};

/**
 * Subscribe to real-time chat updates via InsForge Realtime
 * Returns an unsubscribe function.
 */
export const subscribeToChatMessages = (
  companyId: string,
  callback: (message: ChatMessage) => void
): (() => void) => {
  const channel = `company-chat-${companyId}`;

  // Connect and subscribe asynchronously
  (async () => {
    try {
      await insforge.realtime.connect();
      const result = await insforge.realtime.subscribe(channel);
      if (!result.ok) {
        const errorResult = result as { ok: false; error: { message: string } };
        console.error('Failed to subscribe to chat channel:', errorResult.error.message);
        return;
      }
    } catch (err) {
      console.error('Error connecting to InsForge Realtime:', err);
    }
  })();

  // Listen for new_message events on this channel
  insforge.realtime.on('new_message', (payload: any) => {
    // The payload includes the channel; filter for this company's channel
    if (payload && (payload.company_id === companyId || !payload.company_id)) {
      const message: ChatMessage = {
        id: payload.id || Date.now().toString(),
        companyId: payload.company_id || companyId,
        userId: payload.user_id || '',
        userName: payload.user_name || 'Anonymous',
        userInitials: payload.user_initials || 'A',
        content: payload.content || '',
        timestamp: payload.created_at ? new Date(payload.created_at) : new Date(),
      };
      callback(message);
    }
  });

  // Return cleanup function
  return () => {
    try {
      insforge.realtime.unsubscribe(channel);
    } catch (err) {
      console.warn('Error unsubscribing from chat channel:', err);
    }
  };
};

// LocalStorage fallback functions
const getChatMessagesFromLocalStorage = (companyId: string): ChatMessage[] => {
  try {
    const stored = localStorage.getItem(`chat-messages-${companyId}`);
    if (stored) {
      const messages = JSON.parse(stored);
      return messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return [];
};

const addChatMessageToLocalStorage = (message: ChatMessage): ChatMessage => {
  try {
    const existing = getChatMessagesFromLocalStorage(message.companyId);
    const updated = [...existing, message];
    localStorage.setItem(`chat-messages-${message.companyId}`, JSON.stringify(updated));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
  return message;
};

/**
 * Get active users for a company from InsForge (from chat messages, posts, and user_companies)
 */
export const getActiveUsers = async (companyId: string): Promise<ChatUser[]> => {
  try {
    const userMap = new Map<string, ChatUser>();

    // Get users from user_companies table
    const { data: userCompaniesData, error: userCompaniesError } = await insforge.database
      .from('user_companies')
      .select()
      .eq('company_id', companyId);

    if (!userCompaniesError && userCompaniesData) {
      userCompaniesData.forEach((row: any) => {
        if (row.user_id && !userMap.has(row.user_id)) {
          userMap.set(row.user_id, {
            id: row.user_id,
            name: 'User',
            initials: 'U',
            isOnline: false,
          });
        }
      });
    }

    // Get users from chat messages
    const { data: chatData, error: chatError } = await insforge.database
      .from(COMPANY_CHAT_TABLE)
      .select('user_id, user_name, user_initials, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (!chatError && chatData) {
      chatData.forEach((row: any) => {
        if (row.user_id) {
          const existing = userMap.get(row.user_id);
          if (existing) {
            existing.name = row.user_name || existing.name || 'Anonymous';
            existing.initials = row.user_initials || existing.initials || 'A';
            existing.lastSeen = new Date(row.created_at);
          } else {
            userMap.set(row.user_id, {
              id: row.user_id,
              name: row.user_name || 'Anonymous',
              initials: row.user_initials || 'A',
              isOnline: false,
              lastSeen: new Date(row.created_at),
            });
          }
        }
      });
    }

    // Get users from posts
    const { data: postData, error: postError } = await insforge.database
      .from('company_posts')
      .select('user_id, user_name, user_initials, created_at')
      .eq('company_id', companyId)
      .neq('user_id', null)
      .order('created_at', { ascending: false });

    if (!postError && postData) {
      postData.forEach((row: any) => {
        if (row.user_id) {
          const existing = userMap.get(row.user_id);
          if (existing) {
            existing.name = row.user_name || existing.name || 'Anonymous';
            existing.initials = row.user_initials || existing.initials || 'A';
            if (!existing.lastSeen || new Date(row.created_at) > existing.lastSeen) {
              existing.lastSeen = new Date(row.created_at);
            }
          } else {
            userMap.set(row.user_id, {
              id: row.user_id,
              name: row.user_name || 'Anonymous',
              initials: row.user_initials || 'A',
              isOnline: false,
              lastSeen: new Date(row.created_at),
            });
          }
        }
      });
    }

    const users = Array.from(userMap.values());

    // Merge with localStorage active users (for online status)
    const localUsers = getActiveUsersFromLocalStorage(companyId);
    const localUserMap = new Map(localUsers.map((u) => [u.id, u]));

    users.forEach((user) => {
      const localUser = localUserMap.get(user.id);
      if (localUser) {
        user.isOnline = localUser.isOnline;
        if (localUser.name && localUser.name !== 'User' && localUser.name !== 'Anonymous') {
          user.name = localUser.name;
          user.initials = localUser.initials;
        }
      }
    });

    localUsers.forEach((localUser) => {
      if (!userMap.has(localUser.id)) {
        users.push(localUser);
      }
    });

    return users.length > 0 ? users : getActiveUsersFromLocalStorage(companyId);
  } catch (error) {
    console.error('Error fetching active users:', error);
    return getActiveUsersFromLocalStorage(companyId);
  }
};

/**
 * Get active users from localStorage (fallback)
 */
const getActiveUsersFromLocalStorage = (companyId: string): ChatUser[] => {
  try {
    const stored = localStorage.getItem(`active-users-${companyId}`);
    if (stored) {
      return JSON.parse(stored).map((user: any) => ({
        ...user,
        lastSeen: user.lastSeen ? new Date(user.lastSeen) : undefined,
      }));
    }
  } catch (error) {
    console.error('Error reading active users from localStorage:', error);
  }
  return [];
};

/**
 * Add/update active user (localStorage for online status tracking)
 */
export const updateActiveUser = (companyId: string, user: ChatUser): void => {
  try {
    const existing = getActiveUsersFromLocalStorage(companyId);
    const index = existing.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      existing[index] = { ...user, lastSeen: new Date() };
    } else {
      existing.push({ ...user, lastSeen: new Date() });
    }
    localStorage.setItem(`active-users-${companyId}`, JSON.stringify(existing));
  } catch (error) {
    console.error('Error updating active user:', error);
  }
};
