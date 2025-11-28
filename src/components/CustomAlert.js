import React, { useEffect, useState, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";

const CustomAlert = ({ visible, title, message, onClose }) => {
  const [showModal, setShowModal] = useState(visible);
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setShowModal(false));
    }
  }, [visible]);

  if (!showModal) return null;

  return (
    <Modal
      transparent={true}
      visible={showModal}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.alertContainer, { transform: [{ scale: scaleValue }] }]}>
          {/* Barra decorativa superior */}
          <View style={styles.decorativeBar} />
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.9}>
            <Text style={styles.buttonText}>Entendido</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: responsiveWidth(80),
    backgroundColor: 'white',
    borderRadius: 24,
    paddingHorizontal: responsiveWidth(6),
    paddingBottom: responsiveHeight(3),
    paddingTop: responsiveHeight(4),
    alignItems: 'center',
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  decorativeBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: responsiveHeight(0.8),
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: responsiveFontSize(2.2),
    color: '#1F2937',
    marginBottom: responsiveHeight(1.5),
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Poppins_400Regular',
    fontSize: responsiveFontSize(1.7),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: responsiveHeight(3),
    lineHeight: responsiveFontSize(2.4),
  },
  button: {
    backgroundColor: '#FF5A1F', // Naranja principal
    paddingVertical: responsiveHeight(1.5),
    width: '100%',
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: "#FF5A1F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: responsiveFontSize(1.8),
  }
});

export default CustomAlert;