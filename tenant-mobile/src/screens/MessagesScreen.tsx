import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { communicationService } from '../services/communications';
import { Message } from '../types';
import { colors, spacing, radius, typography } from '../theme/tokens';
import { useTheme } from '../contexts/ThemeContext';

export const MessagesScreen = () => {
    const { theme } = useTheme();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const fetchMessages = async () => {
        try {
            const data = await communicationService.getChatMessages();
            // Cast Communication[] to Message[] as we updated the service but maybe not the return type in service definition fully
            // Actually service returns Communication[], but we want Message[]. 
            // Since we updated types/index.ts, Message is separate. 
            // Ideally service should return Message[]. 
            // For now, we assume the data structure matches Message.
            setMessages(data as unknown as Message[]);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            setIsSending(true);
            await communicationService.sendChatMessage(newMessage);
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        // Backend logic: 
        // Tenant sends -> direction = INBOUND
        // Manager sends -> direction = OUTBOUND
        const isMyMessage = item.direction === 'INBOUND';

        return (
            <View
                style={[
                    styles.messageContainer,
                    isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer,
                ]}
            >
                <View
                    style={[
                        styles.messageBubble,
                        isMyMessage
                            ? { backgroundColor: colors.primary, borderBottomRightRadius: 0 }
                            : { backgroundColor: theme.colors?.surface || '#FFFFFF', borderBottomLeftRadius: 0, borderWidth: 1, borderColor: colors.border },
                    ]}
                >
                    <Text
                        style={[
                            styles.messageText,
                            isMyMessage ? { color: '#FFFFFF' } : { color: (theme.colors as any)?.text || colors.ink },
                        ]}
                    >
                        {item.content}
                    </Text>
                </View>
                <View style={styles.messageFooter}>
                    {!isMyMessage && (
                        <Text style={styles.senderName}>Property Manager</Text>
                    )}
                    <Text style={styles.timestamp}>
                        {format(new Date(item.createdAt), 'h:mm a')}
                    </Text>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors?.background || colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors?.background || colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: (theme.colors as any)?.text || colors.ink }]}>Messages</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="chatbubbles-outline" size={32} color={colors.primary} />
                        </View>
                        <Text style={[styles.emptyText, { color: (theme.colors as any)?.text || colors.ink }]}>No messages yet</Text>
                        <Text style={styles.emptySubtext}>Start the conversation below</Text>
                    </View>
                }
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputContainer, { backgroundColor: theme.colors?.surface || '#FFFFFF', borderTopColor: colors.border }]}>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors?.background || colors.background,
                                color: (theme.colors as any)?.text || colors.ink,
                                borderColor: colors.border
                            }
                        ]}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="Type a message..."
                        placeholderTextColor={colors.muted}
                        multiline
                        maxLength={1000}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!newMessage.trim() || isSending) && styles.sendButtonDisabled,
                        ]}
                        onPress={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                    >
                        {isSending ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Ionicons name="send" size={20} color="#FFFFFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
    },
    messageContainer: {
        marginBottom: spacing.md,
        maxWidth: '80%',
    },
    myMessageContainer: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    theirMessageContainer: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    messageBubble: {
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    senderName: {
        fontSize: 11,
        color: colors.muted,
        fontWeight: '600',
    },
    timestamp: {
        fontSize: 11,
        color: colors.muted,
    },
    inputContainer: {
        padding: spacing.md,
        borderTopWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    input: {
        flex: 1,
        height: 44,
        borderRadius: radius.full,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        fontSize: 15,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.muted,
    },
});
