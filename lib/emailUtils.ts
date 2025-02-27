// lib/emailUtils.ts

/**
 * Send a notification email when a time capsule is unlocked
 */
export const sendCapsuleNotification = async (
    email: string,
    capsuleName: string,
    unlockUrl: string
): Promise<boolean> => {
    try {
        const response = await fetch('/api/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'capsuleNotification',
                data: {
                    email,
                    capsuleName,
                    unlockUrl
                }
            }),
        });

        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Error sending capsule notification:', error);
        return false;
    }
};

/**
 * Send a share notification email when a time capsule is shared
 */
export const sendCapsuleShareNotification = async (
    toEmail: string,
    fromName: string,
    capsuleName: string,
    shareUrl: string
): Promise<boolean> => {
    try {
        const response = await fetch('/api/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'capsuleShare',
                data: {
                    toEmail,
                    fromName,
                    capsuleName,
                    shareUrl
                }
            }),
        });

        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Error sending capsule share notification:', error);
        return false;
    }
};