import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'button'
  | 'caption'
  | 'overline';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikeThrough?: boolean;
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body1',
  color,
  align = 'left',
  bold,
  italic,
  underline,
  strikeThrough,
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  // Safety check
  if (!theme || !theme.colors) {
    return <RNText style={style} {...props}>{children}</RNText>;
  }

  const getVariantStyle = () => {
    switch (variant) {
      case 'h1':
        return { 
          fontSize: 32, 
          lineHeight: 40, 
          fontWeight: '800' as const,
          marginBottom: theme.spacing?.md || 16,
        };
      case 'h2':
        return { 
          fontSize: 28, 
          lineHeight: 36, 
          fontWeight: '700' as const,
          marginBottom: theme.spacing?.md || 16,
        };
      case 'h3':
        return { 
          fontSize: 24, 
          lineHeight: 32, 
          fontWeight: '600' as const,
          marginBottom: theme.spacing?.sm || 8,
        };
      case 'h4':
        return { 
          fontSize: 20, 
          lineHeight: 28, 
          fontWeight: '600' as const,
          marginBottom: theme.spacing?.sm || 8,
        };
      case 'subtitle1':
        return { 
          fontSize: 16, 
          lineHeight: 24, 
          fontWeight: '500' as const,
          color: theme.colors.muted || '#64748B',
        };
      case 'subtitle2':
        return { 
          fontSize: 14, 
          lineHeight: 20, 
          fontWeight: '500' as const,
          color: theme.colors.muted || '#64748B',
        };
      case 'body1':
        return { 
          fontSize: 16, 
          lineHeight: 24,
        };
      case 'body2':
        return { 
          fontSize: 14, 
          lineHeight: 20,
        };
      case 'button':
        return { 
          fontSize: 16, 
          lineHeight: 24, 
          fontWeight: '600' as const,
          textAlign: 'center' as const,
        };
      case 'caption':
        return { 
          fontSize: 12, 
          lineHeight: 16,
          color: theme.colors.muted || '#64748B',
        };
      case 'overline':
        return { 
          fontSize: 10, 
          lineHeight: 16, 
          textTransform: 'uppercase' as const,
          letterSpacing: 1.5,
          color: theme.colors.muted || '#64748B',
        };
      default:
        return {};
    }
  };

  return (
    <RNText
      style={[
        {
          color: color || theme.colors.text || '#0F172A',
          textAlign: align,
          fontStyle: italic ? 'italic' : 'normal',
          textDecorationLine: underline
            ? 'underline'
            : strikeThrough
            ? 'line-through'
            : 'none',
          fontWeight: bold ? 'bold' : 'normal',
        },
        getVariantStyle(),
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

// Export a pre-styled version of Text for common use cases
export const H1: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h1" {...props} />
);

export const H2: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h2" {...props} />
);

export const H3: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h3" {...props} />
);

export const H4: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h4" {...props} />
);

export const Subtitle1: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="subtitle1" {...props} />
);

export const Subtitle2: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="subtitle2" {...props} />
);

export const Body1: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body1" {...props} />
);

export const Body2: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body2" {...props} />
);

export const ButtonText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="button" {...props} />
);

export const Caption: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="caption" {...props} />
);

export const Overline: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="overline" {...props} />
);
