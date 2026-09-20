import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/theme';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              accessibilityRole="button"
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>

            <Pressable
              style={[styles.button, isDestructive ? styles.destructiveButton : styles.confirmButton]}
              onPress={onConfirm}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.confirmText,
                  isDestructive ? styles.destructiveText : styles.confirmPrimaryText,
                ]}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    borderRadius: 4,
  },
  title: {
    fontSize: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.text,
    fontFamily: 'serif',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 2,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  destructiveButton: {
    backgroundColor: Colors.dangerSubtle,
    borderWidth: 1,
    borderColor: 'rgba(189, 83, 83, 0.3)',
  },
  confirmButton: {
    backgroundColor: Colors.accentSubtle,
    borderWidth: 1,
    borderColor: Colors.accentMuted,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '500',
  },
  destructiveText: {
    color: Colors.danger,
  },
  confirmPrimaryText: {
    color: Colors.accent,
  },
});
