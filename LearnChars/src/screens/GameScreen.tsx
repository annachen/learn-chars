import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { GameCanvas } from '../components/GameCanvas';

// Example characters - you can replace these with your own
const sampleCharacters = ['我', '你', '好', '世', '界'];

export const GameScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <GameCanvas characters={sampleCharacters} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
});
