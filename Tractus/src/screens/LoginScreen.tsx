import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import authService from '../services/auth.service';

interface LoginScreenProps {
  onLogin?: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const { login } = useAuth();
  const { isDark, colors } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (isLogin) {
        const { token, user } = await authService.login(username.trim(), password);
        await login(token, user);
      } else {
        if (!email.trim() || !firstName.trim() || !lastName.trim() || !phoneNumber.trim() || !dateOfBirth.trim() || !gender) {
          setError('Please fill in all required fields.');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setIsSubmitting(false);
          return;
        }
        await authService.register({
          username: username.trim(),
          email: email.trim(),
          passwordHash: password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phoneNumber.trim(),
          dateOfBirth,
          gender,
        });
        const { token, user } = await authService.login(username.trim(), password);
        await login(token, user);
      }
      onLogin?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            {/* Header with Logo */}
            <View style={styles.header}>
              <Image
                source={require('../../assets/Tractus.svg')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
              <Text style={[styles.formTitle, { color: colors.primary }]}>
                {isLogin ? 'Welcome\nBack' : 'Create\nAccount'}
              </Text>
              <Text style={[styles.formSubtitle, { color: colors.textMuted }]}>
                {isLogin
                  ? 'Please enter your details to sign in.'
                  : 'Please enter your details to sign up.'}
              </Text>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                  placeholder="Username"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                    placeholder="Email Address"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              )}

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                    placeholder="First Name"
                    placeholderTextColor={colors.textMuted}
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
              )}

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                    placeholder="Last Name"
                    placeholderTextColor={colors.textMuted}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              )}

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                    placeholder="Telephone Number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>
              )}

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                    placeholder="Date of Birth (YYYY-MM-DD)"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numbers-and-punctuation"
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                  />
                </View>
              )}

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.genderLabel, { color: colors.textMuted }]}>Gender</Text>
                  <View style={styles.genderRow}>
                    {['Female', 'Male', 'Other', 'Prefer not to say'].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.genderChip, 
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          gender === option && { backgroundColor: colors.primary, borderColor: colors.primary }
                        ]}
                        onPress={() => setGender(option)}
                      >
                        <Text style={[
                          styles.genderChipText, 
                          { color: colors.textMuted },
                          gender === option && { color: '#ffffff' }
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                  placeholder="Password (••••••••••••)"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                    placeholder="Confirm Password (••••••••••••)"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
              )}

              {isLogin && (
                <View style={styles.formOptions}>
                  <TouchableOpacity
                    style={styles.rememberMe}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View style={[
                      styles.checkbox, 
                      { borderColor: colors.textMuted },
                      rememberMe && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]} />
                    <Text style={[styles.rememberMeText, { color: colors.textMuted }]}>Remember me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <Text style={[styles.forgotPassword, { color: colors.accent }]}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>
              )}

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.secondary, shadowColor: colors.secondary }, isSubmitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={isSubmitting}>
                <Text style={styles.submitBtnText}>
                  {isSubmitting ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                </Text>
              </TouchableOpacity>

              <View style={styles.toggleContainer}>
                <Text style={[styles.toggleText, { color: colors.textMuted }]}>
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                </Text>
                <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                  <Text style={[styles.toggleBtn, { color: colors.primary }]}>
                    {isLogin ? ' Sign up' : ' Sign in'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e3fbf6', // Match web app background
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 40,
  },
  formContainer: {
    width: '100%',
  },
  formTitle: {
    fontFamily: 'Urbanist',
    fontSize: 36,
    fontWeight: '800',
    color: '#2a067a', // Deep purple
    lineHeight: 40,
    marginBottom: 10,
  },
  formSubtitle: {
    fontFamily: 'Urbanist',
    fontSize: 15,
    color: '#666',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    fontFamily: 'Urbanist',
    fontSize: 16,
    color: '#333',
  },
  formOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: '#2a067a',
    borderColor: '#2a067a',
  },
  rememberMeText: {
    fontFamily: 'Urbanist',
    color: '#555',
    fontWeight: '500',
    fontSize: 14,
  },
  genderLabel: {
    fontFamily: 'Urbanist',
    color: '#555',
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 8,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  genderChipActive: {
    backgroundColor: '#2a067a',
    borderColor: '#2a067a',
  },
  genderChipText: {
    fontFamily: 'Urbanist',
    color: '#555',
    fontWeight: '500',
    fontSize: 13,
  },
  genderChipTextActive: {
    color: '#fff',
  },
  forgotPassword: {
    fontFamily: 'Urbanist',
    color: '#7fbd78', // Soft green
    fontWeight: '600',
    fontSize: 14,
  },
  errorText: {
    fontFamily: 'Urbanist',
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#fa477a', // Vibrant pink
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#fa477a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnText: {
    fontFamily: 'Urbanist',
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  toggleText: {
    fontFamily: 'Urbanist',
    color: '#666',
    fontSize: 15,
  },
  toggleBtn: {
    fontFamily: 'Urbanist',
    color: '#2a067a', // Deep purple
    fontWeight: '700',
    fontSize: 15,
  },
});
