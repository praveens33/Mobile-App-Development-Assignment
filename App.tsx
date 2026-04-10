import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  SafeAreaView, TextInput, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

// home screen
const HomeScreen = ({ navigation }: any) => {
  const [todos, setTodos] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isFocused = useIsFocused(); 

  useEffect(() => {
    if (isFocused) loadTodos();
  }, [isFocused]);

  const loadTodos = async () => {
    const stored = await AsyncStorage.getItem('todos');
    if (stored) setTodos(JSON.parse(stored));
  };

  const deleteTodo = async (id: string) => {
    const updated = todos.filter(t => t.id !== id);
    setTodos(updated);
    await AsyncStorage.setItem('todos', JSON.stringify(updated));
  };

  const finishTodo = async (id: string) => {
    const updated = todos.map(t => t.id === id ? { ...t, isFinished: true } : t);
    setTodos(updated);
    await AsyncStorage.setItem('todos', JSON.stringify(updated));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>My Todo List</Text></View>
      
      <FlatList
        data={todos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.todoBox, item.isFinished && styles.finishedBox]}>
            <View style={styles.todoRow}>
              <Text style={[styles.todoText, item.isFinished && styles.strikeText]}>{item.title}</Text>
              <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                <Text style={styles.caret}>{expandedId === item.id ? '▲' : '▼'}</Text>
              </TouchableOpacity>
            </View>

            {expandedId === item.id && (
              <View style={styles.expandedContent}>
                <Text style={styles.descText}>{item.description}</Text>
                <View style={styles.controlPanel}>
                  {!item.isFinished && (
                    <TouchableOpacity onPress={() => finishTodo(item.id)}>
                      <Text style={styles.iconBtn}>✅</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => deleteTodo(item.id)}>
                    <Text style={styles.iconBtn}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddTodo')}>
          <Text style={styles.buttonText}>+ Add New Todo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

//add todo screen
const AddTodoScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Both Title and Description are required!');
      return;
    }

    const newTodo = {
      id: Date.now().toString(),
      title,
      description,
      isFinished: false,
    };

    const stored = await AsyncStorage.getItem('todos');
    const todos = stored ? JSON.parse(stored) : [];
    todos.push(newTodo);
    
    await AsyncStorage.setItem('todos', JSON.stringify(todos));
    Alert.alert('Success', 'Todo Added Successfully');
    setTitle('');
    setDescription('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Add New Task</Text></View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Title..." />
        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          value={description} onChangeText={setDescription}
          multiline numberOfLines={4} placeholder="Details..." 
        />
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.actionButton, styles.cancelBtn]} onPress={() => navigation.goBack()}>
          <Text style={styles.actionText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.saveBtn]} onPress={handleSave}>
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddTodo" component={AddTodoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { paddingTop: 50, paddingBottom: 20, backgroundColor: '#6200EE', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  listContainer: { padding: 15 },
  todoBox: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 3 },
  todoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  todoText: { fontSize: 18, fontWeight: '600' },
  caret: { fontSize: 20, color: '#6200EE' },
  expandedContent: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  descText: { fontSize: 16, color: '#666', marginBottom: 15 },
  controlPanel: { flexDirection: 'row', justifyContent: 'flex-end' },
  iconBtn: { fontSize: 24, marginLeft: 20 },
  footer: { padding: 20 },
  addButton: { backgroundColor: '#03DAC6', padding: 15, borderRadius: 30, alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: 'bold' },
  inputContainer: { padding: 20 },
  label: { fontSize: 16, marginBottom: 5, fontWeight: 'bold' },
  input: { backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 20 },
  textArea: { height: 100, textAlignVertical: 'top' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around' },
  actionButton: { padding: 15, borderRadius: 10, minWidth: 120, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#757575' },
  saveBtn: { backgroundColor: '#4CAF50' },
  actionText: { color: 'white', fontWeight: 'bold' },
  finishedBox: { opacity: 0.6, backgroundColor: '#e8f5e9' },
  strikeText: { textDecorationLine: 'line-through', color: '#888' },
});