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

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
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
              <Text style={styles.formTitle}>
                {isLogin ? 'Welcome\nBack' : 'Create\nAccount'}
              </Text>
              <Text style={styles.formSubtitle}>
                {isLogin
                  ? 'Please enter your details to sign in.'
                  : 'Please enter your details to sign up.'}
              </Text>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#aaa"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#aaa"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Password (••••••••••••)"
                  placeholderTextColor="#aaa"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password (••••••••••••)"
                    placeholderTextColor="#aaa"
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
                    <View style={[styles.checkbox, rememberMe && styles.checkboxActive]} />
                    <Text style={styles.rememberMeText}>Remember me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <Text style={styles.forgotPassword}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.submitBtn}>
                <Text style={styles.submitBtnText}>
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>

              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                </Text>
                <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                  <Text style={styles.toggleBtn}>
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
  forgotPassword: {
    fontFamily: 'Urbanist',
    color: '#7fbd78', // Soft green
    fontWeight: '600',
    fontSize: 14,
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
