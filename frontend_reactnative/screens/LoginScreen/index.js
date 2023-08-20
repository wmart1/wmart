import React, { useState, useContext } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { validateEmail } from '../../utils/ValidateEmail'
import { Icon } from 'react-native-elements'
import { COLORS, FONT1BOLD, FONT1MEDIUM, FONT1REGULAR } from '../../constants'
import { AppButton, AppInput } from '../../components'
import { loginUser, updateProfile } from '../../api/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppContext from '../../store/Context'
import Toast from 'react-native-simple-toast'
import { SvgXml } from 'react-native-svg'
import logo from '../../assets/svg/logo.svg'
import messaging from '@react-native-firebase/messaging'
import { useEffect } from 'react'

function LoginScreen ({ navigation }) {
  // Context
  const context = useContext(AppContext)
  const {
    setUser,
    _getItems,
    _getNotification,
    _getOrder,
    _getNearbyOrders,
    _getPaymentMethod,
    _getExtraServices
  } = context

  const [state, setState] = useState({
    email: 'test@1123.com',
    email1: 'test@1123.com',
    password: 'test@1123',
    isEmailValid: false,
    loading: false,
    showPassword: false,
    modalVisible: false,
    loadingReset: false
  })

  const {
    loading,
    loadingReset,
    showPassword,
    modalVisible,
    email,
    password,
    email1
  } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  useEffect(async () => {
    const email = await AsyncStorage.getItem('email')
    if (email) {
      handleChange('email', email)
    }
  }, [])

  const isEmailValid = () => {
    const isValid = validateEmail(state.email)
    if (!isValid) {
      setState(pre => ({ ...pre, email: '' }))
      alert('email is not valid')
    } else {
      setState(pre => ({ ...pre, isEmailValid: true }))
    }
  }

  const _updateProfile = async (id, token) => {
    try {
      console.warn('id,token', id, token)
      const registration_id = await messaging().getToken()
      console.warn('registration_id',registration_id);
      const body = { registration_id }
      await updateProfile(body, id, token)
    } catch (error) {
      const errorText = Object.values(error?.response?.data)
      if (errorText.length > 0) {
        Toast.show(`Error: ${errorText[0]}`)
      } else {
        Toast.show(`Error: ${error}`)
      }
    }
  }

  const handleLogin = async () => {
    try {
      handleChange('loading', true)
      const payload = {
        email,
        password
      }
      const res = await loginUser(payload)
      handleChange('loading', false)
      await AsyncStorage.setItem('email', email)
      await AsyncStorage.setItem('token', res?.data?.token)
      const user = res?.data?.user
      _updateProfile(user?.id, res?.data?.token)
      setUser(user)
      _getItems()
      _getNotification()
      _getPaymentMethod()
      _getExtraServices()
      if (!user?.customer?.location && user?.type === 'Customer') {
        navigation.navigate('Account')
        console.warn('user', user)
      } else if (
        user?.serviceprovider?.account?.payouts_enabled &&
        user?.type !== 'Customer'
      ) {
        _getOrder()
        _getNearbyOrders('?status=Pending')
        navigation.navigate('SetupAccount')
      } else if (user?.type === 'Customer') {
        navigation.navigate('MainTabNav')
      } else {
        _getOrder()
        _getNearbyOrders('?status=Pending')
        navigation.navigate('MainTabService')
      }
      // await AsyncStorage.setItem('user', JSON.stringify(res?.data?.user))
      // navigation.navigate('AuthLoading')
      Toast.show('Login Successfully!')
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

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <SvgXml
          xml={logo}
          height={60}
          style={{ marginTop: 30, marginBottom: 30 }}
        />
        <Text style={styles.loginText1}>Login</Text>
        <Text style={styles.loginText}>Complete your details to login</Text>
        <View style={styles.textInputContainer}>
          <AppInput
            inputLabel={'Email'}
            placeholder={'Email'}
            name={'email'}
            prefixBGTransparent
            onBlur={isEmailValid}
            value={state.email}
            onChange={handleChange}
          />
        </View>
        <View style={[styles.textInputContainer]}>
          <AppInput
            inputLabel={'Password'}
            placeholder={'Password'}
            prefixBGTransparent
            name={'password'}
            postfix={
              <TouchableOpacity
                onPress={() => handleChange('showPassword', !showPassword)}
              >
                {showPassword ? (
                  <Icon
                    name={'eye-outline'}
                    color={COLORS.black}
                    type={'ionicon'}
                    size={20}
                  />
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
            value={password}
            onChange={handleChange}
            secureTextEntry={!showPassword}
          />
        </View>
        <View style={styles.remeberContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText1}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.bottom}>
        <View style={styles.buttonWidth}>
          <AppButton
            title={'Login'}
            loading={loading}
            disabled={!email || !password}
            onPress={handleLogin}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.already}>Don’t have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('GettingStarted')}
          >
            <Text style={styles.loginTextBottom}> Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: wp('100%'),
    backgroundColor: COLORS.white,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  crossEnd: {
    width: '100%',
    alignItems: 'flex-end'
  },
  top: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20
  },
  bottom: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20
  },
  buttonWidth: { width: '80%', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  textInputContainer: { marginBottom: hp('2%'), width: '90%' },
  remeberContainer: {
    alignItems: 'flex-end',
    width: '90%',
    marginBottom: hp('2%')
  },
  forgotText: {
    color: COLORS.black,
    fontSize: hp(3),
    fontFamily: FONT1BOLD
  },
  forgotText1: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontSize: hp(2),
    fontFamily: FONT1REGULAR
  },
  signUpText: {
    marginTop: 20
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
  header: {
    width: '90%',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 30
  },
  orText: {
    color: COLORS.secondary,
    fontFamily: FONT1REGULAR,
    fontSize: hp(2.5)
  },
  signUp: {
    color: COLORS.secondary,
    fontFamily: FONT1BOLD,
    textDecorationLine: 'underline'
  },
  rowPassword: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rowAround: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '50%',
    marginTop: 20
  },
  centeredView: {
    flex: 1,
    backgroundColor: COLORS.modalBG,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalView: {
    backgroundColor: COLORS.backgroud,
    borderRadius: 20,
    width: '90%',
    paddingTop: 20,
    paddingHorizontal: '5%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  }
})

export default LoginScreen
