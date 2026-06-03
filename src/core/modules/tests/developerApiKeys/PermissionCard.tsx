// components/PermissionCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PermissionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  color?: string;
  themeColors: any;
}

const PermissionCard: React.FC<PermissionCardProps> = ({
  title,
  icon,
  children,
  color = '#3B82F6',
  themeColors,
}) => {
  return (
    <View
      style={[
        styles.permissionCard,
        {
          backgroundColor: themeColors.cardBackground,
          borderColor: themeColors.border,
        },
      ]}
    >
      <View
        style={[
          styles.permissionCardHeader,
          {
            borderBottomColor: color + '20',
            backgroundColor: themeColors.borderLight,
          },
        ]}
      >
        <View
          style={[styles.permissionCardIcon, { backgroundColor: color + '15' }]}
        >
          {icon}
        </View>
        <Text style={[styles.permissionCardTitle, { color: themeColors.text }]}>
          {title}
        </Text>
      </View>
      <View style={styles.permissionCardContent}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  permissionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  permissionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
  },
  permissionCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionCardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  permissionCardContent: {
    padding: 12,
  },
});

export default PermissionCard;
