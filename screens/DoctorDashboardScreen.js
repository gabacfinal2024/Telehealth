import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

export default function DoctorDashboardScreen({ route, navigation }) {
  const doctorName = route?.params?.userName || 'Doctor';
  const doctorEmail = route?.params?.userEmail || 'doctor@telehealth.com';

  const [activeTab, setActiveTab] = useState('home');
  const [appointments, setAppointments] = useState([
    { id: 1, patient: 'John Doe', reason: 'Chest pain', date: '2024-01-15', time: '10:00 AM', status: 'Upcoming' },
    { id: 2, patient: 'Maria Gomez', reason: 'Skin rash', date: '2024-01-16', time: '1:30 PM', status: 'Upcoming' },
    { id: 3, patient: 'Alex Chan', reason: 'Follow-up', date: '2024-01-14', time: '3:00 PM', status: 'Completed' },
  ]);
  const [chats, setChats] = useState([
    { id: 1, patient: 'John Doe', lastMessage: 'Thank you, doctor!', time: '2:30 PM', unread: 1 },
    { id: 2, patient: 'Maria Gomez', lastMessage: 'Here is the photo of the rash.', time: 'Yesterday', unread: 0 },
  ]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState({
    1: [
      { id: 1, text: 'Hello doctor, I had chest pain last night.', sender: 'patient', time: '2:00 PM' },
      { id: 2, text: 'Please avoid strenuous activity. We will check during your visit.', sender: 'doctor', time: '2:05 PM' },
    ],
    2: [
      { id: 1, text: 'I have a rash on my arm.', sender: 'patient', time: 'Yesterday' },
      { id: 2, text: 'Please send a clear photo and avoid scratching.', sender: 'doctor', time: 'Yesterday' },
    ],
  });
  const [newMessage, setNewMessage] = useState('');
  const [settings, setSettings] = useState({
    notifications: true,
    reminders: true,
    autoAccept: false,
    emailAlerts: true,
    pushAlerts: true,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace('SignIn');
  };

  const updateAppointmentStatus = (id, status) => {
    setAppointments(prev =>
      prev.map(a => (a.id === id ? { ...a, status } : a))
    );
  };

  const openChat = (chat) => {
    setSelectedChat(chat);
    setChatModalVisible(true);
    if (chat.unread > 0) {
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
    }
  };

  const sendMessage = () => {
    if (!selectedChat || !newMessage.trim()) return;
    const msg = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: 'doctor',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), msg],
    }));
    setNewMessage('');
  };

  const renderHome = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <LinearGradient colors={['#9C27B0', '#E91E63']} style={styles.headerCard}>
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <Text style={styles.doctorEmail}>{doctorEmail}</Text>
          </View>
          <Ionicons name="medkit" size={48} color="#FFF" />
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity style={styles.quickCard} onPress={() => setActiveTab('appointments')}>
            <Ionicons name="calendar" size={24} color="#E91E63" />
            <Text style={styles.quickText}>Appointments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => setActiveTab('chats')}>
            <Ionicons name="chatbubble" size={24} color="#2196F3" />
            <Text style={styles.quickText}>Patient Chats</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => setActiveTab('settings')}>
            <Ionicons name="settings" size={24} color="#4CAF50" />
            <Text style={styles.quickText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        </View>
        {appointments.filter(a => a.status === 'Upcoming').length === 0 ? (
          <Text style={styles.emptyText}>No upcoming appointments</Text>
        ) : (
          appointments
            .filter(a => a.status === 'Upcoming')
            .map(a => (
              <View key={a.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <Ionicons name="person-circle" size={36} color="#E91E63" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.patientName}>{a.patient}</Text>
                    <Text style={styles.appointmentInfo}>{a.reason}</Text>
                  </View>
                  <TouchableOpacity onPress={() => updateAppointmentStatus(a.id, 'Completed')}>
                    <Ionicons name="checkmark-circle" size={26} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
                <View style={styles.appointmentMeta}>
                  <Text style={styles.metaText}>📅 {a.date}</Text>
                  <Text style={styles.metaText}>🕒 {a.time}</Text>
                  <Text style={styles.metaStatus}>{a.status}</Text>
                </View>
              </View>
            ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Patient Chats</Text>
        </View>
        {chats.length === 0 ? (
          <Text style={styles.emptyText}>No chats yet</Text>
        ) : (
          chats.map(c => (
            <TouchableOpacity key={c.id} style={styles.chatCard} onPress={() => openChat(c)}>
              <View style={styles.chatInfoLeft}>
                <Ionicons name="person-circle" size={40} color="#2196F3" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>{c.patient}</Text>
                <Text style={styles.chatPreview} numberOfLines={1}>{c.lastMessage}</Text>
              </View>
              <View style={styles.chatMeta}>
                <Text style={styles.chatTime}>{c.time}</Text>
                {c.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{c.unread}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );

  const renderAppointments = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>All Appointments</Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <Ionicons name="person-circle" size={36} color="#E91E63" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.patientName}>{item.patient}</Text>
                <Text style={styles.appointmentInfo}>{item.reason}</Text>
              </View>
              <View style={styles.badge(item.status)}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.appointmentMeta}>
              <Text style={styles.metaText}>📅 {item.date}</Text>
              <Text style={styles.metaText}>🕒 {item.time}</Text>
            </View>
            <View style={styles.appointmentActions}>
              <TouchableOpacity onPress={() => updateAppointmentStatus(item.id, 'Completed')}>
                <Text style={styles.actionText}>Mark Completed</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => updateAppointmentStatus(item.id, 'Cancelled')}>
                <Text style={[styles.actionText, { color: '#FF5722' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );

  const renderChats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Patient Chats</Text>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatCard} onPress={() => openChat(item)}>
            <View style={styles.chatInfoLeft}>
              <Ionicons name="person-circle" size={40} color="#2196F3" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>{item.patient}</Text>
              <Text style={styles.chatPreview} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            <View style={styles.chatMeta}>
              <Text style={styles.chatTime}>{item.time}</Text>
              {item.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderSettings = () => (
    <ScrollView style={styles.section}>
      <Text style={styles.sectionTitle}>Settings</Text>
      <TouchableOpacity style={styles.settingRow} onPress={() => setSettings(s => ({ ...s, notifications: !s.notifications }))}>
        <View style={styles.settingLeft}>
          <Ionicons name="notifications-outline" size={22} color="#666" />
          <Text style={styles.settingText}>Notifications</Text>
        </View>
        <Text style={styles.settingValue}>{settings.notifications ? 'On' : 'Off'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingRow} onPress={() => setSettings(s => ({ ...s, reminders: !s.reminders }))}>
        <View style={styles.settingLeft}>
          <Ionicons name="alarm-outline" size={22} color="#666" />
          <Text style={styles.settingText}>Appointment Reminders</Text>
        </View>
        <Text style={styles.settingValue}>{settings.reminders ? 'On' : 'Off'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingRow} onPress={() => setSettings(s => ({ ...s, autoAccept: !s.autoAccept }))}>
        <View style={styles.settingLeft}>
          <Ionicons name="checkmark-done-outline" size={22} color="#666" />
          <Text style={styles.settingText}>Auto-accept Follow-ups</Text>
        </View>
        <Text style={styles.settingValue}>{settings.autoAccept ? 'On' : 'Off'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingRow} onPress={() => setSettings(s => ({ ...s, emailAlerts: !s.emailAlerts }))}>
        <View style={styles.settingLeft}>
          <Ionicons name="mail-outline" size={22} color="#666" />
          <Text style={styles.settingText}>Email Alerts</Text>
        </View>
        <Text style={styles.settingValue}>{settings.emailAlerts ? 'On' : 'Off'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingRow} onPress={() => setSettings(s => ({ ...s, pushAlerts: !s.pushAlerts }))}>
        <View style={styles.settingLeft}>
          <Ionicons name="phone-portrait-outline" size={22} color="#666" />
          <Text style={styles.settingText}>Push Alerts</Text>
        </View>
        <Text style={styles.settingValue}>{settings.pushAlerts ? 'On' : 'Off'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'appointments':
        return renderAppointments();
      case 'chats':
        return renderChats();
      case 'settings':
        return renderSettings();
      default:
        return renderHome();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E91E63', '#9C27B0']} style={styles.topBar}>
        <Text style={styles.appTitle}>TELEHEALTH</Text>
        <TouchableOpacity onPress={() => setActiveTab('settings')}>
          <Ionicons name="settings-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.mainContent}>
        {renderContent()}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
          <Ionicons name="home" size={22} color={activeTab === 'home' ? '#E91E63' : '#999'} />
          <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('appointments')}>
          <Ionicons name="calendar" size={22} color={activeTab === 'appointments' ? '#E91E63' : '#999'} />
          <Text style={[styles.navText, activeTab === 'appointments' && styles.navTextActive]}>Appointments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('chats')}>
          <Ionicons name="chatbubble" size={22} color={activeTab === 'chats' ? '#E91E63' : '#999'} />
          <Text style={[styles.navText, activeTab === 'chats' && styles.navTextActive]}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('settings')}>
          <Ionicons name="settings" size={22} color={activeTab === 'settings' ? '#E91E63' : '#999'} />
          <Text style={[styles.navText, activeTab === 'settings' && styles.navTextActive]}>Settings</Text>
        </TouchableOpacity>
      </View>

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
                  <Ionicons name="person-circle" size={32} color="#2196F3" />
                  <Text style={styles.chatHeaderName}>{selectedChat.patient}</Text>
                </View>
                <View style={{ width: 24 }} />
              </View>

              <FlatList
                style={styles.chatMessagesList}
                data={chatMessages[selectedChat.id] || []}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={[
                    styles.messageContainer,
                    item.sender === 'doctor' ? styles.doctorMessage : styles.patientMessage
                  ]}>
                    <Text style={[
                      styles.messageText,
                      item.sender === 'doctor' ? styles.doctorMessageText : styles.patientMessageText
                    ]}>
                      {item.text}
                    </Text>
                    <Text style={[
                      styles.messageTime,
                      item.sender === 'doctor' ? styles.doctorMessageTime : styles.patientMessageTime
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  topBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  content: { flex: 1, paddingBottom: 100 },
  mainContent: { flex: 1, paddingBottom: 110 },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  headerCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: { color: '#FFF', fontSize: 14, marginBottom: 4 },
  doctorName: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  doctorEmail: { color: '#FFF', fontSize: 14, opacity: 0.9 },
  quickGrid: { flexDirection: 'row', gap: 12, marginTop: 12 },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  quickText: { marginTop: 8, fontSize: 14, color: '#333', fontWeight: '600' },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  appointmentHeader: { flexDirection: 'row', alignItems: 'center' },
  patientName: { fontSize: 16, fontWeight: '700', color: '#333' },
  appointmentInfo: { fontSize: 14, color: '#666', marginTop: 4 },
  appointmentMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  metaText: { fontSize: 13, color: '#666' },
  metaStatus: { fontSize: 13, color: '#4CAF50', fontWeight: '700' },
  appointmentActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  actionText: { color: '#E91E63', fontWeight: '600' },
  badge: (status) => ({
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: status === 'Completed' ? '#4CAF50' : status === 'Cancelled' ? '#FF5722' : '#FFC107',
  }),
  badgeText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  chatInfoLeft: { marginRight: 12 },
  chatPreview: { fontSize: 13, color: '#666', marginTop: 4 },
  chatMeta: { alignItems: 'flex-end' },
  chatTime: { fontSize: 12, color: '#999' },
  unreadBadge: {
    marginTop: 6,
    backgroundColor: '#E91E63',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  emptyText: { color: '#888', fontSize: 14, marginTop: 8 },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
  },
  navItem: { alignItems: 'center', flex: 1 },
  navText: { fontSize: 12, color: '#999', marginTop: 4 },
  navTextActive: { color: '#E91E63', fontWeight: '700' },
  chatModalContainer: { flex: 1, backgroundColor: '#F5F5F5' },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  chatHeaderInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 12 },
  chatHeaderName: { fontSize: 18, fontWeight: '600', color: '#333', marginLeft: 12 },
  chatMessagesList: { flex: 1, padding: 16 },
  messageContainer: { maxWidth: '75%', marginBottom: 12, borderRadius: 12, padding: 12 },
  doctorMessage: { alignSelf: 'flex-end', backgroundColor: '#E91E63', borderBottomRightRadius: 4 },
  patientMessage: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 20, marginBottom: 4 },
  doctorMessageText: { color: '#FFF' },
  patientMessageText: { color: '#333' },
  messageTime: { fontSize: 10, alignSelf: 'flex-end' },
  doctorMessageTime: { color: '#FFF', opacity: 0.8 },
  patientMessageTime: { color: '#999' },
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
  sendButtonDisabled: { backgroundColor: '#CCC' },
  settingRow: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingText: { fontSize: 15, color: '#333', fontWeight: '600' },
  settingValue: { fontSize: 14, color: '#666' },
  logoutRow: {
    backgroundColor: '#FFF5F5',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE7E7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  logoutText: { color: '#FF3B30', fontWeight: '700', fontSize: 15 },
});

