import { User } from 'firebase/auth';

export const ADMIN_EMAIL = 'admin@skyquest.com';

export const isAdmin = (user: User | null | undefined): boolean => {
    if (!user || !user.email) return false;
    return user.email === ADMIN_EMAIL;
};
