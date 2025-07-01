import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Task, getTasksForMonth, getTasksForDate, addTask, deleteTask, toggleTaskCompleted, updateTask } from '../lib/database';
import AddTaskModal from '../components/AddTaskModal';

// DateオブジェクトをYYYY-MM-DD形式の文字列に変換するヘルパー関数
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 今日の日付をYYYY-MM-DD形式で取得
const getTodayDateString = () => formatDate(new Date());


export default function HomeScreen() {
  const [allTasksInMonth, setAllTasksInMonth] = useState<Task[]>([]); // 現在の月に表示されている全タスク
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[]>([]); // 選択した日のタスク

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [currentMonth, setCurrentMonth] = useState(getTodayDateString());

  const [isAddTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [isMonthPickerVisible, setMonthPickerVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // --- データ読み込みロジック ---
  const loadData = useCallback(async () => {
    try {
      const date = new Date(currentMonth);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthTasks = await getTasksForMonth(year, month);
      setAllTasksInMonth(monthTasks);

      const dayTasks = await getTasksForDate(selectedDate);
      setSelectedDayTasks(dayTasks);
    } catch (error) {
      console.error("タスクの読み込みに失敗:", error);
      Alert.alert('エラー', 'タスクの読み込みに失敗しました。');
    }
  }, [currentMonth, selectedDate]);

  // 画面にフォーカスが当たるたびにデータを再読み込み
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // --- ハンドラ関数 ---
  const handleSaveTask = async ({ id, title, startDate, endDate }: { id: number | null, title: string, startDate: Date, endDate: Date }) => {
    try {
      if (id) {
        // IDがあれば更新
        await updateTask(id, title, startDate.toISOString(), endDate.toISOString());
      } else {
        // IDがなければ新規追加
        await addTask(title, startDate.toISOString(), endDate.toISOString());
      }
      setAddTaskModalVisible(false);
      setTaskToEdit(null);
      loadData();
    } catch (error) {
      console.error('タスクの保存に失敗:', error);
      Alert.alert('エラー', 'タスクの保存に失敗しました');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      loadData(); // リストを再読み込み
    } catch (error) {
      console.error('タスクの削除に失敗:', error);
      Alert.alert('エラー', 'タスクの削除に失敗しました');
    }
  };

  const handleTaskPress = (task: Task) => {
    Alert.alert(
      'アクションを選択',
      `タスク: ${task.title}`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => handleDeleteTask(task.id),
        },
        {
          text: '編集',
          onPress: () => {
            setTaskToEdit(task); // 編集対象のタスクをセット
            setAddTaskModalVisible(true); // モーダルを開く
          },
        },
      ]
    );
  };

  const handleToggleCompleted = async (task: Task) => {
    try {
      await toggleTaskCompleted(task.id, !task.completed);
      loadData();
    } catch (error) {
      console.error('タスクの更新に失敗:', error);
      Alert.alert('エラー', 'タスクの更新に失敗しました');
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const date = new Date(currentMonth);
    date.setDate(1);
    date.setMonth(date.getMonth() + (direction === 'prev' ? -1 : 1));
    setCurrentMonth(formatDate(date));
  };

  const handleConfirmMonthPicker = (date: Date) => {
    const newDateString = formatDate(date);
    setCurrentMonth(newDateString);
    setSelectedDate(newDateString);
    setMonthPickerVisible(false);
  };

  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    allTasksInMonth.forEach(task => {
      const startDate = new Date(task.startDate.split('T')[0] + 'T00:00:00Z');
      const endDate = new Date(task.endDate.split('T')[0] + 'T00:00:00Z');

      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        const isStart = currentDate.getTime() === startDate.getTime();
        const isEnd = currentDate.getTime() === endDate.getTime();

        const existingMarking = marks[dateString] || {};
        const newPeriod = {
          startingDay: isStart,
          endingDay: isEnd,
          color: task.completed ? '#a5d6a7' : '#90caf9',
        };

        marks[dateString] = {
            ...existingMarking,
            periods: existingMarking.periods ? [...existingMarking.periods, newPeriod] : [newPeriod],
        };
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }
    });

    if (marks[selectedDate]) {
      marks[selectedDate].selected = true;
      marks[selectedDate].selectedColor = '#007AFF';
    } else {
      marks[selectedDate] = { selected: true, selectedColor: '#007AFF' };
    }
    return marks;
  }, [allTasksInMonth, selectedDate]);

  return (
    <View style={styles.container}>
      <AddTaskModal
        isVisible={isAddTaskModalVisible}
        onClose={() => {
          setAddTaskModalVisible(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        initialDate={selectedDate}
        editingTask={taskToEdit}
      />

      <DateTimePickerModal
        isVisible={isMonthPickerVisible}
        mode="date"
        onConfirm={handleConfirmMonthPicker}
        onCancel={() => setMonthPickerVisible(false)}
        locale="ja_JP"
        date={new Date(currentMonth)}
      />

      <View style={styles.monthNavigator}>
        <TouchableOpacity onPress={() => handleMonthChange('prev')} style={styles.arrowButton}>
          <Text style={styles.arrowText}>{'<'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMonthPickerVisible(true)}>
          <Text style={styles.monthText}>{new Date(currentMonth).getFullYear()}年 {new Date(currentMonth).getMonth() + 1}月</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleMonthChange('next')} style={styles.arrowButton}>
          <Text style={styles.arrowText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <Calendar
        key={currentMonth}
        current={currentMonth}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markingType={'multi-period'}
        markedDates={markedDates}
        onMonthChange={(month) => setCurrentMonth(month.dateString)}
        hideArrows={true}
        renderHeader={() => null}
        style={{ marginBottom: 8 }}
      />

      <Text style={styles.taskListHeader}>{selectedDate} のタスク</Text>
      <FlatList
        data={selectedDayTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => handleTaskPress(item)}>
            <View style={[styles.taskItem, { borderLeftColor: item.completed ? '#a5d6a7' : '#90caf9' }]}>
              <TouchableOpacity onPress={() => handleToggleCompleted(item)} style={styles.checkbox}>
                <Text style={styles.checkText}>{item.completed ? '✓' : ''}</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
                  {item.title}
                </Text>
                <Text style={styles.dateRangeText}>
                  {formatDate(new Date(item.startDate))} ~ {formatDate(new Date(item.endDate))}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>この日のタスクはありません</Text>}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setTaskToEdit(null);
          setAddTaskModalVisible(true);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  monthNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  arrowButton: {
    padding: 8,
  },
  arrowText: {
    fontSize: 22,
    color: '#007AFF',
    fontWeight: '300',
  },
  monthText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
  },
  taskListHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderLeftWidth: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkText: {
      color: '#007AFF',
      fontSize: 14,
      fontWeight: 'bold',
  },
  taskTitle: {
    fontSize: 16,
    color: '#333'
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#aaa'
  },
  dateRangeText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#888'
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    color: 'white',
    lineHeight: 34,
  },
});
