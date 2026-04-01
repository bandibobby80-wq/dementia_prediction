// src/screens/user/PredictionScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import GradientBackground from '../../components/GradientBackground';
import StyledInput from '../../components/StyledInput';
import PrimaryButton from '../../components/PrimaryButton';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { runPrediction } from '../../services/apiService';
import { COLORS, FONTS, RADIUS } from '../../theme/colors';

// Picker-less gender selector
const GenderToggle = ({ value, onChange }) => (
  <View style={gt.row}>
    {['M', 'F'].map((g) => (
      <View
        key={g}
        style={[gt.option, value === g && gt.selected]}
      >
        <Text
          onPress={() => onChange(g)}
          style={[gt.label, value === g && gt.selectedLabel]}
        >
          {g === 'M' ? '♂ Male' : '♀ Female'}
        </Text>
      </View>
    ))}
  </View>
);
const gt = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  option: {
    flex: 1, paddingVertical: 12, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.bgInput, alignItems: 'center',
  },
  selected: { borderColor: COLORS.teal, backgroundColor: 'rgba(45,212,191,0.1)' },
  label:         { color: COLORS.textMuted, fontWeight: FONTS.weight.semibold },
  selectedLabel: { color: COLORS.teal },
});

const SAMPLE = {
  M_F: 'M', Age: '75', EDUC: '14', SES: '2', MMSE: '26',
  CDR: '0.5', eTIV: '1450', nWBV: '0.740', ASF: '1.21',
  Visit: '2', MR_Delay: '365',
};

