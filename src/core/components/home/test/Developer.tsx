import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

const { width: screenWidth } = Dimensions.get('window');
import BottomNavigation from './BottomNavigation';

// API Response Interfaces
interface UserData {
  id: string;
  name: string;
  email: string;
  company: string;
  isLive: boolean;
  totalBalance: number;
  totalPayments: number;
  activeDevelopers: number;
  totalTransactions: number;
  recentTransactions: Transaction[];
  revenueData: RevenueData[];
  paymentMethods: PaymentMethod[];
}

interface Transaction {
  id: string;
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  date: string;
  type: 'Credit Card' | 'Bank Transfer' | 'PayPal' | 'Debit Card' | 'Apple Pay';
  customer: string;
  currency: string;
}

interface RevenueData {
  day: string;
  revenue: number;
}

interface PaymentMethod {
  name: string;
  percentage: number;
  color: string;
}

// Component Props Interfaces
interface StatCard {
  id: number;
  title: string;
  value: string;
  change: string;
  icon: 'wallet' | 'credit-card' | 'users' | 'activity';
  color: string;
}

interface ActionButtonProps {
  icon: string;
  title: string;
  onPress: () => void;
  color?: string;
}

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: 'wallet' | 'credit-card' | 'users' | 'activity';
  color: string;
}

interface TransactionItemProps {
  item: Transaction;
  index: number;
}

interface PieChartData {
  x: string;
  y: number;
  color: string;
}

// Header Component with Live/Test Mode
const Header = ({
  userName,
  companyName,
  isLive,
}: {
  userName: string;
  companyName: string;
  isLive: boolean;
}) => {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.accountName}>{userName}</Text>
        <Text style={styles.companyText}>{companyName}</Text>
      </View>
      <View style={styles.headerRight}>
        <View
          style={[
            styles.modeBadge,
            {
              backgroundColor: isLive ? '#10b98115' : '#f3f4f6',
              borderColor: isLive ? '#10b981' : '#6b7280',
            },
          ]}
        >
          {isLive ? (
            <>
              <Icon name="flash" size={14} color="#10b981" />
              <Text style={[styles.modeText, { color: '#10b981' }]}>
                Live Mode
              </Text>
            </>
          ) : (
            <>
              <Feather name="eye" size={14} color="#6b7280" />
              <Text style={[styles.modeText, { color: '#6b7280' }]}>
                Test Mode
              </Text>
            </>
          )}
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Icon name="person-circle-outline" size={32} color="#4f46e5" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Stats Card Component
const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
}) => {
  const getIconName = (): string => {
    switch (icon) {
      case 'wallet':
        return 'dollar-sign';
      case 'credit-card':
        return 'card';
      case 'users':
        return 'people';
      case 'activity':
        return 'trending-up';
      default:
        return 'dollar-sign';
    }
  };

  const iconName = getIconName();
  const isFeatherIcon = icon === 'wallet';
  const IconComponent = isFeatherIcon ? Feather : Icon;

  return (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsCardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <IconComponent name={iconName} size={20} color={color} />
        </View>
        <Text style={styles.changeText}>
          <Icon name="trending-up" size={12} color="#10b981" /> {change}
        </Text>
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  );
};

// Simple Bar Chart Component
const SimpleBarChart = ({
  data,
  labels,
  height = 150,
}: {
  data: number[];
  labels: string[];
  height?: number;
}) => {
  const maxValue = Math.max(...data);
  const chartWidth = screenWidth - 80;

  if (maxValue === 0) {
    return (
      <View
        style={{
          height,
          width: chartWidth,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#6b7280' }}>No data available</Text>
      </View>
    );
  }

  return (
    <View style={{ height, width: chartWidth }}>
      <View
        style={{
          flexDirection: 'row',
          height: height - 30,
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        {data.map((value, index) => (
          <View key={index} style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 20,
                height: (value / maxValue) * (height - 50),
                backgroundColor: '#6366f1',
                borderRadius: 4,
                marginHorizontal: 4,
              }}
            />
            <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>
              {labels[index]}
            </Text>
          </View>
        ))}
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 8,
        }}
      >
        {data.map((value, index) => (
          <Text
            key={index}
            style={{
              fontSize: 10,
              color: '#111827',
              fontWeight: '500' as const,
            }}
          >
            ${value.toLocaleString()}
          </Text>
        ))}
      </View>
    </View>
  );
};

