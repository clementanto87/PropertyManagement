import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, H2, Body1, Caption } from '../components/ui/Typography';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/tokens';
import { apiClient } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

type Notification = {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
};

export const NotificationsScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<{ items: Notification[]; unreadCount: number }>('/notifications');
            setNotifications(response.data.items);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await apiClient.patch(`/notifications/${id}/read`, {});
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[
                styles.notificationItem,
                { backgroundColor: item.isRead ? theme.colors?.surface : theme.colors?.primaryMuted + '20' }
            ]}
            onPress={() => !item.isRead && markAsRead(item.id)}
        >
            <View style={styles.iconContainer}>
                <Ionicons
                    name={item.type === 'MESSAGE' ? 'chatbubble' : 'notifications'}
                    size={24}
                    color={item.isRead ? colors.muted : colors.primary}
                />
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Body1 style={[styles.title, !item.isRead && styles.unreadTitle]}>
                        {item.title}
                    </Body1>
                    <Caption style={styles.time}>
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </Caption>
                </View>
                <Text style={styles.message} numberOfLines={2}>
                    {item.message}
                </Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors?.text} />
                </TouchableOpacity>
                <H2>Notifications</H2>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Ionicons name="notifications-off-outline" size={48} color={colors.muted} />
                            <Body1 style={styles.emptyText}>No notifications</Body1>
                        </View>
                    }
                    refreshing={loading}
                    onRefresh={fetchNotifications}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        backgroundColor: '#fff', // Should use theme
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    backButton: {
        marginRight: spacing.md,
    },
    listContent: {
        padding: spacing.md,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: radius.md,
        marginBottom: spacing.sm,
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: spacing.md,
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontWeight: '600',
        flex: 1,
        marginRight: spacing.sm,
    },
    unreadTitle: {
        color: colors.primary,
    },
    time: {
        color: colors.muted,
    },
    message: {
        color: colors.text,
        fontSize: 14,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        marginLeft: spacing.sm,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: spacing.sm,
        color: colors.muted,
    },
});
