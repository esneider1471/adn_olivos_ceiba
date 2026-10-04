import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, fontSizes, radii, spacing } from '../theme';

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** Muestra un spinner y deshabilita el botón. */
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const buttonVariantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: 'transparent' },
};

const buttonTextColors: Record<ButtonVariant, string> = {
  primary: '#ffffff',
  secondary: colors.ink,
  danger: '#ffffff',
  ghost: colors.inkSoft,
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const textColor = buttonTextColors[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        buttonVariantStyles[variant],
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && { opacity: 0.85 },
        style,
      ]}
    >
      {loading && (
        <ActivityIndicator size="small" color={textColor} style={styles.buttonSpinner} />
      )}
      <Text style={[styles.buttonLabel, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Field (input / textarea)                                            */
/* ------------------------------------------------------------------ */

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  /** Modo contraseña. */
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'username' | 'email' | 'password' | 'off';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  autoCapitalize = 'sentences',
  autoComplete = 'off',
  keyboardType = 'default',
  multiline = false,
  numberOfLines,
  maxLength,
  onBlur,
  onSubmitEditing,
}: FieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          multiline && styles.fieldInputMultiline,
          error ? { borderColor: colors.danger } : null,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkSoft}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : undefined}
        maxLength={maxLength}
        onBlur={onBlur}
        onSubmitEditing={onSubmitEditing}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export function Card({
  style,
  children,
}: {
  style?: ViewStyle;
  children: React.ReactNode;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/* ------------------------------------------------------------------ */
/* Alert                                                               */
/* ------------------------------------------------------------------ */

type AlertTone = 'error' | 'success';

const alertToneStyles: Record<AlertTone, ViewStyle & { color: string }> = {
  error: {
    backgroundColor: colors.danger + '0D',
    borderColor: colors.danger + '4D',
    color: colors.danger,
  },
  success: {
    backgroundColor: colors.success + '0D',
    borderColor: colors.success + '4D',
    color: colors.success,
  },
};

export function Alert({
  tone,
  children,
}: {
  tone: AlertTone;
  children: React.ReactNode;
}) {
  const { color, ...box } = alertToneStyles[tone];
  return (
    <View accessibilityRole="alert" style={[styles.alert, box]}>
      <Text style={{ color }}>{children}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Spinner                                                             */
/* ------------------------------------------------------------------ */

export function Spinner({ size = 'large' }: { size?: 'small' | 'large' }) {
  return <ActivityIndicator size={size} color={colors.inkSoft} />;
}

/* ------------------------------------------------------------------ */
/* EmptyState                                                          */
/* ------------------------------------------------------------------ */

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {hint ? <Text style={styles.emptyHint}>{hint}</Text> : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    minHeight: 40,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonSpinner: {
    marginRight: spacing.xs,
  },
  buttonLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  fieldContainer: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.ink,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  fieldInputMultiline: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  fieldError: {
    fontSize: fontSizes.sm,
    color: colors.danger,
  },
  card: {
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  alert: {
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: 4,
  },
  emptyTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.ink,
  },
  emptyHint: {
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
});
