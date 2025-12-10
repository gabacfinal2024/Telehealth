import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
  Alert,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ route, navigation }) {
  const userName = route?.params?.userName || 'User';
  const userEmail = route?.params?.userEmail || 'user@telehealth.com';
  const userType = route?.params?.userType || 'Patient';
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [healthPoints, setHealthPoints] = useState(1500);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedModal, setSelectedModal] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingDiscount, setBookingDiscount] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [articleModalVisible, setArticleModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  // Settings state
  const [settingsSubMenu, setSettingsSubMenu] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [autoSync, setAutoSync] = useState(true);
  const [dataUsage, setDataUsage] = useState('WiFi Only');
  
  // Dynamic appointments state
  const [appointments, setAppointments] = useState([
    { id: 1, doctor: 'Dr. Sarah Smith', specialty: 'Cardiology', date: '2024-01-15', time: '10:00 AM', status: 'Upcoming', price: 100, discount: 0, total: 100 },
    { id: 2, doctor: 'Dr. Michael Chen', specialty: 'Dermatology', date: '2024-01-10', time: '2:00 PM', status: 'Completed', price: 80, discount: 0, total: 80 },
    { id: 3, doctor: 'Dr. Emily Johnson', specialty: 'Pediatrics', date: '2024-01-20', time: '11:00 AM', status: 'Upcoming', price: 90, discount: 0, total: 90 },
  ]);

  const [medicines] = useState([
    { id: 1, name: 'Paracetamol 500mg', price: 5.99, category: 'Pain Relief', inStock: true, description: 'Effective pain relief and fever reducer' },
    { id: 2, name: 'Vitamin C 1000mg', price: 12.99, category: 'Vitamins', inStock: true, description: 'Boosts immune system and overall health' },
    { id: 3, name: 'Aspirin 100mg', price: 8.99, category: 'Pain Relief', inStock: false, description: 'Cardiovascular protection and pain relief' },
    { id: 4, name: 'Ibuprofen 400mg', price: 7.99, category: 'Pain Relief', inStock: true, description: 'Anti-inflammatory pain relief' },
  ]);

  const [articles] = useState([
    { id: 1, title: '10 Tips for Better Sleep', category: 'Wellness', readTime: '5 min', date: '2024-01-12', content: 'Getting quality sleep is essential for your health...' },
    { id: 2, title: 'Understanding Heart Health', category: 'Cardiology', readTime: '8 min', date: '2024-01-10', content: 'Your heart health is crucial for overall wellbeing...' },
    { id: 3, title: 'Nutrition for Healthy Living', category: 'Nutrition', readTime: '6 min', date: '2024-01-08', content: 'A balanced diet is the foundation of good health...' },
    { id: 4, title: 'Exercise and Mental Health', category: 'Wellness', readTime: '7 min', date: '2024-01-05', content: 'Physical activity has profound effects on mental wellbeing...' },
  ]);

  const [healthTips] = useState([
    'Stay Hydrated - Drink at least 8 glasses of water daily to maintain optimal health and energy levels.',
    'Exercise Regularly - 30 minutes of physical activity daily can improve cardiovascular health and mood.',
    'Get Enough Sleep - Aim for 7-9 hours per night to allow your body to repair and recharge.',
    'Eat Balanced Meals - Include fruits, vegetables, and whole grains in your daily diet.',
    'Manage Stress - Practice meditation or deep breathing exercises to reduce stress levels.',
    'Regular Check-ups - Schedule annual health check-ups to catch issues early.',
  ]);

  const [chats, setChats] = useState([
    { id: 1, doctor: 'Dr. Sarah Smith', lastMessage: 'Thank you for your question. I recommend...', time: '2:30 PM', unread: 2 },
    { id: 2, doctor: 'Dr. Michael Chen', lastMessage: 'Your test results are ready for review', time: 'Yesterday', unread: 0 },
    { id: 3, doctor: 'Dr. Emily Johnson', lastMessage: 'How are you feeling today?', time: '3 days ago', unread: 1 },
  ]);

  // Initialize chat messages
  useEffect(() => {
    setChatMessages({
      1: [
        { id: 1, text: 'Hello! How can I help you today?', sender: 'doctor', time: '10:00 AM' },
        { id: 2, text: 'Hi Dr. Smith, I have been experiencing chest pain recently.', sender: 'user', time: '10:05 AM' },
        { id: 3, text: 'I understand. Can you describe the pain? Is it sharp or dull?', sender: 'doctor', time: '10:06 AM' },
        { id: 4, text: 'It\'s a dull ache that comes and goes.', sender: 'user', time: '10:10 AM' },
        { id: 5, text: 'Thank you for your question. I recommend scheduling an appointment for a thorough examination. Would you like me to help you book one?', sender: 'doctor', time: '2:30 PM' },
      ],
      2: [
        { id: 1, text: 'Hello, your test results are ready for review.', sender: 'doctor', time: '9:00 AM' },
        { id: 2, text: 'Great! Can you share them with me?', sender: 'user', time: '9:15 AM' },
        { id: 3, text: 'Your test results are ready for review. Please schedule a follow-up appointment to discuss them.', sender: 'doctor', time: 'Yesterday' },
      ],
      3: [
        { id: 1, text: 'Hello! How are you feeling today?', sender: 'doctor', time: '3 days ago' },
        { id: 2, text: 'I\'m feeling much better, thank you!', sender: 'user', time: '3 days ago' },
      ],
    });
  }, []);

  const [doctors] = useState([
    { id: 1, name: 'Dr. Sarah Smith', specialty: 'Cardiology', price: 100, rating: 4.8, status: 'Available', statusColor: '#4CAF50', experience: '15 years', patients: 2500 },
    { id: 2, name: 'Dr. Michael Chen', specialty: 'Dermatology', price: 80, rating: 4.9, status: 'Available', statusColor: '#4CAF50', experience: '12 years', patients: 1800 },
    { id: 3, name: 'Dr. Emily Johnson', specialty: 'Pediatrics', price: 90, rating: 4.7, status: 'Busy', statusColor: '#FFC107', experience: '10 years', patients: 1200 },
    { id: 4, name: 'Dr. James Wilson', specialty: 'Orthopedics', price: 110, rating: 4.9, status: 'Available', statusColor: '#4CAF50', experience: '18 years', patients: 3000 },
  ]);

  // Utility to close any open feature modals before navigating
  const closeFeatureModals = () => {
    setBookingModalVisible(false);
    setSelectedDoctor(null);
    setQuantityModalVisible(false);
    setSelectedMedicine(null);
    setChatModalVisible(false);
    setSelectedChat(null);
    setArticleModalVisible(false);
    setSelectedArticle(null);
  };

  // Handlers
  const handleMenuClick = (menuName) => {
    const modalMap = {
      'Find Doctors': 'doctors',
      'Appointments': 'appointments',
      'Medicine Shop': 'medicines',
      'My Orders': 'orders',
      'Chat': 'chats',
      'Articles': 'articles',
      'Health Tips': 'tips',
      'Profile': 'profile',
      'Settings': 'settings',
    };

    setActiveMenu(menuName);
    setMenuVisible(false);
    closeFeatureModals();

    if (menuName === 'Dashboard') {
      setCurrentView('dashboard');
      setSelectedModal(null);
      return;
    }

    const modalKey = modalMap[menuName];
    if (modalKey) {
      setCurrentView(modalKey);
      setSelectedModal(modalKey);
    } else {
      setCurrentView('dashboard');
      setSelectedModal(null);
    }
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'Book Appointment':
        handleMenuClick('Find Doctors');
        break;
      case 'Medicine Shop':
        handleMenuClick('Medicine Shop');
        break;
      case 'Chat':
        handleMenuClick('Chat');
        break;
      case 'Health Articles':
        handleMenuClick('Articles');
        break;
      default:
        Alert.alert('Action', `${action} feature coming soon!`);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            navigation.replace('SignIn');
          },
        },
      ]
    );
  };

  const handleRedeemPoints = () => {
    Alert.alert('Redeem Points', `You have ${healthPoints} health points available!\n\nRedeem options:\n- 500 points = $5 discount\n- 1000 points = $15 discount\n- 2000 points = $35 discount`);
  };

  // Function to open booking modal
  const openBookingModal = (doctor) => {
    // Close the main content modal so the booking modal is visible immediately
    setSelectedModal(null);
    setSelectedDoctor(doctor);
    setBookingDiscount(0);
    setPointsToUse(0);
    // Set default date (7 days from today)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const defaultDate = nextWeek.toISOString().split('T')[0];
    setSelectedDate(defaultDate);
    setSelectedTime('10:00 AM');
    setBookingModalVisible(true);
  };

  // Function to confirm booking
  const confirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both date and time');
      return;
    }

    // Validate date is not in the past
    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDateObj < today) {
      Alert.alert('Error', 'Please select a future date');
      return;
    }

    // Create new appointment
    const price = selectedDoctor.price || 0;
    const total = Math.max(price - bookingDiscount, 0);
    const newAppointment = {
      id: appointments.length + 1,
      doctor: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      date: selectedDate,
      time: selectedTime,
      status: 'Upcoming',
      price,
      discount: bookingDiscount,
      total,
      pointsUsed: pointsToUse,
    };

    // Add to appointments list
    setAppointments([newAppointment, ...appointments]);
    setBookingModalVisible(false);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    if (pointsToUse > 0) {
      setHealthPoints((prev) => Math.max(prev - pointsToUse, 0));
    }
    setBookingDiscount(0);
    setPointsToUse(0);

    Alert.alert(
      'Appointment Booked!',
      `Your appointment with ${selectedDoctor.name} has been scheduled for ${selectedDate} at ${selectedTime}.\n\nPrice: $${price}\nDiscount: $${bookingDiscount}\nTotal: $${total}\n\nYou can view it in the Appointments section.`,
      [
        {
          text: 'View Appointments',
          onPress: () => {
            handleMenuClick('Appointments');
          },
        },
        {
          text: 'OK',
          style: 'cancel',
        },
      ]
    );
  };

  // Function to cancel appointment
  const handleCancelAppointment = (appointmentId) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setAppointments(prev => {
              const target = prev.find(apt => apt.id === appointmentId);
              if (target?.pointsUsed) {
                setHealthPoints((hp) => hp + target.pointsUsed);
              }
              return prev.filter(apt => apt.id !== appointmentId);
            });
            Alert.alert('Success', 'Appointment has been cancelled');
          },
        },
      ]
    );
  };

  // Function to open quantity picker for medicine
  const openQuantityPicker = (medicine) => {
    // Close the main content modal so the quantity picker is visible immediately
    setSelectedModal(null);
    setSelectedMedicine(medicine);
    setQuantity(1);
    setQuantityModalVisible(true);
  };

  // Function to add medicine to cart with quantity
  const addToCart = () => {
    if (!selectedMedicine || quantity < 1) {
      Alert.alert('Error', 'Please select a valid quantity');
      return;
    }

    const cartItem = {
      id: Date.now(),
      medicineId: selectedMedicine.id,
      name: selectedMedicine.name,
      price: selectedMedicine.price,
      quantity: quantity,
      total: (selectedMedicine.price * quantity).toFixed(2),
    };

    setCart([...cart, cartItem]);
    setQuantityModalVisible(false);
    setSelectedMedicine(null);
    setQuantity(1);
    
    Alert.alert('Added to Cart', `${quantity} x ${selectedMedicine.name} added to cart!`);
  };

  // Function to place order
  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Add items to cart first.');
      return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2);
    const orderDate = new Date().toISOString().split('T')[0];

    Alert.alert(
      'Confirm Order',
      `Total Amount: $${totalAmount}\n\nDo you want to place this order?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          onPress: () => {
            const newOrder = {
              id: Date.now(),
              items: [...cart],
              totalAmount: totalAmount,
              date: orderDate,
              status: 'Shipped',
            };

            setOrders([newOrder, ...orders]);
            setCart([]);
            
            Alert.alert(
              'Order Placed!',
              `Your order has been placed successfully!\n\nTotal: $${totalAmount}\nStatus: Shipped\n\nYour products will be shipped soon.`,
              [
                {
                  text: 'View Orders',
                  onPress: () => handleMenuClick('My Orders'),
                },
                { text: 'OK', style: 'cancel' },
              ]
            );
          },
        },
      ]
    );
  };

  // Function to cancel order
  const handleCancelOrder = (orderId) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setOrders(orders.map(order => 
              order.id === orderId 
                ? { ...order, status: 'Cancelled' }
                : order
            ));
            Alert.alert('Success', 'Order has been cancelled');
          },
        },
      ]
    );
  };

  // Function to remove item from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
    Alert.alert('Removed', 'Item removed from cart');
  };

  // Settings handlers
  const handleSettingsClick = (setting) => {
    switch(setting) {
      case 'notifications':
        setSettingsSubMenu('notifications');
        break;
      case 'privacy':
        setSettingsSubMenu('privacy');
        break;
      case 'language':
        setSettingsSubMenu('language');
        break;
      case 'help':
        Alert.alert(
          'Help & Support',
          'For assistance, please contact:\n\nEmail: support@telehealth.com\nPhone: 1-800-TELEHEALTH\n\nOur support team is available 24/7 to help you.',
          [{ text: 'OK' }]
        );
        break;
      case 'about':
        Alert.alert(
          'About TeleHealth',
          'TeleHealth App v1.0.0\n\nYour trusted healthcare companion.\n\n© 2024 TeleHealth. All rights reserved.\n\nBuilt with ❤️ for better healthcare.',
          [{ text: 'OK' }]
        );
        break;
      default:
        break;
    }
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    Alert.alert('Language Changed', `App language changed to ${language}`);
    setSettingsSubMenu(null);
  };

  // Chat handlers
  const openChat = (chat) => {
    // Close the main content modal so chat opens immediately
    setSelectedModal(null);
    setCurrentView('chats');
    setSelectedChat(chat);
    setChatModalVisible(true);
    // Mark as read
    setChats(chats.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
  };

  const startChatWithDoctor = (doctor) => {
    // Check if chat already exists
    const existingChat = chats.find(c => c.doctor === doctor.name);
    if (existingChat) {
      openChat(existingChat);
    } else {
      // Create new chat
      const newChat = {
        id: chats.length + 1,
        doctor: doctor.name,
        lastMessage: 'Chat started',
        time: 'Now',
        unread: 0,
      };
      setChats([newChat, ...chats]);
      setChatMessages({
        ...chatMessages,
        [newChat.id]: [
          { id: 1, text: `Hello! I'm ${doctor.name}. How can I help you today?`, sender: 'doctor', time: 'Now' },
        ],
      });
      // Close the main content modal so chat opens immediately
      setSelectedModal(null);
      setCurrentView('chats');
      setSelectedChat(newChat);
      setChatModalVisible(true);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = {
      ...chatMessages,
      [selectedChat.id]: [...(chatMessages[selectedChat.id] || []), message],
    };

    setChatMessages(updatedMessages);
    setNewMessage('');

    // Update chat last message
    setChats(chats.map(c => 
      c.id === selectedChat.id 
        ? { ...c, lastMessage: message.text, time: 'Now', unread: 0 }
        : c
    ));

    // Simulate doctor response after 2 seconds
    setTimeout(() => {
      const doctorResponse = {
        id: Date.now() + 1,
        text: 'Thank you for your message. I will get back to you shortly.',
        sender: 'doctor',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages({
        ...updatedMessages,
        [selectedChat.id]: [...updatedMessages[selectedChat.id], doctorResponse],
      });
    }, 2000);
  };

  const QuickActionCard = ({ icon, name, color, onPress }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionText}>{name}</Text>
    </TouchableOpacity>
  );

  const DoctorCard = ({ name, specialty, price, rating, status, statusColor, onPress }) => (
    <TouchableOpacity style={styles.doctorCard} onPress={onPress}>
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
    </TouchableOpacity>
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

  // Render different views
  const renderDashboard = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionCard 
            icon="calendar" 
            name="Book Appointment" 
            color="#E91E63"
            onPress={() => handleQuickAction('Book Appointment')}
          />
          <QuickActionCard 
            icon="medical-outline" 
            name="Medicine Shop" 
            color="#00BCD4"
            onPress={() => handleQuickAction('Medicine Shop')}
          />
          <QuickActionCard 
            icon="chatbubble" 
            name="Chat" 
            color="#2196F3"
            onPress={() => handleQuickAction('Chat')}
          />
          <QuickActionCard 
            icon="document-text" 
            name="Health Articles" 
            color="#9C27B0"
            onPress={() => handleQuickAction('Health Articles')}
          />
        </View>
      </View>

      {/* Today's Health Tip */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Health Tip</Text>
          <TouchableOpacity onPress={() => handleMenuClick('Health Tips')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.healthTipCard}
          onPress={() => handleMenuClick('Health Tips')}
        >
          <Ionicons name="heart" size={24} color="#E91E63" />
          <Text style={styles.healthTipText}>
            {healthTips[0]}
          </Text>
        </TouchableOpacity>
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
          <TouchableOpacity 
            style={styles.learnMoreButton}
            onPress={() => {
              Alert.alert(
                'Special Offer',
                'Get 20% off on your first consultation!\n\n• Valid for new patients only\n• Offer expires in 30 days\n• Cannot be combined with other offers\n\nBook an appointment now to claim this offer!',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Book Appointment', 
                    onPress: () => handleQuickAction('Book Appointment')
                  },
                ]
              );
            }}
          >
            <Text style={styles.learnMoreText}>Learn More</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Available Doctors */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Doctors</Text>
          <TouchableOpacity onPress={() => handleMenuClick('Find Doctors')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.doctorsList}>
          {doctors.slice(0, 3).map((doctor) => (
            <DoctorCard
              key={doctor.id}
              name={doctor.name}
              specialty={doctor.specialty}
              price={doctor.price}
              rating={doctor.rating}
              status={doctor.status}
              statusColor={doctor.statusColor}
              onPress={() => {
                if (doctor.status === 'Available') {
                  Alert.alert(
                    doctor.name,
                    `What would you like to do?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Chat', 
                        onPress: () => startChatWithDoctor(doctor)
                      },
                      { 
                        text: 'Book Appointment', 
                        onPress: () => openBookingModal(doctor)
                      },
                    ]
                  );
                } else {
                  Alert.alert('Not Available', `${doctor.name} is currently busy. Please try another doctor.`);
                }
              }}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderModalContent = () => {
    switch(selectedModal) {
      case 'doctors':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Find Doctors</Text>
            <FlatList
              data={doctors}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <DoctorCard
                  name={item.name}
                  specialty={item.specialty}
                  price={item.price}
                  rating={item.rating}
                  status={item.status}
                  statusColor={item.statusColor}
                  onPress={() => {
                    if (item.status === 'Available') {
                      Alert.alert(
                        item.name,
                        `Specialty: ${item.specialty}\nExperience: ${item.experience}\nPatients: ${item.patients}\n\nPrice: $${item.price}\nRating: ${item.rating}/5.0`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Book Appointment', 
                            onPress: () => openBookingModal(item)
                          },
                        ]
                      );
                    } else {
                      Alert.alert('Not Available', `${item.name} is currently busy. Please try another doctor.`);
                    }
                  }}
                />
              )}
            />
          </View>
        );
      
      case 'appointments':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>My Appointments</Text>
            <FlatList
              data={appointments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <Ionicons name="calendar" size={24} color="#E91E63" />
                    <View style={styles.appointmentInfo}>
                      <Text style={styles.appointmentDoctor}>{item.doctor}</Text>
                      <Text style={styles.appointmentSpecialty}>{item.specialty}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'Upcoming' ? '#4CAF50' : '#999' }]}>
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>
                  <View style={styles.appointmentDetails}>
                    <Text style={styles.appointmentDate}>📅 {item.date}</Text>
                    <Text style={styles.appointmentTime}>🕐 {item.time}</Text>
                  </View>
                  <View style={styles.appointmentPricing}>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Price</Text>
                      <Text style={styles.priceValue}>${item.price ?? 0}</Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Discount</Text>
                      <Text style={styles.priceValue}>-${item.discount ?? 0}</Text>
                    </View>
                    <View style={[styles.priceRow, styles.priceRowTotal]}>
                      <Text style={styles.priceTotalLabel}>Total</Text>
                      <Text style={styles.priceTotalValue}>${item.total ?? 0}</Text>
                    </View>
                  </View>
                  {item.status === 'Upcoming' && (
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => handleCancelAppointment(item.id)}
                    >
                      <Ionicons name="close-circle" size={20} color="#FF5722" />
                      <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          </View>
        );
      
      case 'medicines':
        const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2);
        return (
          <View style={styles.modalContent}>
            <View style={styles.medicineShopHeader}>
              <Text style={styles.modalTitle}>Medicine Shop</Text>
              {cart.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart.length} items</Text>
                </View>
              )}
            </View>
            <FlatList
              data={medicines}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.medicineCard}>
                  <View style={styles.medicineHeader}>
                    <View>
                      <Text style={styles.medicineName}>{item.name}</Text>
                      <Text style={styles.medicineCategory}>{item.category}</Text>
                      <Text style={styles.medicineDescription}>{item.description}</Text>
                    </View>
                    <View style={[styles.stockBadge, { backgroundColor: item.inStock ? '#4CAF50' : '#FF5722' }]}>
                      <Text style={styles.stockText}>{item.inStock ? 'In Stock' : 'Out of Stock'}</Text>
                    </View>
                  </View>
                  <View style={styles.medicineFooter}>
                    <Text style={styles.medicinePrice}>${item.price}</Text>
                    <TouchableOpacity 
                      style={[styles.addToCartButton, !item.inStock && styles.addToCartButtonDisabled]}
                      disabled={!item.inStock}
                      onPress={() => openQuantityPicker(item)}
                    >
                      <Text style={styles.addToCartText}>Add to Cart</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
            {cart.length > 0 && (
              <View style={styles.cartSummary}>
                <Text style={styles.cartSummaryTitle}>Cart ({cart.length} items)</Text>
                <FlatList
                  data={cart}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>{item.name}</Text>
                        <Text style={styles.cartItemDetails}>Qty: {item.quantity} x ${item.price} = ${item.total}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                        <Ionicons name="trash-outline" size={20} color="#FF5722" />
                      </TouchableOpacity>
                    </View>
                  )}
                />
                <View style={styles.cartTotal}>
                  <Text style={styles.cartTotalLabel}>Total:</Text>
                  <Text style={styles.cartTotalAmount}>${cartTotal}</Text>
                </View>
                <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
                  <Text style={styles.placeOrderButtonText}>Place Order</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      
      case 'orders':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>My Orders</Text>
            {orders.length === 0 ? (
              <View style={styles.emptyOrders}>
                <Ionicons name="cube-outline" size={64} color="#CCC" />
                <Text style={styles.emptyOrdersText}>No orders yet</Text>
                <Text style={styles.emptyOrdersSubtext}>Add items to cart and place an order</Text>
              </View>
            ) : (
              <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <View>
                        <Text style={styles.orderDate}>Order Date: {item.date}</Text>
                        <Text style={styles.orderId}>Order #{item.id}</Text>
                      </View>
                      <View style={[
                        styles.orderStatusBadge,
                        { backgroundColor: item.status === 'Shipped' ? '#4CAF50' : item.status === 'Cancelled' ? '#FF5722' : '#FFC107' }
                      ]}>
                        <Text style={styles.orderStatusText}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={styles.orderItems}>
                      {item.items.map((cartItem, index) => (
                        <View key={index} style={styles.orderItemRow}>
                          <Text style={styles.orderItemName}>{cartItem.name}</Text>
                          <Text style={styles.orderItemQty}>Qty: {cartItem.quantity}</Text>
                          <Text style={styles.orderItemPrice}>${cartItem.total}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.orderFooter}>
                      <Text style={styles.orderTotal}>Total: ${item.totalAmount}</Text>
                      {item.status !== 'Cancelled' && (
                        <TouchableOpacity 
                          style={styles.cancelOrderButton}
                          onPress={() => handleCancelOrder(item.id)}
                        >
                          <Ionicons name="close-circle" size={18} color="#FF5722" />
                          <Text style={styles.cancelOrderButtonText}>Cancel Order</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        );
      
      case 'chats':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chats</Text>
            <FlatList
              data={chats}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.chatCard}
                  onPress={() => openChat(item)}
                >
                  <View style={styles.chatIcon}>
                    <Ionicons name="person-circle" size={40} color="#E91E63" />
                    {item.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unread}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.chatInfo}>
                    <Text style={styles.chatDoctor}>{item.doctor}</Text>
                    <Text style={styles.chatMessage} numberOfLines={1}>{item.lastMessage}</Text>
                  </View>
                  <Text style={styles.chatTime}>{item.time}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        );
      
      case 'articles':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Health Articles</Text>
            <FlatList
              data={articles}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.articleCard}
                  onPress={() => {
                    setSelectedArticle(item);
                    setArticleModalVisible(true);
                  }}
                >
                  <View style={styles.articleHeader}>
                    <Text style={styles.articleCategory}>{item.category}</Text>
                    <Text style={styles.articleReadTime}>{item.readTime}</Text>
                  </View>
                  <Text style={styles.articleTitle}>{item.title}</Text>
                  <Text style={styles.articleDate}>📅 {item.date}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        );
      
      case 'tips':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Health Tips</Text>
            <FlatList
              data={healthTips}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.tipCard}>
                  <Ionicons name="heart" size={20} color="#E91E63" />
                  <Text style={styles.tipText}>{item}</Text>
                </View>
              )}
            />
          </View>
        );
      
      case 'profile':
        return (
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profile</Text>
            <View style={styles.profileCard}>
              <View style={styles.profileIcon}>
                <Ionicons name="person" size={50} color="#E91E63" />
              </View>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>{userEmail}</Text>
              <Text style={styles.profileType}>{userType}</Text>
            </View>
            <View style={styles.profileSection}>
              <Text style={styles.profileSectionTitle}>Account Information</Text>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Email</Text>
                <Text style={styles.profileValue}>{userEmail}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>User Type</Text>
                <Text style={styles.profileValue}>{userType}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Health Points</Text>
                <Text style={styles.profileValue}>{healthPoints} points</Text>
              </View>
            </View>
          </ScrollView>
        );
      
      case 'settings':
        if (settingsSubMenu === 'notifications') {
          return (
            <ScrollView style={styles.modalContent}>
              <View style={styles.settingsHeader}>
                <TouchableOpacity onPress={() => setSettingsSubMenu(null)}>
                  <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.settingsSubTitle}>Notifications</Text>
                <View style={{ width: 24 }} />
              </View>
              
              <View style={styles.settingSection}>
                <View style={styles.settingRow}>
                  <View style={styles.settingRowLeft}>
                    <Ionicons name="notifications" size={24} color="#E91E63" />
                    <View style={styles.settingRowText}>
                      <Text style={styles.settingRowTitle}>Enable Notifications</Text>
                      <Text style={styles.settingRowSubtitle}>Receive app notifications</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggle, notificationsEnabled && styles.toggleActive]}
                    onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                  >
                    <View style={[styles.toggleCircle, notificationsEnabled && styles.toggleCircleActive]} />
                  </TouchableOpacity>
                </View>

                {notificationsEnabled && (
                  <>
                    <View style={styles.settingRow}>
                      <View style={styles.settingRowLeft}>
                        <Ionicons name="mail" size={24} color="#666" />
                        <View style={styles.settingRowText}>
                          <Text style={styles.settingRowTitle}>Email Notifications</Text>
                          <Text style={styles.settingRowSubtitle}>Receive updates via email</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[styles.toggle, emailNotifications && styles.toggleActive]}
                        onPress={() => setEmailNotifications(!emailNotifications)}
                      >
                        <View style={[styles.toggleCircle, emailNotifications && styles.toggleCircleActive]} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.settingRow}>
                      <View style={styles.settingRowLeft}>
                        <Ionicons name="phone-portrait" size={24} color="#666" />
                        <View style={styles.settingRowText}>
                          <Text style={styles.settingRowTitle}>Push Notifications</Text>
                          <Text style={styles.settingRowSubtitle}>Receive push notifications</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[styles.toggle, pushNotifications && styles.toggleActive]}
                        onPress={() => setPushNotifications(!pushNotifications)}
                      >
                        <View style={[styles.toggleCircle, pushNotifications && styles.toggleCircleActive]} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.settingRow}>
                      <View style={styles.settingRowLeft}>
                        <Ionicons name="calendar" size={24} color="#666" />
                        <View style={styles.settingRowText}>
                          <Text style={styles.settingRowTitle}>Appointment Reminders</Text>
                          <Text style={styles.settingRowSubtitle}>Remind me before appointments</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[styles.toggle, appointmentReminders && styles.toggleActive]}
                        onPress={() => setAppointmentReminders(!appointmentReminders)}
                      >
                        <View style={[styles.toggleCircle, appointmentReminders && styles.toggleCircleActive]} />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </ScrollView>
          );
        }

        if (settingsSubMenu === 'privacy') {
          return (
            <ScrollView style={styles.modalContent}>
              <View style={styles.settingsHeader}>
                <TouchableOpacity onPress={() => setSettingsSubMenu(null)}>
                  <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.settingsSubTitle}>Privacy & Security</Text>
                <View style={{ width: 24 }} />
              </View>
              
              <View style={styles.settingSection}>
                <View style={styles.settingRow}>
                  <View style={styles.settingRowLeft}>
                    <Ionicons name="finger-print" size={24} color="#666" />
                    <View style={styles.settingRowText}>
                      <Text style={styles.settingRowTitle}>Biometric Authentication</Text>
                      <Text style={styles.settingRowSubtitle}>Use fingerprint or face ID</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggle, biometricEnabled && styles.toggleActive]}
                    onPress={() => {
                      setBiometricEnabled(!biometricEnabled);
                      Alert.alert('Biometric', biometricEnabled ? 'Biometric authentication disabled' : 'Biometric authentication enabled');
                    }}
                  >
                    <View style={[styles.toggleCircle, biometricEnabled && styles.toggleCircleActive]} />
                  </TouchableOpacity>
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingRowLeft}>
                    <Ionicons name="shield-checkmark" size={24} color="#666" />
                    <View style={styles.settingRowText}>
                      <Text style={styles.settingRowTitle}>Two-Factor Authentication</Text>
                      <Text style={styles.settingRowSubtitle}>Add extra security layer</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggle, twoFactorAuth && styles.toggleActive]}
                    onPress={() => {
                      setTwoFactorAuth(!twoFactorAuth);
                      Alert.alert('2FA', twoFactorAuth ? 'Two-factor authentication disabled' : 'Two-factor authentication enabled');
                    }}
                  >
                    <View style={[styles.toggleCircle, twoFactorAuth && styles.toggleCircleActive]} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Change Password', 'Password change feature coming soon!')}>
                  <Ionicons name="key-outline" size={24} color="#666" />
                  <Text style={styles.settingText}>Change Password</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Data Privacy', 'Your data is encrypted and stored securely. We never share your personal information with third parties.')}>
                  <Ionicons name="lock-closed-outline" size={24} color="#666" />
                  <Text style={styles.settingText}>Data Privacy</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Activity Log', 'View your account activity and login history')}>
                  <Ionicons name="list-outline" size={24} color="#666" />
                  <Text style={styles.settingText}>Activity Log</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          );
        }

        if (settingsSubMenu === 'language') {
          const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Tagalog'];
          return (
            <ScrollView style={styles.modalContent}>
              <View style={styles.settingsHeader}>
                <TouchableOpacity onPress={() => setSettingsSubMenu(null)}>
                  <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.settingsSubTitle}>Language</Text>
                <View style={{ width: 24 }} />
              </View>
              
              <View style={styles.settingSection}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={styles.languageItem}
                    onPress={() => handleLanguageSelect(lang)}
                  >
                    <Text style={styles.languageText}>{lang}</Text>
                    {selectedLanguage === lang && (
                      <Ionicons name="checkmark" size={24} color="#E91E63" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          );
        }

        return (
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>
            
            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Account</Text>
              <TouchableOpacity style={styles.settingItem} onPress={() => handleMenuClick('Profile')}>
                <Ionicons name="person-outline" size={24} color="#666" />
                <Text style={styles.settingText}>Account Settings</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Preferences</Text>
              <TouchableOpacity style={styles.settingItem} onPress={() => handleSettingsClick('notifications')}>
                <Ionicons name="notifications-outline" size={24} color="#666" />
                <Text style={styles.settingText}>Notifications</Text>
                <View style={styles.settingRight}>
                  {notificationsEnabled && <View style={styles.settingBadge} />}
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem} onPress={() => handleSettingsClick('language')}>
                <Ionicons name="language-outline" size={24} color="#666" />
                <Text style={styles.settingText}>Language</Text>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>{selectedLanguage}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Privacy & Security</Text>
              <TouchableOpacity style={styles.settingItem} onPress={() => handleSettingsClick('privacy')}>
                <Ionicons name="lock-closed-outline" size={24} color="#666" />
                <Text style={styles.settingText}>Privacy & Security</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
              <View style={styles.settingRow}>
                <View style={styles.settingRowLeft}>
                  <Ionicons name="cloud-upload-outline" size={24} color="#666" />
                  <View style={styles.settingRowText}>
                    <Text style={styles.settingRowTitle}>Auto Sync</Text>
                    <Text style={styles.settingRowSubtitle}>Automatically sync data</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, autoSync && styles.toggleActive]}
                  onPress={() => setAutoSync(!autoSync)}
                >
                  <View style={[styles.toggleCircle, autoSync && styles.toggleCircleActive]} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.settingItem} 
                onPress={() => {
                  const options = ['WiFi Only', 'Always', 'Never'];
                  Alert.alert(
                    'Data Usage',
                    'Select data usage preference',
                    options.map(option => ({
                      text: option,
                      onPress: () => {
                        setDataUsage(option);
                        Alert.alert('Updated', `Data usage set to: ${option}`);
                      }
                    })).concat([{ text: 'Cancel', style: 'cancel' }])
                  );
                }}
              >
                <Ionicons name="cellular-outline" size={24} color="#666" />
                <Text style={styles.settingText}>Data Usage</Text>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>{dataUsage}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Support</Text>
              <TouchableOpacity style={styles.settingItem} onPress={() => handleSettingsClick('help')}>
                <Ionicons name="help-circle-outline" size={24} color="#666" />
                <Text style={styles.settingText}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Feedback', 'We\'d love to hear your feedback!\n\nEmail: feedback@telehealth.com')}>
                <Ionicons name="chatbubble-outline" size={24} color="#666" />
                <Text style={styles.settingText}>Send Feedback</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Rate App', 'Thank you for using TeleHealth!\n\nPlease rate us on the App Store.')}>
                <Ionicons name="star-outline" size={24} color="#666" />
                <Text style={styles.settingText}>Rate App</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem} onPress={() => handleSettingsClick('about')}>
                <Ionicons name="information-circle-outline" size={24} color="#666" />
                <Text style={styles.settingText}>About</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Danger Zone</Text>
              <TouchableOpacity 
                style={[styles.settingItem, styles.dangerItem]} 
                onPress={() => {
                  Alert.alert(
                    'Clear Cache',
                    'Are you sure you want to clear all cached data?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Clear', 
                        style: 'destructive',
                        onPress: () => Alert.alert('Success', 'Cache cleared successfully')
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="trash-outline" size={24} color="#FF5722" />
                <Text style={[styles.settingText, styles.dangerText]}>Clear Cache</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.settingItem, styles.dangerItem]} 
                onPress={() => {
                  Alert.alert(
                    'Delete Account',
                    'Are you sure you want to delete your account? This action cannot be undone.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Delete', 
                        style: 'destructive',
                        onPress: () => Alert.alert('Account Deletion', 'Account deletion feature coming soon!')
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="warning-outline" size={24} color="#FF5722" />
                <Text style={[styles.settingText, styles.dangerText]}>Delete Account</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      
      default:
        return null;
    }
  };

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
            <Text style={styles.headerTitle}>TELEHEALTH</Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert('Notifications', 'You have no new notifications')}>
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
              <Text style={styles.pointsText}>{healthPoints} Points</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.redeemButton} onPress={handleRedeemPoints}>
            <Text style={styles.redeemText}>Redeem</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main Content */}
      {currentView === 'dashboard' ? renderDashboard() : null}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => { setCurrentView('dashboard'); setSelectedModal(null); }}>
          <Ionicons name="home" size={24} color={currentView === 'dashboard' ? "#E91E63" : "#999"} />
          <Text style={[currentView === 'dashboard' ? styles.navTextActive : styles.navText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleMenuClick('Find Doctors')}>
          <Ionicons name="medical" size={24} color={currentView === 'doctors' ? "#E91E63" : "#999"} />
          <Text style={[currentView === 'doctors' ? styles.navTextActive : styles.navText]}>Doctors</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleMenuClick('Appointments')}>
          <Ionicons name="calendar" size={24} color={currentView === 'appointments' ? "#E91E63" : "#999"} />
          <Text style={[currentView === 'appointments' ? styles.navTextActive : styles.navText]}>Appointments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleMenuClick('Profile')}>
          <Ionicons name="person" size={24} color={currentView === 'profile' ? "#E91E63" : "#999"} />
          <Text style={[currentView === 'profile' ? styles.navTextActive : styles.navText]}>Profile</Text>
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
                <Text style={styles.menuTitle}>TELEHEALTH</Text>
              </View>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.menuSubtitle}>{userType}</Text>
            
            <ScrollView style={styles.menuScroll}>
              <MenuItem 
                icon="home" 
                name="Dashboard" 
                active={activeMenu === 'Dashboard'} 
                onPress={() => handleMenuClick('Dashboard')}
              />
              <MenuItem 
                icon="medical" 
                name="Find Doctors" 
                active={activeMenu === 'Find Doctors'}
                onPress={() => handleMenuClick('Find Doctors')}
              />
              <MenuItem 
                icon="calendar" 
                name="Appointments" 
                active={activeMenu === 'Appointments'}
                onPress={() => handleMenuClick('Appointments')}
              />
              <MenuItem 
                icon="medical-outline" 
                name="Medicine Shop" 
                active={activeMenu === 'Medicine Shop'}
                onPress={() => handleMenuClick('Medicine Shop')}
              />
              <MenuItem 
                icon="cube-outline" 
                name="My Orders" 
                active={activeMenu === 'My Orders'}
                onPress={() => handleMenuClick('My Orders')}
              />
              <MenuItem 
                icon="chatbubble-outline" 
                name="Chat" 
                active={activeMenu === 'Chat'}
                onPress={() => handleMenuClick('Chat')}
              />
              <MenuItem 
                icon="document-text-outline" 
                name="Articles" 
                active={activeMenu === 'Articles'}
                onPress={() => handleMenuClick('Articles')}
              />
              <MenuItem 
                icon="heart-outline" 
                name="Health Tips" 
                active={activeMenu === 'Health Tips'}
                onPress={() => handleMenuClick('Health Tips')}
              />
              <MenuItem 
                icon="person-outline" 
                name="Profile" 
                active={activeMenu === 'Profile'}
                onPress={() => handleMenuClick('Profile')}
              />
              <MenuItem 
                icon="settings-outline" 
                name="Settings" 
                active={activeMenu === 'Settings'}
                onPress={() => handleMenuClick('Settings')}
              />
            </ScrollView>

            <View style={styles.menuFooter}>
              <Text style={styles.menuUserName}>{userName}</Text>
              <Text style={styles.menuUserEmail}>{userEmail}</Text>
              <TouchableOpacity 
                style={styles.menuLogoutButton}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={16} color="#FF0000" />
                <Text style={styles.menuLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Content Modal */}
      <Modal
        visible={selectedModal !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => { setSelectedModal(null); setCurrentView('dashboard'); }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setSelectedModal(null); setCurrentView('dashboard'); }}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              {selectedModal === 'doctors' ? 'Find Doctors' :
               selectedModal === 'appointments' ? 'Appointments' :
               selectedModal === 'medicines' ? 'Medicine Shop' :
               selectedModal === 'chats' ? 'Chats' :
               selectedModal === 'articles' ? 'Articles' :
               selectedModal === 'tips' ? 'Health Tips' :
               selectedModal === 'profile' ? 'Profile' :
               selectedModal === 'settings' ? 'Settings' : ''}
            </Text>
            <View style={{ width: 24 }} />
          </View>
          {renderModalContent()}
        </SafeAreaView>
      </Modal>

      {/* Booking Modal */}
      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.bookingModalOverlay}>
          <View style={styles.bookingModalContainer}>
            <View style={styles.bookingModalHeader}>
              <Text style={styles.bookingModalTitle}>Book Appointment</Text>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedDoctor && (
              <>
                <View style={styles.bookingDoctorInfo}>
                  <Text style={styles.bookingDoctorName}>{selectedDoctor.name}</Text>
                  <Text style={styles.bookingDoctorSpecialty}>{selectedDoctor.specialty}</Text>
                  <Text style={styles.bookingDoctorPrice}>${selectedDoctor.price}</Text>
                </View>

                <View style={styles.bookingForm}>
                  <Text style={styles.bookingLabel}>Select Date</Text>
                  <TextInput
                    style={styles.bookingInput}
                    placeholder="YYYY-MM-DD (e.g., 2024-01-25)"
                    value={selectedDate}
                    onChangeText={setSelectedDate}
                    keyboardType="default"
                  />
                  <Text style={styles.bookingHint}>Format: YYYY-MM-DD</Text>

                  <Text style={[styles.bookingLabel, { marginTop: 20 }]}>Select Time</Text>
                  <TextInput
                    style={styles.bookingInput}
                    placeholder="e.g., 10:00 AM or 2:30 PM"
                    value={selectedTime}
                    onChangeText={setSelectedTime}
                    keyboardType="default"
                  />
                  <Text style={styles.bookingHint}>Format: HH:MM AM/PM (e.g., 10:00 AM, 2:30 PM)</Text>

                  <Text style={[styles.bookingLabel, { marginTop: 20 }]}>Apply Discount with Health Points</Text>
                  <Text style={styles.bookingHint}>Available points: {healthPoints}</Text>
                  <View style={styles.discountOptions}>
                    {[
                      { points: 500, amount: 5 },
                      { points: 1000, amount: 15 },
                      { points: 2000, amount: 35 },
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.points}
                        style={[
                          styles.discountChip,
                          pointsToUse === option.points && styles.discountChipActive,
                          healthPoints < option.points && styles.discountChipDisabled,
                        ]}
                        disabled={healthPoints < option.points}
                        onPress={() => {
                          setPointsToUse(option.points);
                          setBookingDiscount(option.amount);
                        }}
                      >
                        <Text
                          style={[
                            styles.discountChipText,
                            pointsToUse === option.points && styles.discountChipTextActive,
                            healthPoints < option.points && styles.discountChipTextDisabled,
                          ]}
                        >
                          {option.points} pts → ${option.amount} off
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.priceSummary}>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Price</Text>
                      <Text style={styles.priceValue}>${selectedDoctor.price}</Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Discount</Text>
                      <Text style={styles.priceValue}>-${bookingDiscount}</Text>
                    </View>
                    <View style={[styles.priceRow, styles.priceRowTotal]}>
                      <Text style={styles.priceTotalLabel}>Total</Text>
                      <Text style={styles.priceTotalValue}>${Math.max((selectedDoctor.price || 0) - bookingDiscount, 0)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.bookingButtons}>
                  <TouchableOpacity 
                    style={styles.bookingCancelButton}
                    onPress={() => setBookingModalVisible(false)}
                  >
                    <Text style={styles.bookingCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.bookingConfirmButton}
                    onPress={confirmBooking}
                  >
                    <Text style={styles.bookingConfirmButtonText}>Confirm Booking</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Quantity Picker Modal */}
      <Modal
        visible={quantityModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setQuantityModalVisible(false)}
      >
        <View style={styles.quantityModalOverlay}>
          <View style={styles.quantityModalContainer}>
            <View style={styles.quantityModalHeader}>
              <Text style={styles.quantityModalTitle}>Select Quantity</Text>
              <TouchableOpacity onPress={() => setQuantityModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedMedicine && (
              <>
                <View style={styles.quantityMedicineInfo}>
                  <Text style={styles.quantityMedicineName}>{selectedMedicine.name}</Text>
                  <Text style={styles.quantityMedicinePrice}>${selectedMedicine.price} each</Text>
                </View>

                <View style={styles.quantitySelector}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Ionicons name="remove" size={24} color="#E91E63" />
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => setQuantity(quantity + 1)}
                  >
                    <Ionicons name="add" size={24} color="#E91E63" />
                  </TouchableOpacity>
                </View>

                <View style={styles.quantityTotal}>
                  <Text style={styles.quantityTotalLabel}>Total:</Text>
                  <Text style={styles.quantityTotalAmount}>${(selectedMedicine.price * quantity).toFixed(2)}</Text>
                </View>

                <View style={styles.quantityButtons}>
                  <TouchableOpacity 
                    style={styles.quantityCancelButton}
                    onPress={() => setQuantityModalVisible(false)}
                  >
                    <Text style={styles.quantityCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quantityConfirmButton}
                    onPress={addToCart}
                  >
                    <Text style={styles.quantityConfirmButtonText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Chat Modal */}
      <Modal
        visible={chatModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setChatModalVisible(false);
          setSelectedChat(null);
          setNewMessage('');
        }}
      >
        <SafeAreaView style={styles.chatModalContainer}>
          {selectedChat && (
            <>
              <View style={styles.chatHeader}>
                <TouchableOpacity onPress={() => {
                  setChatModalVisible(false);
                  setSelectedChat(null);
                  setNewMessage('');
                }}>
                  <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.chatHeaderInfo}>
                  <Ionicons name="person-circle" size={32} color="#E91E63" />
                  <Text style={styles.chatHeaderName}>{selectedChat.doctor}</Text>
                </View>
                <TouchableOpacity onPress={() => Alert.alert('Call', `Calling ${selectedChat.doctor}...`)}>
                  <Ionicons name="call" size={24} color="#E91E63" />
                </TouchableOpacity>
              </View>

              <FlatList
                style={styles.chatMessagesList}
                data={chatMessages[selectedChat.id] || []}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={[
                    styles.messageContainer,
                    item.sender === 'user' ? styles.userMessage : styles.doctorMessage
                  ]}>
                    <Text style={[
                      styles.messageText,
                      item.sender === 'user' ? styles.userMessageText : styles.doctorMessageText
                    ]}>
                      {item.text}
                    </Text>
                    <Text style={[
                      styles.messageTime,
                      item.sender === 'user' ? styles.userMessageTime : styles.doctorMessageTime
                    ]}>
                      {item.time}
                    </Text>
                  </View>
                )}
                inverted={false}
              />

              <View style={styles.chatInputContainer}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Type a message..."
                  placeholderTextColor="#999"
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                />
                <TouchableOpacity 
                  style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                  onPress={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* Article Detail Modal */}
      <Modal
        visible={articleModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setArticleModalVisible(false);
          setSelectedArticle(null);
        }}
      >
        <SafeAreaView style={styles.articleModalContainer}>
          {selectedArticle && (
            <>
              <View style={styles.articleModalHeader}>
                <TouchableOpacity onPress={() => {
                  setArticleModalVisible(false);
                  setSelectedArticle(null);
                }}>
                  <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.articleModalTitle}>Article</Text>
                <View style={{ width: 24 }} />
              </View>
              <ScrollView style={styles.articleModalContent}>
                <View style={styles.articleDetailHeader}>
                  <View style={styles.articleDetailCategory}>
                    <Text style={styles.articleDetailCategoryText}>{selectedArticle.category}</Text>
                  </View>
                  <Text style={styles.articleDetailReadTime}>{selectedArticle.readTime} read</Text>
                </View>
                <Text style={styles.articleDetailTitle}>{selectedArticle.title}</Text>
                <Text style={styles.articleDetailDate}>📅 Published on {selectedArticle.date}</Text>
                <View style={styles.articleDetailDivider} />
                <Text style={styles.articleDetailContent}>
                  {selectedArticle.content}
                  {'\n\n'}Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  {'\n\n'}Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  {'\n\n'}Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                </Text>
              </ScrollView>
            </>
          )}
        </SafeAreaView>
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  // Appointment styles
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  appointmentSpecialty: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
  },
  appointmentTime: {
    fontSize: 14,
    color: '#666',
  },
  appointmentPricing: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 10,
  },
  // Medicine styles
  medicineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  medicineCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  medicineDescription: {
    fontSize: 12,
    color: '#999',
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    height: 28,
    justifyContent: 'center',
  },
  stockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  medicineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicinePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  addToCartButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#CCC',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  // Chat styles
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  chatIcon: {
    position: 'relative',
    marginRight: 12,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E91E63',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Price rows (shared)
  priceSummary: {
    marginTop: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceRowTotal: {
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  priceTotalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '700',
  },
  priceTotalValue: {
    fontSize: 16,
    color: '#E91E63',
    fontWeight: '700',
  },
  chatInfo: {
    flex: 1,
  },
  chatDoctor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  chatMessage: {
    fontSize: 14,
    color: '#666',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  // Chat modal styles
  chatModalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  chatMessagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '75%',
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#E91E63',
    borderBottomRightRadius: 4,
  },
  doctorMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  doctorMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  doctorMessageTime: {
    color: '#999',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  // Article detail modal styles
  articleModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  articleModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  articleModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  articleModalContent: {
    flex: 1,
    padding: 20,
  },
  articleDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  articleDetailCategory: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  articleDetailCategoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  articleDetailReadTime: {
    fontSize: 14,
    color: '#999',
  },
  articleDetailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    lineHeight: 32,
  },
  articleDetailDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  articleDetailDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 20,
  },
  articleDetailContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  // Article styles
  articleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  articleCategory: {
    fontSize: 12,
    color: '#E91E63',
    fontWeight: '600',
  },
  articleReadTime: {
    fontSize: 12,
    color: '#999',
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  articleDate: {
    fontSize: 12,
    color: '#999',
  },
  // Tip styles
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
  },
  // Profile styles
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  profileType: {
    fontSize: 14,
    color: '#E91E63',
    fontWeight: '600',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  profileSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profileLabel: {
    fontSize: 14,
    color: '#666',
  },
  profileValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  // Settings styles
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingsSubTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingSection: {
    marginBottom: 24,
  },
  settingSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
  },
  settingBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E91E63',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingRowText: {
    marginLeft: 12,
    flex: 1,
  },
  settingRowTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  settingRowSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#E91E63',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  dangerItem: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF5722',
  },
  dangerText: {
    color: '#FF5722',
  },
  // Cancel button styles
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  cancelButtonText: {
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Booking modal styles
  bookingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bookingModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  bookingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bookingModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  bookingDoctorInfo: {
    backgroundColor: '#FFF0F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  bookingDoctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bookingDoctorSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bookingDoctorPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E91E63',
  },
  bookingForm: {
    marginBottom: 20,
  },
  bookingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  bookingInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bookingHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  bookingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  bookingCancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  bookingCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  bookingConfirmButton: {
    flex: 1,
    backgroundColor: '#E91E63',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  bookingConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Medicine shop cart styles
  medicineShopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartBadge: {
    backgroundColor: '#E91E63',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cartSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
  },
  cartSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cartItemDetails: {
    fontSize: 12,
    color: '#666',
  },
  cartTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cartTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cartTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  placeOrderButton: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Orders styles
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 12,
    color: '#999',
  },
  orderStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  orderStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  orderItemQty: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  cancelOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  cancelOrderButtonText: {
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyOrders: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyOrdersText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptyOrdersSubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
  },
  // Quantity picker modal styles
  quantityModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  quantityModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  quantityModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityMedicineInfo: {
    backgroundColor: '#FFF0F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  quantityMedicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  quantityMedicinePrice: {
    fontSize: 16,
    color: '#E91E63',
    fontWeight: '600',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  quantityButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E91E63',
  },
  quantityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 30,
    minWidth: 40,
    textAlign: 'center',
  },
  quantityTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  quantityTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  quantityTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  quantityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quantityCancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  quantityCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  quantityConfirmButton: {
    flex: 1,
    backgroundColor: '#E91E63',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  quantityConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
