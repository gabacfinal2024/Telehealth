import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ route, navigation }) {
  const userName = route?.params?.userName || 'JajaColeen';
  const userEmail = route?.params?.userEmail || 'jaja@telehealth';
  const userType = route?.params?.userType || 'Patient';
  const [menuVisible, setMenuVisible] = useState(false);

  const QuickActionCard = ({ icon, name, color, onPress }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionText}>{name}</Text>
    </TouchableOpacity>
  );

  const DoctorCard = ({ name, specialty, price, rating, status, statusColor }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorHeader}>
        <View style={styles.doctorIcon}>
          <Ionicons name="heart" size={20} color="#E91E63" />
        </View>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{name}</Text>
          <Text style={styles.doctorSpecialty}>{specialty}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>
      <View style={styles.doctorFooter}>
        <Text style={styles.doctorPrice}>${price}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{rating}</Text>
        </View>
      </View>
    </View>
  );

  const MenuItem = ({ icon, name, active, onPress }) => (
    <TouchableOpacity 
      style={[styles.menuItem, active && styles.menuItemActive]} 
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={active ? '#E91E63' : '#666'} />
      <Text style={[styles.menuText, active && styles.menuTextActive]}>{name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#E91E63', '#9C27B0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerLogo}>
            <Ionicons name="heart" size={20} color="#FFFFFF" />
            <Text style={styles.headerTitle}>HealthCare</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.welcomeText}>Welcome back, {userName}</Text>
        <Text style={styles.userTypeText}>{userType}</Text>
        
        {/* Health Points Card */}
        <View style={styles.healthPointsCard}>
          <View style={styles.healthPointsLeft}>
            <Text style={styles.healthPointsLabel}>Your Health Points</Text>
            <View style={styles.healthPointsValue}>
              <Ionicons name="trophy" size={20} color="#E91E63" />
              <Text style={styles.pointsText}>0 Points</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.redeemButton}>
            <Text style={styles.redeemText}>Redeem</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard 
              icon="calendar" 
              name="Book Appointment" 
              color="#E91E63"
            />
            <QuickActionCard 
              icon="medical-outline" 
              name="Medicine Shop" 
              color="#00BCD4"
            />
            <QuickActionCard 
              icon="chatbubble" 
              name="Chat" 
              color="#2196F3"
            />
            <QuickActionCard 
              icon="document-text" 
              name="Health Articles" 
              color="#9C27B0"
            />
          </View>
        </View>

        {/* Today's Health Tip */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Health Tip</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.healthTipCard}>
            <Ionicons name="heart" size={24} color="#E91E63" />
            <Text style={styles.healthTipText}>
              Stay Hydrated - Drink at least 8 glasses of water daily to maintain optimal health and energy levels.
            </Text>
          </View>
        </View>

        {/* Special Offers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          <LinearGradient
            colors={['#9C27B0', '#E91E63']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.specialOfferCard}
          >
            <Text style={styles.specialOfferText}>
              Special Offer! Get 20% off on your first consultation
            </Text>
            <TouchableOpacity style={styles.learnMoreButton}>
              <Text style={styles.learnMoreText}>Learn More</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Available Doctors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Doctors</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.doctorsList}>
            <DoctorCard
              name="Dr. Sarah Smith"
              specialty="Cardiology"
              price="100"
              rating="4.8"
              status="Available"
              statusColor="#4CAF50"
            />
            <DoctorCard
              name="Dr. Michael Chen"
              specialty="Dermatology"
              price="80"
              rating="4.9"
              status="Available"
              statusColor="#4CAF50"
            />
            <DoctorCard
              name="Dr. Emily Johnson"
              specialty="Pediatrics"
              price="90"
              rating="4.7"
              status="Busy"
              statusColor="#FFC107"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#E91E63" />
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="medical" size={24} color="#999" />
          <Text style={styles.navText}>Doctors</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar" size={24} color="#999" />
          <Text style={styles.navText}>Appointments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={24} color="#999" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Side Menu Modal */}
      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.menuOverlay}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <View style={styles.menuLogo}>
                <Ionicons name="heart" size={20} color="#E91E63" />
                <Text style={styles.menuTitle}>HealthCare</Text>
              </View>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.menuSubtitle}>{userType}</Text>
            
            <ScrollView style={styles.menuScroll}>
              <MenuItem icon="home" name="Dashboard" active={true} />
              <MenuItem icon="medical" name="Find Doctors" />
              <MenuItem icon="calendar" name="Appointments" />
              <MenuItem icon="medical-outline" name="Medicine Shop" />
              <MenuItem icon="cube-outline" name="My Orders" />
              <MenuItem icon="chatbubble-outline" name="Chat" />
              <MenuItem icon="document-text-outline" name="Articles" />
              <MenuItem icon="heart-outline" name="Health Tips" />
              <MenuItem icon="person-outline" name="Profile" />
              <MenuItem icon="settings-outline" name="Settings" />
            </ScrollView>

            <View style={styles.menuFooter}>
              <Text style={styles.menuUserName}>{userName}</Text>
              <Text style={styles.menuUserEmail}>{userEmail}</Text>
              <TouchableOpacity 
                style={styles.menuLogoutButton}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.replace('SignIn');
                }}
              >
                <Ionicons name="log-out-outline" size={16} color="#FF0000" />
                <Text style={styles.menuLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userTypeText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 20,
  },
  healthPointsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthPointsLeft: {
    flex: 1,
  },
  healthPointsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  healthPointsValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  redeemButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  redeemText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#E91E63',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 48) / 2 - 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  healthTipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthTipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
  },
  specialOfferCard: {
    borderRadius: 12,
    padding: 20,
  },
  specialOfferText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 22,
  },
  learnMoreButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    color: '#9C27B0',
    fontWeight: '600',
    fontSize: 14,
  },
  doctorsList: {
    gap: 12,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  doctorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 10,
    color: '#E91E63',
    marginTop: 4,
    fontWeight: '600',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    width: width * 0.8,
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuScroll: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuItemActive: {
    backgroundColor: '#FFF0F5',
  },
  menuText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  menuTextActive: {
    color: '#E91E63',
    fontWeight: '600',
  },
  menuFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  menuUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  menuUserEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  menuLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLogoutText: {
    fontSize: 14,
    color: '#FF0000',
    marginLeft: 8,
    fontWeight: '500',
  },
});
