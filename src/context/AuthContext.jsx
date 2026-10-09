import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const LS_KEYS = {
  currentUser: 'krishinetra.auth.currentUser',
  users: 'krishinetra.auth.users',
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// Simple hash for demo purposes (not cryptographically secure — fine for a frontend-only prototype)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'kn_' + Math.abs(hash).toString(36);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJSON(LS_KEYS.currentUser, null));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify persisted session is still valid
    const stored = readJSON(LS_KEYS.currentUser, null);
    if (stored) {
      const users = readJSON(LS_KEYS.users, []);
      const exists = users.find((u) => u.id === stored.id);
      if (exists) {
        setUser(stored);
      } else {
        localStorage.removeItem(LS_KEYS.currentUser);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const register = useCallback((name, email, password) => {
    const users = readJSON(LS_KEYS.users, []);

    // Check for duplicate email
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: simpleHash(password),
      createdAt: new Date().toISOString(),
      avatar: name.trim().split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2),
    };

    users.push(newUser);
    writeJSON(LS_KEYS.users, users);

    // Auto-login after registration
    const sessionUser = { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar };
    setUser(sessionUser);
    writeJSON(LS_KEYS.currentUser, sessionUser);

    return { success: true, user: sessionUser };
  }, []);

  const login = useCallback((email, password) => {
    const users = readJSON(LS_KEYS.users, []);
    const found = users.find((u) => u.email === email.toLowerCase().trim());

    if (!found) {
      return { success: false, error: 'No account found with this email.' };
    }

    if (found.passwordHash !== simpleHash(password)) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const sessionUser = { id: found.id, name: found.name, email: found.email, avatar: found.avatar };
    setUser(sessionUser);
    writeJSON(LS_KEYS.currentUser, sessionUser);

    return { success: true, user: sessionUser };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(LS_KEYS.currentUser);
  }, []);

  const updateProfile = useCallback((updates) => {
    if (!user) return { success: false, error: 'Not logged in.' };

    const users = readJSON(LS_KEYS.users, []);
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx === -1) return { success: false, error: 'User not found.' };

    if (updates.name) {
      users[idx].name = updates.name.trim();
      users[idx].avatar = updates.name.trim().split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
    }

    writeJSON(LS_KEYS.users, users);

    const sessionUser = { id: users[idx].id, name: users[idx].name, email: users[idx].email, avatar: users[idx].avatar };
    setUser(sessionUser);
    writeJSON(LS_KEYS.currentUser, sessionUser);

    return { success: true, user: sessionUser };
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, isLoading, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
