import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';

// Hardcoded data for Milestone 1
const DATA = [
  { id: '1', task: 'Complete Mobile App Assignment' },
  { id: '2', task: 'Buy groceries for the week' },
  { id: '3', task: 'Go for a 30-minute run' },
  { id: '4', task: 'Read 10 pages of a book' },
];

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* 1. TITLE */}
      <View style={styles.header}>
        <Text style={styles.title}>My Todo List</Text>
      </View>

      {/* 2. TODO LIST DISPLAY (Hardcoded) */}
      <FlatList
        data={DATA}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <Text style={styles.todoText}>{item.task}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* 3. ADD NEW TODO BUTTON (Non-functional) */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} activeOpacity={0.7}>
          <Text style={styles.buttonText}>Add New Todo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Light grey background
  },
  header: {
    padding: 20,
    backgroundColor: '#6200EE', // Purple header
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 20,
  },
  todoItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2, // Shadow for Android
  },
  todoText: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#03DAC6', // Teal button
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;