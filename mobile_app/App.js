import React, { useState } from 'react';
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
  Keyboard
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const BASE_URL = 'https://personalized-dementia-prediction.onrender.com/api';

export default function App() {
  const [screen, setScreen] = useState('Login');
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  
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

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/history/${user.id}/`);
      const data = await response.json();
      if (response.ok) {
        setHistory(data.history || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
        setUser(data);
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
        Alert.alert('Success', data.message);
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
    const requiredFields = ['Age', 'EDUC', 'SES', 'MMSE', 'CDR', 'eTIV', 'nWBV', 'ASF'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        Alert.alert('Error', `Please enter valid data for ${field}`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/predict/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: user.id }),
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
          <Text style={styles.title}>Hello, {user.name}!</Text>
          <Text style={styles.subtitle}>AI-Powered Neuro-Analytic Dashboard</Text>
          <TouchableOpacity style={styles.card} onPress={() => setScreen('Form')}>
            <Text style={styles.cardText}>New Prediction →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.card, {marginTop: 15, borderLeftColor: '#f59e0b'}]} onPress={() => { setScreen('History'); fetchHistory(); }}>
            <Text style={styles.cardText}>Check History →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => {setUser(null); setScreen('Login');}}><Text style={styles.secondaryButtonText}>Logout</Text></TouchableOpacity>
        </View>
      )}

      {/* ── PREDICTION FORM ── */}
      {screen === 'Form' && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1}}>
          <ScrollView contentContainerStyle={styles.formContainer}>
            <Text style={styles.header}>Algorithm Input</Text>
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
          <Text style={styles.title}>AI Assessment</Text>
          <View style={[styles.resultCard, result.risk_level === 'high' ? styles.highRisk : styles.lowRisk]}>
            <Text style={styles.resultValue}>{result.prediction}</Text>
            <Text style={styles.resultLabel}>Confidence: {result.confidence}%</Text>
          </View>
          <TouchableOpacity style={styles.mainButton} onPress={() => setScreen('Dashboard')}><Text style={styles.buttonText}>Close</Text></TouchableOpacity>
        </View>
      )}

      {/* ── HISTORY SCREEN ── */}
      {screen === 'History' && (
        <View style={{flex:1}}>
          <Text style={[styles.header, {padding: 25, paddingTop: 60}]}>Diagnosis History</Text>
          {loading ? <ActivityIndicator size="large" color="#38bdf8" /> : (
            <FlatList
              data={history}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{padding: 25}}
              renderItem={({item}) => (
                <View style={[styles.historyItem, item.risk_level === 'high' ? styles.historyHigh : styles.historyLow]}>
                  <View>
                    <Text style={styles.historyDate}>{item.timestamp}</Text>
                    <Text style={styles.historyResult}>{item.result}</Text>
                    <Text style={styles.historySub}>Age: {item.age} | MMSE: {item.mmse}</Text>
                  </View>
                  <Text style={styles.historyConf}>{item.confidence}%</Text>
                </View>
              )}
            />
          )}
          <TouchableOpacity style={[styles.mainButton, {margin: 25}]} onPress={() => setScreen('Dashboard')}><Text style={styles.buttonText}>Back to Dashboard</Text></TouchableOpacity>
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
  historyConf: { color: '#38bdf8', fontSize: 20, fontWeight: 'bold' }
});
