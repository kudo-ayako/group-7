import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { loginUser, registerUser } from '../lib/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ★ 修正点1: async/await を使うように関数を修正
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
        Alert.alert('入力エラー', 'ユーザー名とパスワードを入力してください');
        return;
    }
    // awaitで非同期関数の結果（trueかfalse）を待つ
    const success = await loginUser(username, password);

    if (success) {
      // ログイン成功時はreplaceで画面を置き換えることで、戻るボタンでログイン画面に戻れないようにします
      navigation.replace('Home');
    } else {
      Alert.alert('ログイン失敗', 'ユーザー名またはパスワードが間違っています');
    }
  };

  // ★ 修正点2: こちらも async/await を使うように関数を修正
  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
        Alert.alert('入力エラー', 'ユーザー名とパスワードを入力してください');
        return;
    }
    // awaitで非同期関数の結果（{ success, message } オブジェクト）を待つ
    const result = await registerUser(username, password);

    // 返ってきたオブジェクトのプロパティを使ってアラートを表示
    Alert.alert(result.success ? '登録成功' : '登録失敗', result.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Warayaki ログイン</Text>

      <TextInput
        style={styles.input}
        placeholder="ユーザー名"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="パスワード"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.buttonContainer}>
        <Button title="ログイン" onPress={handleLogin} />
      </View>

      <TouchableOpacity onPress={handleRegister} style={styles.registerLink}>
        <Text style={styles.registerText}>新規登録はこちら</Text>
      </TouchableOpacity>
    </View>
  );
}

// スタイルは変更ありません
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  registerLink: {
    alignItems: 'center',
  },
  registerText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
