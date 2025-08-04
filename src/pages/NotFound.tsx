import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.message}>Oops! Page not found</Text>
        <TouchableOpacity onPress={() => Linking.openURL('/')}>
          <Text style={styles.link}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    color: '#4b5563',
    marginBottom: 16,
  },
  link: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
});

export default NotFound;
