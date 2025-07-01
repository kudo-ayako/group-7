// App.tsx
import React, { useEffect } from 'react'; // useEffect をインポート
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LocaleConfig } from 'react-native-calendars';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen'; // 実際のHomeScreenをインポート
import { initializeDB } from './lib/database'; // database.tsから初期化関数をインポート

LocaleConfig.locales['jp'] = {
  monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
  today: '今日'
};

LocaleConfig.defaultLocale = 'jp';
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  // アプリ起動時に一度だけDBを初期化する
  useEffect(() => {
    initializeDB();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'ログイン' }} />
        {/* DummyHomeScreenをHomeScreenに修正 */}
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ホーム' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
