import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Platform, Modal } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Task } from '../lib/database';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: (task: { id: number | null, title: string, startDate: Date, endDate: Date }) => void;
  initialDate: string;
  editingTask: Task | null;
}

const formatTime = (date: Date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
const formatDateTime = (date: Date) => `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${formatTime(date)}`;

export default function AddTaskModal({ isVisible, onClose, onSave, initialDate, editingTask }: Props) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'time' | 'datetime'>('time');
  const [currentPicker, setCurrentPicker] = useState<'start' | 'end'>('start');

  useEffect(() => {
    if (isVisible) {
      if (editingTask) {
        setTitle(editingTask.title);
        setStartDate(new Date(editingTask.startDate));
        setEndDate(new Date(editingTask.endDate));
      } else {
        const baseDate = new Date(initialDate + 'T09:00:00');
        const endInitDate = new Date(baseDate.getTime() + 60 * 60 * 1000);
        setTitle('');
        setStartDate(baseDate);
        setEndDate(endInitDate);
      }
    }
  }, [isVisible, editingTask, initialDate]);

  const showPicker = (picker: 'start' | 'end') => {
    setCurrentPicker(picker);
    setPickerMode(picker === 'start' ? 'time' : 'datetime');
    setPickerVisible(true);
  };

  const hidePicker = () => setPickerVisible(false);

  const handleConfirm = (date: Date) => {
    if (currentPicker === 'start') {
      const newStartDate = editingTask ? new Date(startDate) : new Date(initialDate);
      newStartDate.setHours(date.getHours(), date.getMinutes());
      setStartDate(newStartDate);
    } else {
      setEndDate(date);
    }
    hidePicker();
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('タスク名を入力してください');
      return;
    }
    onSave({ id: editingTask ? editingTask.id : null, title, startDate, endDate });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true} // ★ ポイント1: 背景を透過させる設定
      visible={isVisible}
      onRequestClose={onClose}
    >
      {/* ★ ポイント2: 画面全体を覆う、半透明の背景View */}
      <View style={styles.centeredView}>
        {/* ★ ポイント3: 白いコンテンツ表示エリア */}
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{editingTask ? 'タスクの編集' : '新しいタスク'}</Text>

          <TextInput
            style={styles.input}
            placeholder="タスク名"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.dateLabel}>日付: {formatDate(startDate)}</Text>

          <View style={styles.dateRow}>
            <Text>開始時間:</Text>
            <TouchableOpacity onPress={() => showPicker('start')}>
              <Text style={styles.dateText}>{formatTime(startDate)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateRow}>
            <Text>終了日時:</Text>
            <TouchableOpacity onPress={() => showPicker('end')}>
              <Text style={styles.dateText}>{formatDateTime(endDate)}</Text>
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={isPickerVisible}
            mode={pickerMode}
            onConfirm={handleConfirm}
            onCancel={hidePicker}
            locale="ja_JP"
            date={currentPicker === 'start' ? startDate : endDate}
          />

          <View style={styles.buttonRow}>
            <Button title="キャンセル" onPress={onClose} color="#888" />
            <Button title="保存" onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const formatDate = (date: Date): string => `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

const styles = StyleSheet.create({
  centeredView: { // ★ 背景オーバーレイのスタイル
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // 半透明の黒
  },
  modalView: { // ★ 白いコンテンツ部分のスタイル
    width: '90%',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
});