const PredictionScreen = () => {
  const [form, setForm] = useState({
    M_F: 'M', Age: '', EDUC: '', SES: '', MMSE: '',
    CDR: '', eTIV: '', nWBV: '', ASF: '', Visit: '', MR_Delay: '',
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    const num = (k, min, max, label) => {
      const v = parseFloat(form[k]);
      if (isNaN(v)) e[k] = `${label} is required.`;
      else if (v < min || v > max) e[k] = `${label}: ${min}–${max}.`;
    };
    num('Age',      50, 120, 'Age');
    num('EDUC',      0,  30, 'Education years');
    num('SES',       1,   5, 'SES (1–5)');
    num('MMSE',      0,  30, 'MMSE (0–30)');
    num('CDR',       0,   2, 'CDR (0–2)');
    num('eTIV',    800, 2500,'eTIV');
    num('nWBV',   0.55, 0.9, 'nWBV');
    num('ASF',    0.80, 1.60,'ASF');
    num('Visit',     1,  10, 'Visit');
    num('MR_Delay',  0,1440, 'MR Delay');
    return e;
  };

  const handlePredict = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        M_F:      form.M_F,
        Age:      parseFloat(form.Age),
        EDUC:     parseFloat(form.EDUC),
        SES:      parseFloat(form.SES),
        MMSE:     parseFloat(form.MMSE),
        CDR:      parseFloat(form.CDR),
        eTIV:     parseFloat(form.eTIV),
        nWBV:     parseFloat(form.nWBV),
        ASF:      parseFloat(form.ASF),
        Visit:    parseInt(form.Visit),
        MR_Delay: parseInt(form.MR_Delay),
      };
      const res = await runPrediction(payload);
      if (res.success) {
        setResult(res);
      } else {
        Toast.show({ type: 'error', text1: 'Prediction Failed', text2: res.message });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fillSample = () => {
    setForm(SAMPLE);
    setErrors({});
    setResult(null);
  };

  const resetForm = () => {
    setForm({ M_F:'M',Age:'',EDUC:'',SES:'',MMSE:'',CDR:'',eTIV:'',nWBV:'',ASF:'',Visit:'',MR_Delay:'' });
    setErrors({});
    setResult(null);
  };

  const NumInput = ({ label, fkey, placeholder, step, ...props }) => (
    <StyledInput
      label={label} value={form[fkey]}
      onChangeText={set(fkey)} keyboardType="numeric"
      placeholder={placeholder} error={errors[fkey]}
      style={styles.halfInput} {...props}
    />
  );

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.titleRow}>
            <View style={styles.titleIcon}>
              <Ionicons name="pulse" size={22} color={COLORS.teal} />
            </View>
            <View>
              <Text style={styles.title}>Dementia Risk Prediction</Text>
              <Text style={styles.subtitle}>Enter patient clinical measurements</Text>
            </View>
          </View>

          {/* Form Card */}
          <Card style={styles.formCard}>
            <Text style={styles.groupLabel}>
              <Ionicons name="person-outline" size={13} color={COLORS.teal} />  Patient Gender
            </Text>
            <GenderToggle value={form.M_F} onChange={set('M_F')} />

            <Text style={styles.groupLabel}>
              <Ionicons name="body-outline" size={13} color={COLORS.teal} />  Demographics
            </Text>
            <View style={styles.row}>
              <NumInput label="Age (years)"  fkey="Age"  placeholder="e.g. 72" />
              <NumInput label="Education (yrs)" fkey="EDUC" placeholder="e.g. 14" />
            </View>
            <View style={styles.row}>
              <NumInput label="SES (1–5)"    fkey="SES"  placeholder="1=high" />
              <NumInput label="Visit No."    fkey="Visit" placeholder="e.g. 2" />
            </View>

            <Text style={styles.groupLabel}>
              <Ionicons name="fitness-outline" size={13} color={COLORS.teal} />  Clinical Scores
            </Text>
            <View style={styles.row}>
              <NumInput label="MMSE (0–30)"  fkey="MMSE" placeholder="0–30" />
              <NumInput label="CDR"          fkey="CDR"  placeholder="0 / 0.5 / 1 / 2" />
            </View>

            <Text style={styles.groupLabel}>
              <Ionicons name="scan-outline" size={13} color={COLORS.teal} />  MRI Measurements
            </Text>
            <View style={styles.row}>
              <NumInput label="eTIV (mm³)"   fkey="eTIV"  placeholder="e.g. 1450" />
              <NumInput label="nWBV"         fkey="nWBV"  placeholder="e.g. 0.74" />
            </View>
            <View style={styles.row}>
              <NumInput label="ASF"          fkey="ASF"      placeholder="e.g. 1.21" />
              <NumInput label="MR Delay (days)" fkey="MR_Delay" placeholder="e.g. 365" />
            </View>

            {/* Buttons */}
            <PrimaryButton
              title="Analyse & Predict"
              onPress={handlePredict}
              loading={loading}
              icon={<Ionicons name="analytics" size={18} color="#fff" />}
              style={{ marginTop: 4 }}
            />
            <View style={styles.secondaryBtns}>
              <PrimaryButton
                title="Fill Sample"
                onPress={fillSample}
                variant="ghost"
                style={styles.halfBtn}
                icon={<Ionicons name="sparkles-outline" size={16} color={COLORS.textMuted} />}
              />
              <PrimaryButton
                title="Reset"
                onPress={resetForm}
                variant="danger"
                style={styles.halfBtn}
                icon={<Ionicons name="refresh-outline" size={16} color="#fff" />}
              />
            </View>
          </Card>

          {/* Result Card */}
          {result && <ResultCard result={result} />}

          {/* Reference */}
          <Card style={styles.refCard}>
            <Text style={styles.refTitle}>
              <Ionicons name="book-outline" size={13} color={COLORS.teal} />  Clinical Feature Reference
            </Text>
            {REFS.map(({ abbr, desc }) => (
              <Text key={abbr} style={styles.refItem}>
                <Text style={styles.refAbbr}>{abbr} </Text>
                <Text style={styles.refDesc}>— {desc}</Text>
              </Text>
            ))}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const ResultCard = ({ result }) => {
  const isHigh = result.risk_level === 'high';
  return (
    <Card glow style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <View style={[styles.resultIconBox, { backgroundColor: isHigh ? COLORS.dangerDim : COLORS.successDim }]}>
          <Ionicons
            name={isHigh ? 'warning' : 'checkmark-circle'}
            size={36}
            color={isHigh ? COLORS.danger : COLORS.success}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.resultTitle, { color: isHigh ? COLORS.danger : COLORS.success }]}>
            {isHigh ? 'High Risk Detected' : 'Low Risk Detected'}
          </Text>
          <Badge label={`${isHigh ? '⚠' : '✓'} ${result.prediction}`} type={result.risk_level} />
        </View>
      </View>

      {result.confidence && (
        <View style={styles.confidenceSection}>
          <View style={styles.confRow}>
            <Text style={styles.confLabel}>Model Confidence</Text>
            <Text style={[styles.confValue, { color: COLORS.teal }]}>{result.confidence}%</Text>
          </View>
          <View style={styles.confBarBg}>
            <LinearGradient
              colors={isHigh ? COLORS.gradientDanger : COLORS.gradientTeal}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.confBarFg, { width: `${result.confidence}%` }]}
            />
          </View>
        </View>
      )}

      <View style={styles.resultNote}>
        <Ionicons name="information-circle-outline" size={13} color={COLORS.textDim} />
        <Text style={styles.resultNoteText}>
          Prediction based on a Random Forest model trained on OASIS dataset. Consult a medical professional for clinical decisions.
        </Text>
      </View>
    </Card>
  );
};

