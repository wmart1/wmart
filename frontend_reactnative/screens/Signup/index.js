import React, { useContext, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { CheckBox } from 'react-native-elements'
import { validateEmail } from '../../utils/ValidateEmail'
import { COLORS, FONT1MEDIUM, FONT1REGULAR } from '../../constants'
import { SvgXml } from 'react-native-svg'
import { AppButton, AppInput } from '../../components'
import Toast from 'react-native-simple-toast'
import { Icon } from 'react-native-elements'
import { signupUser } from '../../api/auth'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import logo from '../../assets/svg/logo.svg'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppContext from '../../store/Context'

function Signup ({ navigation }) {
  // Context
  const context = useContext(AppContext)
  const {
    setUser,
    userType: type,
    _getItems,
    _getNotification,
    _getOrder,
    _getNearbyOrders,
    _getPaymentMethod
  } = context
  // State
  const [state, setState] = useState({
    email: '',
    password: '',
    phone: '',
    confirm_password: '',
    loading: false,
    showPassword: false,
    showConfirmPassword: false,
    invalidPass: false,
    isEmailValid: false,
    modalVisible: false,
    accepted: false
  })

  const {
    isEmailValid,
    loading,
    accepted,
    email,
    name,
    showConfirmPassword,
    showPassword,
    confirm_password,
    modalVisible,
    password,
    phone,
    invalidPass
  } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  const _isEmailValid = () => {
    const isValid = validateEmail(email)
    if (!isValid) {
      handleChange('email', '')
      Toast.show('Email is not valid!')
    } else {
      handleChange('isEmailValid', true)
    }
  }
  const handleSignup = async () => {
    try {
      handleChange('loading', true)
      const payload = {
        email,
        password,
        type
      }
      const res = await signupUser(payload)
      handleChange('loading', false)
      await AsyncStorage.setItem('token', res?.data?.token)
      // await AsyncStorage.setItem('user', JSON.stringify(res?.data?.user))
      const user = res?.data?.user
      console.log('res?.data?.user', user?.serviceprovider)
      setUser(res?.data?.user)
      _getItems()
      _getNotification()
      _getPaymentMethod()
      console.warn('userData', user)
      if (!user?.customer?.location && user?.type === 'Customer') {
        navigation.navigate('Account', { isNew: true })
      } else if (!user?.serviceprovider?.account && user?.type !== 'Customer') {
        _getOrder()
        _getNearbyOrders('?status=Pending')
        navigation.navigate('SetupAccount')
      } else if (user?.type === 'Customer') {
        _getOrder()
        navigation.navigate('MainTabNav')
      } else {
        _getOrder()
        _getNearbyOrders('?status=Pending')
        navigation.navigate('MainTabService')
      }
      Toast.show('Sign Up Successfully!')
      // navigation.navigate('AuthLoading')
    } catch (error) {
      handleChange('loading', false)
      const errorText = Object.values(error?.response?.data)
      if (errorText.length > 0) {
        Toast.show(`Error: ${errorText[0]}`)
      } else {
        Toast.show(`Error: ${error}`)
      }
    }
  }

  const checkPass = () => {
    const regex = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/
    if (regex.test(password)) {
      if (password != '') {
        handleChange('invalidPass', false)
      } else {
        handleChange('password', '')
      }
    } else {
      handleChange('invalidPass', true)
    }
  }

  const handleClick = url => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url)
      } else {
        console.log("Don't know how to open URI: " + url)
      }
    })
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      contentContainerStyle={{
        alignItems: 'center',
        height: '100%',
        justifyContent: 'space-between'
      }}
    >
      <View style={styles.top}>
        <SvgXml
          xml={logo}
          height={60}
          style={{ marginTop: 30, marginBottom: 30 }}
        />
        <Text style={styles.loginText1}>Register Account</Text>
        <Text style={styles.loginText}>Create new account to get started</Text>
        <View style={styles.textInputContainer}>
          <AppInput
            inputLabel={'Email'}
            placeholder={'Email'}
            name={'email'}
            keyboardType='email-address'
            prefixBGTransparent
            value={email}
            onChange={handleChange}
            onBlur={_isEmailValid}
            isValid={isEmailValid}
          />
        </View>
        <View style={[styles.textInputContainer]}>
          <AppInput
            inputLabel={'Password'}
            placeholder={'Password'}
            name={'password'}
            value={password}
            prefixBGTransparent
            onBlur={checkPass}
            postfix={
              <TouchableOpacity
                onPress={() => handleChange('showPassword', !showPassword)}
              >
                {showPassword ? (
                  <Icon name={'eye-outline'} type={'ionicon'} size={20} />
                ) : (
                  <Icon
                    name={'eye-off-outline'}
                    color={COLORS.black}
                    type={'ionicon'}
                    size={20}
                  />
                )}
              </TouchableOpacity>
            }
            onChange={handleChange}
            secureTextEntry={!showPassword}
          />
        </View>
        {invalidPass ? (
          <View style={{ width: '90%', marginBottom: 10 }}>
            <Text style={styles.errorText}>
              Password must contain at least 6 characters, 1 number, 1 letter,
              any special characters
            </Text>
          </View>
        ) : null}
        <View style={[styles.textInputContainer]}>
          <AppInput
            inputLabel={'Confirm Password'}
            placeholder={'Confirm Password'}
            postfix={
              <TouchableOpacity
                onPress={() =>
                  handleChange('showConfirmPassword', !showConfirmPassword)
                }
              >
                {showConfirmPassword ? (
                  <Icon name={'eye-outline'} type={'ionicon'} size={20} />
                ) : (
                  <Icon
                    name={'eye-off-outline'}
                    color={COLORS.black}
                    type={'ionicon'}
                    size={20}
                  />
                )}
              </TouchableOpacity>
            }
            name={'confirm_password'}
            value={confirm_password}
            onChange={handleChange}
            secureTextEntry={!showConfirmPassword}
          />
        </View>
        {confirm_password && password !== confirm_password ? (
          <View style={styles.textFieldContainer}>
            <Text style={styles.errorText}>Password doesn't match</Text>
          </View>
        ) : null}
        <View style={styles.remeberContainer}>
          <CheckBox
            title={''}
            checkedIcon={
              <Icon
                name={'checkbox-marked'}
                type={'material-community'}
                color={COLORS.primary}
              />
            }
            containerStyle={styles.checkedBox}
            uncheckedIcon={
              <Icon
                name={'checkbox-blank-outline'}
                type={'material-community'}
                color={COLORS.inputBorder}
              />
            }
            onPress={() => handleChange('accepted', !accepted)}
            checked={accepted}
          />
          <Text style={styles.dontacount}>
            I have read & agree to{' '}
            <Text
              onPress={() =>
                handleClick('needtochange')
              }
              style={styles.signUp}
            >
              Terms and Conditions{' '}
            </Text>
          </Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <View style={styles.buttonWidth}>
          <AppButton
            disabled={
              !email ||
              !password ||
              !confirm_password ||
              password != confirm_password ||
              !accepted
            }
            loading={loading}
            color={COLORS.white}
            title={'Register'}
            onPress={handleSignup}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.already}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.loginTextBottom}> Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.white,
    height: '100%'
  },
  bottom: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20
  },
  top: {
    width: '100%',
    alignItems: 'center'
  },
  buttonWidth: { width: '80%', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowPassword: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  hLine: { height: 1, width: 100, backgroundColor: COLORS.grey },
  textInputContainer: { marginBottom: hp('2%'), width: '90%' },
  remeberContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%'
  },
  login: {
    backgroundColor: COLORS.white,
    width: 90,
    height: 65,
    borderTopLeftRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 100,
    marginRight: -20,
    borderBottomRightRadius: 100
  },
  header: {
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 30
  },
  loginText1: {
    color: COLORS.black,
    fontSize: hp(3),
    fontFamily: FONT1MEDIUM
  },
  already: {
    color: COLORS.black,
    fontSize: hp(2),
    fontFamily: FONT1REGULAR
  },
  loginTextBottom: {
    color: COLORS.primary,
    fontSize: hp(2),
    fontFamily: FONT1REGULAR
  },
  loginText: {
    color: COLORS.black06,
    fontSize: hp(2),
    marginTop: 5,
    marginBottom: 20,
    fontFamily: FONT1REGULAR
  },
  dontacount: {
    color: COLORS.black,
    fontSize: hp(1.8),
    marginLeft: -10,
    flexDirection: 'row',
    fontFamily: FONT1REGULAR
  },
  checkedBox: {
    backgroundColor: 'transparent',
    borderWidth: 0
  },
  signUp: {
    color: COLORS.primary,
    fontFamily: FONT1REGULAR
  },
  errorText: {
    color: COLORS.alertButon,
    fontFamily: FONT1REGULAR,
    fontSize: hp(1.8)
  }
})

export default Signup
