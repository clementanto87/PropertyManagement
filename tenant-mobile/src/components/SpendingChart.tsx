import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './ui/Typography';
import { colors, spacing, radius } from '../theme/tokens';

interface ChartData {
    label: string;
    value: number;
    fullDate: string;
}

interface SpendingChartProps {
    data: ChartData[];
    height?: number;
}

const { width } = Dimensions.get('window');

export const SpendingChart: React.FC<SpendingChartProps> = ({
    data,
    height = 220
}) => {
    const [barWidth, setBarWidth] = useState(0);
    const animations = useRef(data.map(() => new Animated.Value(0))).current;
    const maxValue = Math.max(...data.map(d => d.value));

    useEffect(() => {
        Animated.stagger(100,
            animations.map(anim =>
                Animated.spring(anim, {
                    toValue: 1,
                    friction: 6,
                    tension: 40,
                    useNativeDriver: false,
                })
            )
        ).start();
    }, [data]);

    const handleLayout = (event: LayoutChangeEvent) => {
        const containerWidth = event.nativeEvent.layout.width;
        // Calculate bar width based on container width and number of items
        // Subtracting gaps between bars
        const availableWidth = containerWidth - (spacing.sm * (data.length - 1));
        setBarWidth(availableWidth / data.length);
    };

    return (
        <View style={[styles.container, { height }]}>
            <View style={styles.chartContainer} onLayout={handleLayout}>
                {data.map((item, index) => {
                    const barHeight = (item.value / maxValue) * (height - 60); // Leave space for labels

                    return (
                        <View key={index} style={[styles.barColumn, { width: barWidth }]}>
                            {/* Value Label (optional, could be shown on press) */}
                            {/* <Text style={styles.valueLabel}>${item.value}</Text> */}

                            {/* Animated Bar */}
                            <View style={styles.barTrack}>
                                <Animated.View
                                    style={[
                                        styles.bar,
                                        {
                                            height: animations[index].interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, barHeight],
                                            }),
                                            opacity: animations[index],
                                        },
                                    ]}
                                >
                                    <LinearGradient
                                        colors={(index === data.length - 1 ? colors.gradientGreen : [colors.primaryLight, colors.primary]) as any}
                                        style={styles.gradient}
                                        start={{ x: 0, y: 1 }}
                                        end={{ x: 0, y: 0 }}
                                    />
                                </Animated.View>
                            </View>

                            {/* X-Axis Label */}
                            <Text style={[
                                styles.label,
                                index === data.length - 1 && styles.activeLabel
                            ]}>
                                {item.label}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Y-Axis Lines (Background) */}
            <View style={styles.gridContainer} pointerEvents="none">
                {[0, 0.5, 1].map((tick) => (
                    <View key={tick} style={[styles.gridLine, { bottom: tick * (height - 60) + 30 }]} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'relative',
    },
    chartContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingBottom: 30, // Space for labels
        zIndex: 10,
    },
    barColumn: {
        height: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: spacing.xs,
    },
    barTrack: {
        width: '60%', // Bar is thinner than the column
        height: '100%',
        justifyContent: 'flex-end',
        borderRadius: radius.sm,
        backgroundColor: 'rgba(0,0,0,0.03)',
        overflow: 'hidden',
    },
    bar: {
        width: '100%',
        borderRadius: radius.sm,
    },
    gradient: {
        flex: 1,
        borderRadius: radius.sm,
    },
    label: {
        fontSize: 12,
        color: colors.muted,
        textAlign: 'center',
        fontWeight: '500',
    },
    activeLabel: {
        color: colors.ink,
        fontWeight: '700',
    },
    valueLabel: {
        fontSize: 10,
        color: colors.muted,
        marginBottom: 4,
    },
    gridContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        paddingBottom: 30,
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: colors.divider,
        opacity: 0.5,
    },
});
