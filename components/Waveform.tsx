import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { Colors } from "../constants/Colors";

interface WaveformProps {
  isRecording: boolean;
  isPaused?: boolean;
}

const Bar = ({
  isRecording,
  isPaused,
  delay,
}: {
  isRecording: boolean;
  isPaused?: boolean;
  delay: number;
}) => {
  // Initial height is small
  const heightAnim = useRef(new Animated.Value(20)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      const animate = () => {
        animationRef.current = Animated.sequence([
          Animated.timing(heightAnim, {
            toValue: Math.random() * 80 + 30, // Random height between 30 and 110
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(heightAnim, {
            toValue: 20,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]);

        animationRef.current.start(({ finished }) => {
          if (finished) {
            animate();
          }
        });
      };

      // Stagger start
      const timeout = setTimeout(animate, delay);
      return () => {
        clearTimeout(timeout);
        if (animationRef.current) {
          animationRef.current.stop();
        }
      };
    } else {
      // Reset slowly or stop
      if (animationRef.current) {
        animationRef.current.stop();
      }
      Animated.timing(heightAnim, {
        toValue: 20,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [isRecording, isPaused, delay, heightAnim]);

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          height: heightAnim,
          backgroundColor: isRecording ? Colors.primary : Colors.border,
          opacity: isRecording ? 1 : 0.5,
        },
      ]}
    />
  );
};

export const Waveform = ({ isRecording, isPaused }: WaveformProps) => {
  // 5 bars with different start delays to create a wave effect
  const bars = [0, 100, 200, 100, 0];

  return (
    <View style={styles.container}>
      {bars.map((delay, index) => (
        <Bar
          key={index}
          isRecording={isRecording}
          isPaused={isPaused}
          delay={delay}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 150, // Fixed container height to prevent layout jumps
    gap: 12,
  },
  bar: {
    width: 12,
    borderRadius: 6,
  },
});
