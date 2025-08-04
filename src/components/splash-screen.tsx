import { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    const timer = setTimeout(finish, 1000);
    const events: Array<keyof DocumentEventMap> = ['click', 'keydown', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, finish));
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, finish));
    };
  }, [finish]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>💝</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 64,
  },
});

export default SplashScreen;
