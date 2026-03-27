import React from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  SafeAreaView, TextInput, KeyboardAvoidingView, Platform 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// --- 1. HOME SCREEN ---
const HomeScreen = ({ navigation }: any) => {
  const TODO_DATA = [
    { id: '1', task: 'Complete Milestone 2' },
    { id: '2', task: 'Set up Stack Navigation' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Todo List</Text>
      </View>

      <FlatList
        data={TODO_DATA}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoBox}>
            <Text style={styles.todoText}>{item.task}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />

      {}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => navigation.navigate('AddTodo')} 
          <View style={styles.iconCircle}>
            <Text style={styles.plusIcon}>+</Text> 
          </View>
          <Text style={styles.buttonText}>Add New Todo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const AddTodoScreen = ({ navigation }: any) => {
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>New Task</Text>
        </View>

        <View style={styles.inputContainer}>
          {/* TITLE INPUT */}
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} placeholder="Enter task title..." />

          {/* DESCRIPTION INPUT (MULTILINE) */}
          <Text style={styles.label}>Description</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Enter details..." 
            multiline={true} 
            numberOfLines={4}
          />
        </View>

        {/* cancel save butons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelBtn]} 
            onPress={() => navigation.goBack()} // go back
          >
            <Text style={styles.actionText}>✖ Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.saveBtn]}>
            <Text style={styles.actionText}>💾 Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

//main navgation setup
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
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { paddingTop: 60, paddingBottom: 20, backgroundColor: '#6200EE', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  listContainer: { padding: 20 },
  todoBox: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 4 },
  todoText: { fontSize: 18, color: '#333' },
  footer: { padding: 20 },
//plus button styling   
  addButton: { 
    backgroundColor: '#03DAC6', 
    flexDirection: 'row', 
    padding: 15, 
    borderRadius: 30, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  iconCircle: { 
    width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.1)', 
    alignItems: 'center', justifyContent: 'center', marginRight: 10 
  },
  plusIcon: { color: 'black', fontSize: 18, fontWeight: 'bold' },
  buttonText: { color: 'black', fontSize: 18, fontWeight: 'bold' },

  // input screen styling
  inputContainer: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#666' },
  input: { backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 20, fontSize: 16 },
  textArea: { height: 120, textAlignVertical: 'top' },
  
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 20 },
  actionButton: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10, minWidth: 140, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#FF5252' },
  saveBtn: { backgroundColor: '#4CAF50' },
  actionText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});