// Simple Pie Chart Component
const SimplePieChart = ({ data }: { data: PieChartData[] }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View
        style={{
          width: 120,
          height: 120,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#f3f4f6',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600' as const,
              color: '#111827',
            }}
          >
            Payment
          </Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>Methods</Text>
        </View>
      </View>
      <View style={{ marginLeft: 20, flex: 1 }}>
        {data.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: item.color,
                borderRadius: 3,
                marginRight: 8,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: '#111827',
                  fontWeight: '500' as const,
                }}
              >
                {item.x}
              </Text>
              <Text style={{ fontSize: 11, color: '#6b7280' }}>{item.y}%</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Transaction Item Component
const TransactionItem: React.FC<TransactionItemProps> = ({ item, index }) => {
  const getStatusColor = (status: Transaction['status']): string => {
    switch (status) {
      case 'Success':
        return '#10b981';
      case 'Pending':
        return '#f59e0b';
      case 'Failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: Transaction['status']): string => {
    switch (status) {
      case 'Success':
        return 'checkmark-circle';
      case 'Pending':
        return 'time';
      case 'Failed':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const statusColor = getStatusColor(item.status);
  const statusIcon = getStatusIcon(item.status);

  return (
    <View
      style={[
        styles.transactionItem,
        { backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' },
      ]}
    >
      <View style={styles.transactionInfo}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionId}>{item.id}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}15` },
            ]}
          >
            <Icon name={statusIcon} size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.customerText}>{item.customer}</Text>
        <Text style={styles.transactionDetails}>
          {item.type} •{' '}
          {new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <Text style={styles.transactionAmount}>
        {item.currency}
        {item.amount.toLocaleString()}
      </Text>
    </View>
  );
};

// Action Button Component
const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  title,
  onPress,
  color = '#4f46e5',
}) => {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Icon name={icon} size={20} color="#ffffff" />
      <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  );
};

// API Service Mock (Replace with actual API call)
const fetchUserData = async (): Promise<UserData> => {
  // Simulate API delay
  await new Promise<void>(resolve => setTimeout(resolve, 1000));

  // Mock API Response
  return {
    id: 'user_123',
    name: 'John Developer',
    email: 'john@acmeinc.com',
    company: 'Acme Inc. Developers',
    isLive: false, // Change to true for Live mode
    totalBalance: 45280.5,
    totalPayments: 1248,
    activeDevelopers: 89,
    totalTransactions: 12847,
    recentTransactions: [
      {
        id: 'txn_1',
        amount: 49.99,
        status: 'Success',
        date: '2024-01-15T14:30:00Z',
        type: 'Credit Card',
        customer: 'John Doe',
        currency: '$',
      },
      {
        id: 'txn_2',
        amount: 129.99,
        status: 'Pending',
        date: '2024-01-15T10:15:00Z',
        type: 'Bank Transfer',
        customer: 'Jane Smith',
        currency: '$',
      },
      {
        id: 'txn_3',
        amount: 29.99,
        status: 'Failed',
        date: '2024-01-14T16:45:00Z',
        type: 'PayPal',
        customer: 'Bob Johnson',
        currency: '$',
      },
      {
        id: 'txn_4',
        amount: 199.99,
        status: 'Success',
        date: '2024-01-14T11:20:00Z',
        type: 'Credit Card',
        customer: 'Alice Brown',
        currency: '$',
      },
      {
        id: 'txn_5',
        amount: 79.99,
        status: 'Success',
        date: '2024-01-13T09:30:00Z',
        type: 'Debit Card',
        customer: 'Charlie Wilson',
        currency: '$',
      },
    ],
    revenueData: [
      { day: 'Mon', revenue: 4500 },
      { day: 'Tue', revenue: 5200 },
      { day: 'Wed', revenue: 4800 },
      { day: 'Thu', revenue: 6200 },
      { day: 'Fri', revenue: 7100 },
      { day: 'Sat', revenue: 5800 },
      { day: 'Sun', revenue: 8200 },
    ],
    paymentMethods: [
      { name: 'Credit Card', percentage: 45, color: '#6366f1' },
      { name: 'Debit Card', percentage: 25, color: '#10b981' },
      { name: 'Bank Transfer', percentage: 15, color: '#8b5cf6' },
      { name: 'Digital Wallet', percentage: 10, color: '#f59e0b' },
      { name: 'Refunds', percentage: 5, color: '#ef4444' },
    ],
  };
};

// Main Dashboard Component
export default function StripeDashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  const loadUserData = async (): Promise<void> => {
    try {
      const data = await fetchUserData();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to dummy data if API fails
      setUserData({
        id: 'user_123',
        name: 'John Developer',
        email: 'john@acmeinc.com',
        company: 'Acme Inc. Developers',
        isLive: false,
        totalBalance: 45280.5,
        totalPayments: 1248,
        activeDevelopers: 89,
        totalTransactions: 12847,
        recentTransactions: [
          {
            id: 'txn_1',
            amount: 49.99,
            status: 'Success',
            date: '2024-01-15T14:30:00Z',
            type: 'Credit Card',
            customer: 'John Doe',
            currency: '$',
          },
          {
            id: 'txn_2',
            amount: 129.99,
            status: 'Pending',
            date: '2024-01-15T10:15:00Z',
            type: 'Bank Transfer',
            customer: 'Jane Smith',
            currency: '$',
          },
          {
            id: 'txn_3',
            amount: 29.99,
            status: 'Failed',
            date: '2024-01-14T16:45:00Z',
            type: 'PayPal',
            customer: 'Bob Johnson',
            currency: '$',
          },
        ],
        revenueData: [
          { day: 'Mon', revenue: 4500 },
          { day: 'Tue', revenue: 5200 },
          { day: 'Wed', revenue: 4800 },
        ],
        paymentMethods: [
          { name: 'Credit Card', percentage: 45, color: '#6366f1' },
          { name: 'Debit Card', percentage: 25, color: '#10b981' },
          { name: 'Bank Transfer', percentage: 15, color: '#8b5cf6' },
        ],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const onRefresh = (): void => {
    setRefreshing(true);
    loadUserData();
  };

  const handleCreatePayment = (): void => {
    Alert.alert('Create Payment', 'This would open a payment form');
  };

  const handlePayout = (): void => {
    Alert.alert('Payout', 'This would initiate a payout');
  };

  const handleRefund = (): void => {
    Alert.alert('Refund', 'This would open refund options');
  };

  const handleViewAll = (): void => {
    Alert.alert('View All', 'This would navigate to full transaction list');
  };

  const handleTabPress = (tab: string): void => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Prepare stats data from API response
  const statsData: StatCard[] = [
    {
      id: 1,
      title: 'Total Balance',
      value: `$${userData.totalBalance.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: '+12.5%',
      icon: 'wallet',
      color: '#6366f1',
    },
    {
      id: 2,
      title: 'Total Payments',
      value: userData.totalPayments.toLocaleString(),
      change: '+8.2%',
      icon: 'credit-card',
      color: '#10b981',
    },
    {
      id: 3,
      title: 'Active Developers',
      value: userData.activeDevelopers.toLocaleString(),
      change: '+5.1%',
      icon: 'users',
      color: '#8b5cf6',
    },
    {
      id: 4,
      title: 'Total Transactions',
      value: userData.totalTransactions.toLocaleString(),
      change: '+15.3%',
      icon: 'activity',
      color: '#f59e0b',
    },
  ];

  // Prepare chart data
  const revenueData = userData.revenueData.map(d => d.revenue);
  const dayLabels = userData.revenueData.map(d => d.day);

  const pieChartData: PieChartData[] = userData.paymentMethods.map(method => ({
    x: method.name,
    y: method.percentage,
    color: method.color,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4f46e5']}
            tintColor="#4f46e5"
          />
        }
      >
        <Header
          userName={userData.name}
          companyName={userData.company}
          isLive={userData.isLive}
        />

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statsData.map(stat => (
            <StatsCard key={stat.id} {...stat} />
          ))}
        </View>

        {/* Charts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transaction Analytics</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Last 7 days</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartsContainer}>
            {/* Line Chart Card */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Revenue Trend</Text>
              <View style={{ alignItems: 'center', marginTop: 8 }}>
                <SimpleBarChart
                  data={revenueData}
                  labels={dayLabels}
                  height={180}
                />
              </View>
            </View>

            {/* Pie Chart Card */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Payment Methods</Text>
              <View style={{ marginTop: 8 }}>
                <SimplePieChart data={pieChartData} />
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <ActionButton
              icon="add-circle-outline"
              title="Create Payment"
              onPress={handleCreatePayment}
            />
            <ActionButton
              icon="cash-outline"
              title="Payout"
              onPress={handlePayout}
              color="#10b981"
            />
            <ActionButton
              icon="arrow-back-circle-outline"
              title="Refund"
              onPress={handleRefund}
              color="#f59e0b"
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={handleViewAll}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Transaction Details</Text>
            <Text style={styles.tableHeaderText}>Amount</Text>
          </View>

          <FlatList
            data={userData.recentTransactions}
            renderItem={({ item, index }) => (
              <TransactionItem item={item} index={index} />
            )}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            style={styles.transactionList}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} setActiveTab={handleTabPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    marginBottom: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
  },
  accountName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  companyText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  profileButton: {
    padding: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    minWidth: screenWidth / 2 - 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
  },
  chartsContainer: {
    gap: 16,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: screenWidth / 3 - 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  transactionList: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  customerText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  transactionDetails: {
    fontSize: 12,
    color: '#9ca3af',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