const REFS = [
  { abbr: 'MMSE', desc: 'Mini-Mental State Exam (0–30; lower = more impaired)' },
  { abbr: 'CDR',  desc: 'Clinical Dementia Rating (0=none, 0.5=mild, 1=moderate, 2=severe)' },
  { abbr: 'SES',  desc: 'Socioeconomic Status (1=highest, 5=lowest)' },
  { abbr: 'eTIV', desc: 'Estimated Total Intracranial Volume (mm³)' },
  { abbr: 'nWBV', desc: 'Normalised Whole Brain Volume (0–1 fraction)' },
  { abbr: 'ASF',  desc: 'Atlas Scaling Factor for brain-to-atlas alignment' },
];

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 16, paddingTop: 54, paddingBottom: 36 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  titleIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(45,212,191,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.borderTeal,
  },
  title:    { color: COLORS.white, fontSize: FONTS.size.lg, fontWeight: FONTS.weight.bold },
  subtitle: { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 2 },

  formCard: { marginBottom: 16 },
  groupLabel: {
    color: COLORS.tealLight, fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold, marginBottom: 10, marginTop: 6,
  },
  row: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },

  secondaryBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  halfBtn: { flex: 1 },

  resultCard: { marginBottom: 16 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  resultIconBox: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  resultTitle: { fontSize: FONTS.size.lg, fontWeight: FONTS.weight.bold, marginBottom: 6 },
  confidenceSection: { marginBottom: 12 },
  confRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  confLabel: { color: COLORS.textMuted, fontSize: FONTS.size.sm },
  confValue: { fontSize: FONTS.size.xl, fontWeight: FONTS.weight.extrabold },
  confBarBg: {
    height: 10, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.full, overflow: 'hidden',
  },
  confBarFg: { height: '100%', borderRadius: RADIUS.full },
  resultNote: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginTop: 4 },
  resultNoteText: { color: COLORS.textDim, fontSize: FONTS.size.xs, flex: 1, lineHeight: 17 },

  refCard: { marginBottom: 8 },
  refTitle: { color: COLORS.tealLight, fontSize: FONTS.size.sm, fontWeight: FONTS.weight.semibold, marginBottom: 10 },
  refItem:  { marginBottom: 6, lineHeight: 19 },
  refAbbr:  { color: COLORS.white, fontWeight: FONTS.weight.bold, fontSize: FONTS.size.sm },
  refDesc:  { color: COLORS.textMuted, fontSize: FONTS.size.sm },
});

export default PredictionScreen;
