import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';

export default function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessages([...messages, trimmed]);
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pulse</Text>
      <Text style={styles.subtitle}>
        Stay connected with your partner through shared messages
      </Text>
      <FlatList
        style={styles.messages}
        data={messages}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => <Text style={styles.message}>• {item}</Text>}
      />
      <TextInput
        style={styles.input}
        placeholder="Type a message"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  messages: {
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    width: '100%',
    marginBottom: 8,
  },
});

