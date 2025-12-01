import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useThemeContext } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ToastProvider } from './src/components/ui/Toast';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { RootNavigator } from './src/navigation/RootNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function AppContent() {
  const { theme, isDark } = useThemeContext();

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: theme.colors?.primary || '#3B82F6',
          background: theme.colors?.background || '#F8FAFC',
          card: theme.colors?.card || theme.colors?.surface || '#FFFFFF',
          text: theme.colors?.text || '#0F172A',
          border: theme.colors?.border || '#E2E8F0',
          notification: theme.colors?.notification || theme.colors?.primary || '#3B82F6',
        },
        fonts: theme.fonts || {
          regular: {
            fontFamily: 'System',
            fontWeight: '400' as const,
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500' as const,
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700' as const,
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '800' as const,
          },
        },
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
