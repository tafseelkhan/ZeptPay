// components/PermissionRow.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomToggle from './CustomToggle';

interface PermissionRowProps {
  label: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
  themeColors: any;
}

const PermissionRow: React.FC<PermissionRowProps> = ({
  label,
  value,
  onToggle,
  disabled,
  icon,
  description,
  themeColors,
}) => {
  return (
    <View
      style={[
        styles.permissionRow,
        { borderBottomColor: themeColors.borderLight },
      ]}
    >
      <View style={styles.permissionRowLeft}>
        {icon && (
          <View
            style={[
              styles.permissionRowIcon,
              { backgroundColor: themeColors.borderLight },
            ]}
          >
            {icon}
          </View>
        )}
        <View style={styles.permissionRowText}>
          <Text
            style={[styles.permissionRowLabel, { color: themeColors.text }]}
          >
            {label}
          </Text>
          {description && (
            <Text
              style={[
                styles.permissionRowDescription,
                { color: themeColors.textSecondary },
              ]}
            >
              {description}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.permissionRowRight}>
        <View
          style={[
            styles.permissionStatusBadge,
            value
              ? styles.permissionEnabledBadge
              : styles.permissionDisabledBadge,
          ]}
        >
          <Text
            style={[
              styles.permissionStatusText,
              { color: value ? '#10B981' : '#6B7280' },
            ]}
          >
            {value ? 'ON' : 'OFF'}
          </Text>
        </View>
        <CustomToggle
          value={value}
          onValueChange={onToggle}
          disabled={disabled}
          size="large"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  permissionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  permissionRowIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionRowText: {
    flex: 1,
  },
  permissionRowLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  permissionRowDescription: {
    fontSize: 11,
  },
  permissionRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permissionStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  permissionEnabledBadge: {
    backgroundColor: '#D1FAE5',
  },
  permissionDisabledBadge: {
    backgroundColor: '#F3F4F6',
  },
  permissionStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default PermissionRow;
