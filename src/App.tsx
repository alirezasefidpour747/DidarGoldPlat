/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { I18nProvider } from './lib/i18n.js';
import { AdminLayout } from './components/layout/AdminLayout.js';
import { LoginView } from './components/auth/LoginView.js';
import { api, onAuthStateChange } from './lib/api.js';
import { AuthSessionData } from './types/auth.js';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<AuthSessionData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check initial session
    api.getCurrentSession()
      .then((curr) => {
        setSession(curr);
      })
      .catch(() => {
        setSession(null);
      })
      .finally(() => {
        setIsInitializing(false);
      });

    // Listen to session changes (login, logout, switch workspace)
    const unsubscribe = onAuthStateChange((newSession) => {
      setSession(newSession);
    });

    return () => unsubscribe();
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#101014] flex flex-col items-center justify-center text-[#C8A951]">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E5C365] via-[#C8A951] to-[#8C6D23] flex items-center justify-center shadow-lg shadow-[#C8A951]/20 mb-4 animate-pulse">
          <span className="font-extrabold text-[#141416] text-xl">DG</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#9E9EA8]">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C8A951]" />
          <span>در حال راه‌اندازی و بررسی نشست امنیتی...</span>
        </div>
      </div>
    );
  }

  return (
    <I18nProvider>
      {session ? (
        <AdminLayout />
      ) : (
        <LoginView onLoginSuccess={(sess) => setSession(sess)} />
      )}
    </I18nProvider>
  );
}


