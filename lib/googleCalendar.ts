lib/googleCalendar.ts:

import * as AuthSession from 'expo-auth-session';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

// ここにあなたのクライアントIDを入れます（そのままでOK）
const CLIENT_ID = '896781441922-p2c6ou10n5jl6ni00qdk6598n308kok0.apps.googleusercontent.com';

// リダイレクトURIを自動で作る
const REDIRECT_URI = makeRedirectUri({
scheme: 'warayaki',
});

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

/**

Google にログインしてアクセストークンをもらう
*/
export async function loginWithGoogle(): Promise<string | null> {
const authUrl = https://accounts.google.com/o/oauth2/v2/auth?response_type=token +
&client_id=${CLIENT_ID} +
&redirect_uri=${encodeURIComponent(REDIRECT_URI)} +
&scope=${encodeURIComponent(SCOPES.join(' '))};

const result = await AuthSession.startAsync({ authUrl });

if (result.type === 'success' && result.params.access_token) {
return result.params.access_token;
} else {
console.warn('認証が失敗しました');
return null;
}
}
