import React from 'react';
import { RefreshControl as RNRefreshControl, RefreshControlProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../theme/tokens';

interface CustomRefreshControlProps extends Omit<RefreshControlProps, 'colors' | 'tintColor'> {
    refreshing: boolean;
    onRefresh: () => void;
}

export const RefreshControl: React.FC<CustomRefreshControlProps> = ({
    refreshing,
    onRefresh,
    ...props
}) => {
    const { isDark } = useTheme();

    return (
        <RNRefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary, colors.primaryDark]}
            progressBackgroundColor={isDark ? colors.surface : '#FFFFFF'}
            {...props}
        />
    );
};
