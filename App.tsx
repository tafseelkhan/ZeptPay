/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import ZeptPay from './src/navigations';
import { ThemeProvider } from './src/core/contexts/theme/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <ZeptPay />
    </ThemeProvider>
  );
}
export default App;
