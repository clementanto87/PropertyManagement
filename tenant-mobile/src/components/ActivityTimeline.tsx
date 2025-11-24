import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, H3, Body1, Caption } from './ui/Typography';
import { colors, spacing, radius, shadows } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { Activity } from '../types/api';

interface ActivityTimelineProps {
    activities: Activity[];
    onActivityPress?: (activity: Activity) => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
    activities,
    onActivityPress
}) => {
    const fadeAnims = useRef(activities.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        Animated.stagger(100, fadeAnims.map(anim =>
            Animated.timing(anim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            })
        )).start();
    }, []);

    const formatTimeAgo = (timestamp: string | Date) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    if (!activities || activities.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No recent activity</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {activities.map((activity, index) => {
                const isLast = index === activities.length - 1;

                return (
                    <Animated.View
                        key={activity.id}
                        style={[
                            styles.activityItem,
                            { opacity: fadeAnims[index] }
                        ]}
                    >
                        {/* Timeline Line */}
                        {!isLast && <View style={styles.timelineLine} />}

                        {/* Icon Badge */}
                        <LinearGradient
                            colors={activity.gradient}
                            style={styles.iconBadge}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name={activity.icon as any} size={16} color="#FFFFFF" />
                        </LinearGradient>

                        {/* Content */}
                        <TouchableOpacity
                            style={styles.contentContainer}
                            onPress={() => onActivityPress && onActivityPress(activity)}
                            activeOpacity={0.7}
                            disabled={!onActivityPress}
                        >
                            <View style={styles.headerRow}>
                                <Body1 style={styles.title}>{activity.title}</Body1>
                                <Caption style={styles.timestamp}>{formatTimeAgo(activity.timestamp)}</Caption>
                            </View>

                            <Text style={styles.description} numberOfLines={2}>
                                {activity.description}
                            </Text>

                            {activity.actionLabel && (
                                <View style={styles.actionButton}>
                                    <Text style={styles.actionText}>{activity.actionLabel}</Text>
                                    <Ionicons name="chevron-forward" size={12} color={colors.primary} />
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.sm,
    },
    emptyContainer: {
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: colors.muted,
        fontStyle: 'italic',
    },
    activityItem: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        left: 16, // Center of the 32px icon
        top: 32,
        bottom: -spacing.lg,
        width: 2,
        backgroundColor: colors.border,
        zIndex: 0,
    },
    iconBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
        zIndex: 1,
        ...shadows.sm,
    },
    contentContainer: {
        flex: 1,
        paddingTop: 4, // Align with icon center roughly
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    title: {
        fontWeight: '600',
        color: colors.ink,
        flex: 1,
        marginRight: spacing.sm,
    },
    timestamp: {
        color: colors.muted,
        fontSize: 11,
    },
    description: {
        color: colors.muted,
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 4,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    actionText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '600',
        marginRight: 2,
    },
});
