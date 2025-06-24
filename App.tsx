// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import { useEffect } from 'react';
import { initDB } from './lib/db';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    initDB(); // アプリ起動時にDB初期化
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'ログイン' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ホーム' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
