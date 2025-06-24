import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const dummyTasks = [
  { id: '1', title: 'レポート提出' },
  { id: '2', title: 'WebClassの課題確認' },
  { id: '3', title: 'バイトシフト確認' },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>タスク一覧</Text>
      <FlatList
        data={dummyTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, marginBottom: 10 },
  taskItem: { padding: 12, marginVertical: 4, backgroundColor: '#f0f0f0', borderRadius: 6 },
});
