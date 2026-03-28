import React, { useMemo, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  RefreshControl
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const BASE_URL = 'https://personalized-dementia-prediction.onrender.com/api';

export default function App() {
  const [screen, setScreen] = useState('Login');
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState('');
  const [historyRefreshing, setHistoryRefreshing] = useState(false);
  
  // Auth States
  const [name, setName] = useState('');
  const [loginid, setLoginid] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  // Prediction App State
  const [formData, setFormData] = useState({
    M_F: 'M', Age: '', EDUC: '', SES: '', MMSE: '', CDR: '', eTIV: '', nWBV: '', ASF: '', Visit: '1', MR_Delay: '0',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const userId = useMemo(() => {
    if (!user) return null;
    return user.id ?? user.user_id ?? user.pk ?? user.uid ?? null;
  }, [user]);

  const normalizeRiskLevel = (value) => {
    const v = String(value ?? '').toLowerCase();
    if (v === 'high' || v === 'low' || v === 'medium') return v;
    return '';
  };

  const normalizeLoginResponse = (data) => {
    if (!data) return null;
    const u = data.user ?? data.account ?? data.profile ?? data;
    if (u && typeof u === 'object') return u;
    return null;
  };

  const parseNumberOrNull = (value) => {
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  const sanitizeGender = (value) => {
    const v = String(value ?? '').trim().toUpperCase();
    return v === 'F' ? 'F' : 'M';
  };

  const fetchHistory = async ({ refreshing = false } = {}) => {
    if (!userId) return;
    setHistoryError('');
    if (refreshing) setHistoryRefreshing(true);
    else setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/history/${userId}/`);
      const data = await response.json();
      if (response.ok) {
        const items = data.history ?? data.results ?? data.items ?? data ?? [];
        setHistory(Array.isArray(items) ? items : []);
      } else {
        setHistory([]);
        setHistoryError(data?.error || data?.message || 'Unable to load history.');
      }
    } catch (e) {
      setHistory([]);
      setHistoryError('Network error while loading history.');
    } finally {
      if (refreshing) setHistoryRefreshing(false);
      else setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginid || !password) {
      Alert.alert('Error', 'Please enter both Login ID and Password');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginid: loginid.trim(), password: password.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        const normalized = normalizeLoginResponse(data);
        if (!normalized) {
          Alert.alert('Login Failed', 'Unexpected server response.');
          return;
        }
        setUser(normalized);
        setScreen('Dashboard');
      } else {
        Alert.alert('Login Failed', data.error || 'Check your credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to server. Check your internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!loginid || !password || !name) {
      Alert.alert('Error', 'Name, ID, and Password are required.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, loginid, password, email, mobile }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', data.message || 'Account created. Please login.');
        setScreen('Login');
      } else {
        Alert.alert('Registration Failed', data.error || 'Server error');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please login again.');
      setScreen('Login');
      return;
    }
    const requiredFields = ['Age', 'EDUC', 'SES', 'MMSE', 'CDR', 'eTIV', 'nWBV', 'ASF'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        Alert.alert('Error', `Please enter valid data for ${field}`);
        return;
      }
    }

    const payload = {
      ...formData,
      M_F: sanitizeGender(formData.M_F),
      Age: parseNumberOrNull(formData.Age),
      EDUC: parseNumberOrNull(formData.EDUC),
      SES: parseNumberOrNull(formData.SES),
      MMSE: parseNumberOrNull(formData.MMSE),
      CDR: parseNumberOrNull(formData.CDR),
      eTIV: parseNumberOrNull(formData.eTIV),
      nWBV: parseNumberOrNull(formData.nWBV),
      ASF: parseNumberOrNull(formData.ASF),
      Visit: parseNumberOrNull(formData.Visit) ?? 1,
      MR_Delay: parseNumberOrNull(formData.MR_Delay) ?? 0,
      user_id: userId,
    };

    for (const field of requiredFields) {
      if (payload[field] === null) {
        Alert.alert('Error', `Please enter valid numeric data for ${field}`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/predict/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data);
        setScreen('Result');
      } else {
        Alert.alert('Error', data.error || 'Prediction failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setHistory([]);
    setResult(null);
    setHistoryError('');
    setScreen('Login');
    setPassword('');
  };

  const Header = ({ title, onBack, rightLabel, onRight }) => (
    <View style={styles.topBar}>
      <TouchableOpacity onPress={onBack} style={styles.topBarBtn}>
        <Text style={styles.topBarBtnText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.topBarTitle} numberOfLines={1}>{title}</Text>
      {rightLabel ? (
        <TouchableOpacity onPress={onRight} style={styles.topBarBtn}>
          <Text style={styles.topBarBtnText}>{rightLabel}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.topBarBtn} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* ── LOGIN SCREEN ── */}
      {screen === 'Login' && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1}}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.centerContainer}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Login to access Dementia AI</Text>
              <TextInput 
                style={styles.inputFull} 
                placeholder="Login ID" 
                placeholderTextColor="#64748b" 
                value={loginid}
                onChangeText={setLoginid} 
                autoCapitalize="none"
              />
              <TextInput 
                style={styles.inputFull} 
                placeholder="Password" 
                secureTextEntry 
                placeholderTextColor="#64748b" 
                value={password}
                onChangeText={setPassword} 
              />
              <TouchableOpacity style={styles.mainButton} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.buttonText}>Login</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setScreen('Signup')}><Text style={styles.linkText}>Don't have an account? Sign Up</Text></TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      )}

      {/* ── SIGNUP SCREEN ── */}
      {screen === 'Signup' && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1}}>
          <ScrollView contentContainerStyle={styles.formContainer}>
            <Text style={styles.header}>Create Account</Text>
            <TextInput style={styles.inputFull} placeholder="Full Name" placeholderTextColor="#64748b" value={name} onChangeText={setName} />
            <TextInput style={styles.inputFull} placeholder="Login ID" autoCapitalize="none" placeholderTextColor="#64748b" value={loginid} onChangeText={setLoginid} />
            <TextInput style={styles.inputFull} placeholder="Password" secureTextEntry placeholderTextColor="#64748b" value={password} onChangeText={setPassword} />
            <TextInput style={styles.inputFull} placeholder="Email" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#64748b" value={email} onChangeText={setEmail} />
            <TextInput style={styles.inputFull} placeholder="Mobile" keyboardType="phone-pad" placeholderTextColor="#64748b" value={mobile} onChangeText={setMobile} />
            <TouchableOpacity style={styles.mainButton} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.buttonText}>Sign Up</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setScreen('Login')}><Text style={styles.linkText}>Already registered? Login</Text></TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* ── DASHBOARD SCREEN ── */}
      {screen === 'Dashboard' && user && (
        <View style={styles.centerContainer}>
          <Text style={styles.title}>Hello, {user.name || user.username || 'User'}!</Text>
          <Text style={styles.subtitle}>AI-Powered Neuro-Analytic Dashboard</Text>
          <TouchableOpacity style={styles.card} onPress={() => setScreen('Form')}>
            <Text style={styles.cardText}>New Prediction →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.card, {marginTop: 15, borderLeftColor: '#f59e0b'}]} onPress={() => { setScreen('History'); fetchHistory(); }}>
            <Text style={styles.cardText}>Check History →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.card, {marginTop: 15, borderLeftColor: '#a78bfa'}]} onPress={() => setScreen('Profile')}>
            <Text style={styles.cardText}>My Profile →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleLogout}><Text style={styles.secondaryButtonText}>Logout</Text></TouchableOpacity>
        </View>
      )}

      {/* ── PREDICTION FORM ── */}
      {screen === 'Form' && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1}}>
          <ScrollView contentContainerStyle={styles.formContainer}>
            <Header title="Algorithm Input" onBack={() => setScreen('Dashboard')} />
            <View style={styles.row}>
              <TextInput style={[styles.input, {flex:1}]} placeholder="Gender (M/F)" value={formData.M_F} placeholderTextColor="#64748b" onChangeText={(v) => setFormData({...formData, M_F: v})} />
              <View style={{width:10}}/><TextInput style={[styles.input, {flex:1}]} placeholder="Age" value={formData.Age} keyboardType="numeric" placeholderTextColor="#64748b" onChangeText={(v) => setFormData({...formData, Age: v})} />
            </View>
            <View style={styles.row}><TextInput style={[styles.input, {flex:1}]} placeholder="EDUC" value={formData.EDUC} keyboardType="numeric" placeholderTextColor="#64748b" onChangeText={(v) => setFormData({...formData, EDUC: v})} /><View style={{width:10}}/><TextInput style={[styles.input, {flex:1}]} placeholder="SES" value={formData.SES} keyboardType="numeric" placeholderTextColor="#64748b" onChangeText={(v) => setFormData({...formData, SES: v})} /></View>
            <View style={styles.row}><TextInput style={[styles.input, {flex:1}]} placeholder="MMSE" value={formData.MMSE} keyboardType="numeric" placeholderTextColor="#64748b" onChangeText={(v) => setFormData({...formData, MMSE: v})} /><View style={{width:10}}/><TextInput style={[styles.input, {flex:1}]} placeholder="CDR" value={formData.CDR} keyboardType="numeric" placeholderTextColor="#64748b" onChangeText={(v) => setFormData({...formData, CDR: v})} /></View>
            <View style={styles.row}><TextInput style={[styles.input, {flex:1}]} placeholder="eTIV" value={formData.eTIV} keyboardType="numeric" placeholderTextColor="#64748b" onChangeText={(v) => setFormData({...formData, eTIV: v})} /><View style={{width:10}}/><TextInput style={[styles.input, {flex:1}]} placeholder="nWBV" value={formData.nWBV} keyboardType="numeric" placeholderTextColor="#64748b" onChangeText={(v) => setFormData({...formData, nWBV: v})} /></View>
            <TextInput style={styles.inputFull} placeholder="ASF" value={formData.ASF} keyboardType="numeric" placeholderTextColor="#64748b" onChangeText={(v) => setFormData({...formData, ASF: v})} />
            <TouchableOpacity style={styles.mainButton} onPress={handlePredict} disabled={loading}>{loading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.buttonText}>Generate AI Result</Text>}</TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('Dashboard')}><Text style={styles.secondaryButtonText}>Cancel</Text></TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* ── RESULT SCREEN ── */}
      {screen === 'Result' && result && (
        <View style={styles.centerContainer}>
          <Header title="AI Assessment" onBack={() => setScreen('Dashboard')} />
          <View style={[styles.resultCard, normalizeRiskLevel(result.risk_level) === 'high' ? styles.highRisk : styles.lowRisk]}>
            <Text style={styles.resultValue}>{String(result.prediction ?? result.result ?? 'Result')}</Text>
            <Text style={styles.resultLabel}>Confidence: {String(result.confidence ?? result.probability ?? '—')}%</Text>
          </View>
          <TouchableOpacity style={styles.mainButton} onPress={() => setScreen('Dashboard')}><Text style={styles.buttonText}>Close</Text></TouchableOpacity>
        </View>
      )}

      {/* ── HISTORY SCREEN ── */}
      {screen === 'History' && (
        <View style={{flex:1}}>
          <Header title="Diagnosis History" onBack={() => setScreen('Dashboard')} rightLabel="Refresh" onRight={() => fetchHistory({ refreshing: true })} />
          {loading ? <ActivityIndicator size="large" color="#38bdf8" /> : (
            <FlatList
              data={history}
              keyExtractor={(item, idx) => String(item?.id ?? item?.pk ?? idx)}
              contentContainerStyle={{padding: 25, paddingTop: 10}}
              refreshControl={<RefreshControl refreshing={historyRefreshing} onRefresh={() => fetchHistory({ refreshing: true })} tintColor="#38bdf8" />}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>{historyError ? 'Could not load history' : 'No history yet'}</Text>
                  <Text style={styles.emptySub}>{historyError || 'Run your first prediction to see results here.'}</Text>
                </View>
              }
              renderItem={({item}) => (
                <View style={[styles.historyItem, normalizeRiskLevel(item?.risk_level) === 'high' ? styles.historyHigh : styles.historyLow]}>
                  <View>
                    <Text style={styles.historyDate}>{String(item?.timestamp ?? item?.created_at ?? item?.date ?? '—')}</Text>
                    <Text style={styles.historyResult}>{String(item?.result ?? item?.prediction ?? '—')}</Text>
                    <Text style={styles.historySub}>Age: {String(item?.age ?? '—')} | MMSE: {String(item?.mmse ?? '—')}</Text>
                  </View>
                  <Text style={styles.historyConf}>{String(item?.confidence ?? item?.probability ?? '—')}%</Text>
                </View>
              )}
            />
          )}
          <TouchableOpacity style={[styles.mainButton, {margin: 25}]} onPress={() => setScreen('Dashboard')}><Text style={styles.buttonText}>Back to Dashboard</Text></TouchableOpacity>
        </View>
      )}

      {/* ── PROFILE SCREEN ── */}
      {screen === 'Profile' && (
        <View style={{flex:1}}>
          <Header title="My Profile" onBack={() => setScreen('Dashboard')} />
          <View style={{padding: 25}}>
            <View style={styles.profileCard}>
              <Text style={styles.profileName}>{user?.name || user?.username || 'User'}</Text>
              <Text style={styles.profileField}>Login ID: {String(user?.loginid ?? user?.login_id ?? user?.id ?? '—')}</Text>
              <Text style={styles.profileField}>Email: {String(user?.email ?? '—')}</Text>
              <Text style={styles.profileField}>Mobile: {String(user?.mobile ?? user?.phone ?? '—')}</Text>
            </View>
            <TouchableOpacity style={[styles.mainButton, {marginTop: 15}]} onPress={() => { setScreen('History'); fetchHistory(); }}>
              <Text style={styles.buttonText}>View My History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleLogout}>
              <Text style={styles.secondaryButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25 },
  formContainer: { padding: 25, paddingTop: 60 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#38bdf8', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 35, textAlign: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc', marginBottom: 15 },
  inputFull: { width: '100%', backgroundColor: '#1e293b', color: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  input: { backgroundColor: '#1e293b', color: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  row: { flexDirection: 'row' },
  mainButton: { backgroundColor: '#38bdf8', width: '100%', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#0f172a', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#38bdf8', marginTop: 20, fontSize: 16, textAlign: 'center' },
  secondaryButton: { marginTop: 15, alignItems: 'center' },
  secondaryButtonText: { color: '#64748b', fontSize: 16 },
  card: { backgroundColor: '#1e293b', width: '100%', padding: 30, borderRadius: 20, borderLeftWidth: 5, borderLeftColor: '#38bdf8' },
  cardText: { color: '#f8fafc', fontSize: 22, fontWeight: 'bold' },
  resultCard: { width: '100%', padding: 30, borderRadius: 20, marginBottom: 30, alignItems: 'center' },
  highRisk: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: '#ef4444' },
  lowRisk: { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderWidth: 1, borderColor: '#22c55e' },
  resultValue: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  resultLabel: { color: '#94a3b8', marginTop: 10, fontSize: 18 },
  historyItem: { width: '100%', padding: 20, borderRadius: 15, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyHigh: { backgroundColor: 'rgba(239, 68, 68, 0.05)', borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  historyLow: { backgroundColor: 'rgba(34, 197, 94, 0.05)', borderLeftWidth: 4, borderLeftColor: '#22c55e' },
  historyDate: { color: '#64748b', fontSize: 12 },
  historyResult: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  historySub: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  historyConf: { color: '#38bdf8', fontSize: 20, fontWeight: 'bold' },

  topBar: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center' },
  topBarBtn: { width: 90, paddingVertical: 8 },
  topBarBtnText: { color: '#38bdf8', fontSize: 16 },
  topBarTitle: { flex: 1, color: '#f8fafc', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },

  emptyState: { paddingTop: 30, paddingHorizontal: 10 },
  emptyTitle: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  emptySub: { color: '#94a3b8', fontSize: 14, textAlign: 'center' },

  profileCard: { backgroundColor: '#1e293b', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#334155' },
  profileName: { color: '#f8fafc', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  profileField: { color: '#94a3b8', fontSize: 14, marginBottom: 6 }
});
