import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, CheckCircle2, Eye, X } from 'lucide-react-native';
import { useAuth } from '../../../context/auth-context';
import { useDuo } from '../../../context/duo-context';
import { Colors } from '../../../constants/theme';
import { Question } from '../../../types';

export default function QuestionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { questions, answerQuestion } = useDuo();

  const [answeringQuestion, setAnsweringQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState('');

  const handleOpenAnswer = (q: Question) => {
    const existing = q.answers?.find((a) => a.user_id === user?.id);
    setAnswerText(existing?.answer || '');
    setAnsweringQuestion(q);
  };

  const handleSaveAnswer = async () => {
    if (!answeringQuestion || !answerText.trim()) return;
    await answerQuestion(answeringQuestion.id, answerText.trim());
    setAnsweringQuestion(null);
    setAnswerText('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Back"
        >
          <ArrowLeft color={Colors.text} size={22} />
        </Pressable>

        <Text style={styles.headerTitle}>SHARED QUESTIONS</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
        ListHeaderComponent={
          <View style={styles.introBox}>
            <Text style={styles.introTitle}>DOUBLE-BLIND PROMPTS</Text>
            <Text style={styles.introSubtitle}>
              Both of you answer in secret. Answers only reveal once both people have submitted their response.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const myAnswer = item.answers?.find((a) => a.user_id === user?.id);
          const hasPartnerAnswered = (item.answers?.length || 0) >= 2 || item.both_answered;
          const isRevealed = Boolean(myAnswer && hasPartnerAnswered);

          return (
            <View style={styles.card}>
              <Text style={styles.promptDate}>{item.question_date}</Text>
              <Text style={styles.questionText}>“{item.question}”</Text>

              {/* Status banner */}
              <View style={styles.statusRow}>
                {isRevealed ? (
                  <View style={styles.badgeRevealed}>
                    <Eye size={12} color={Colors.accent} />
                    <Text style={styles.badgeTextRevealed}>BOTH ANSWERED • REVEALED</Text>
                  </View>
                ) : myAnswer ? (
                  <View style={styles.badgeWaiting}>
                    <Lock size={12} color={Colors.warning} />
                    <Text style={styles.badgeTextWaiting}>YOUR ANSWER SUBMITTED • WAITING FOR PARTNER</Text>
                  </View>
                ) : (
                  <View style={styles.badgePending}>
                    <CheckCircle2 size={12} color={Colors.textMuted} />
                    <Text style={styles.badgeTextPending}>AWAITING YOUR RESPONSE</Text>
                  </View>
                )}
              </View>

              {/* Answers block */}
              {isRevealed ? (
                <View style={styles.revealedBlock}>
                  {item.answers?.map((ans, idx) => (
                    <View key={idx} style={styles.answerRow}>
                      <Text style={styles.answerAuthor}>{ans.author_name || 'Friend'}:</Text>
                      <Text style={styles.answerQuote}>“{ans.answer}”</Text>
                    </View>
                  ))}
                </View>
              ) : myAnswer ? (
                <View style={styles.blindBox}>
                  <Text style={styles.blindPreviewTitle}>Your private answer:</Text>
                  <Text style={styles.blindPreviewText}>“{myAnswer.answer}”</Text>
                  <Pressable style={styles.editAnswerLink} onPress={() => handleOpenAnswer(item)}>
                    <Text style={styles.editAnswerText}>Edit Answer</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.answerPromptButton}
                  onPress={() => handleOpenAnswer(item)}
                >
                  <Text style={styles.answerPromptText}>ANSWER IN SECRET</Text>
                </Pressable>
              )}
            </View>
          );
        }}
      />

      {/* Answer Modal */}
      <Modal
        visible={Boolean(answeringQuestion)}
        animationType="fade"
        transparent
        onRequestClose={() => setAnsweringQuestion(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ANSWER IN SECRET</Text>
              <Pressable hitSlop={10} onPress={() => setAnsweringQuestion(null)}>
                <X size={20} color={Colors.text} />
              </Pressable>
            </View>

            <Text style={styles.modalQuestion}>
              “{answeringQuestion?.question}”
            </Text>

            <TextInput
              style={styles.answerInput}
              placeholder="Your answer will stay hidden until your friend answers too..."
              placeholderTextColor={Colors.textMuted}
              multiline
              value={answerText}
              onChangeText={setAnswerText}
              autoFocus
            />

            <Pressable style={styles.saveAnswerButton} onPress={handleSaveAnswer}>
              <Text style={styles.saveAnswerText}>SUBMIT RESPONSE</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 12,
    letterSpacing: 2,
    color: Colors.text,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  introBox: {
    paddingVertical: 10,
    gap: 6,
  },
  introTitle: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  introSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    gap: 12,
  },
  promptDate: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textMuted,
  },
  questionText: {
    fontSize: 17,
    fontFamily: 'serif',
    lineHeight: 24,
    color: Colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  badgeRevealed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.accentMuted,
  },
  badgeTextRevealed: {
    fontSize: 9,
    letterSpacing: 1.2,
    color: Colors.accent,
    fontWeight: '600',
  },
  badgeWaiting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(209, 156, 74, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(209, 156, 74, 0.3)',
  },
  badgeTextWaiting: {
    fontSize: 9,
    letterSpacing: 1.2,
    color: Colors.warning,
    fontWeight: '600',
  },
  badgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: Colors.surfaceElevated,
  },
  badgeTextPending: {
    fontSize: 9,
    letterSpacing: 1.2,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  revealedBlock: {
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  answerRow: {
    gap: 4,
  },
  answerAuthor: {
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.accent,
    fontWeight: '600',
  },
  answerQuote: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  blindBox: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 6,
  },
  blindPreviewTitle: {
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  blindPreviewText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  editAnswerLink: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  editAnswerText: {
    fontSize: 11,
    color: Colors.accent,
  },
  answerPromptButton: {
    height: 44,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  answerPromptText: {
    color: Colors.text,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 12,
    letterSpacing: 2,
    color: Colors.text,
    fontWeight: '600',
  },
  modalQuestion: {
    fontSize: 15,
    fontFamily: 'serif',
    color: Colors.text,
    lineHeight: 22,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    minHeight: 100,
    padding: 12,
    color: Colors.text,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  saveAnswerButton: {
    height: 48,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveAnswerText: {
    color: Colors.text,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
  },
});
