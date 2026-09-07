/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { I18nProvider } from './lib/i18n.js';
import { AdminLayout } from './components/layout/AdminLayout.js';

export default function App() {
  return (
    <I18nProvider>
      <AdminLayout />
    </I18nProvider>
  );
}

