// Helper to get current user info for attribution
export function getCurrentUser() {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
        throw new Error('No authenticated user found');
    }
    return userId;
}

export async function getCurrentUserInfo(): Promise<{ id: string; username: string }> {
    const userId = getCurrentUser();

    // Get username from user storage
    const { userStorage } = await import('./userStorage');
    const user = await userStorage.getUserById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    return {
        id: user.id,
        username: user.username,
    };
}

export function addUserAttribution<T>(data: T): T & {
    createdBy: string;
    createdByUsername: string;
    createdAt: string;
} {
    const userId = getCurrentUser();
    // We'll get the username when we actually save to DB
    return {
        ...data,
        createdBy: userId,
        createdByUsername: '', // Will be filled by store
        createdAt: new Date().toISOString(),
    };
}

export function addModificationAttribution<T>(data: T): T & {
    modifiedBy: string;
    modifiedByUsername: string;
    modifiedAt: string;
} {
    const userId = getCurrentUser();
    return {
        ...data,
        modifiedBy: userId,
        modifiedByUsername: '', // Will be filled by store
        modifiedAt: new Date().toISOString(),
    };
}
