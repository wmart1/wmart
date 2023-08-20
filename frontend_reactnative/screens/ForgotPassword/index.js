import React, { useState, useEffect, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  TouchableOpacity,
  Modal
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { validateEmail } from '../../utils/ValidateEmail'
import { Icon } from 'react-native-elements'
import { COLORS, FONT1BOLD, FONT1MEDIUM, FONT1REGULAR } from '../../constants'
import { AppButton, AppInput, Header } from '../../components'
import { resetEmail } from '../../api/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppContext from '../../store/Context'
import Toast from 'react-native-simple-toast'
import { SvgXml } from 'react-native-svg'
import signupBG from '../../assets/svg/signupBG.svg'
import GoogleIcon from '../../assets/svg/google.svg'
import logo from '../../assets/svg/logo.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import FacebookIcon from '../../assets/svg/facebook.svg'
import AppleIcon from '../../assets/svg/apple.svg'

function LoginScreen ({ navigation }) {
  // Context
  const context = useContext(AppContext)
  const { setUser } = context

  const [state, setState] = useState({
    email: '',
    email1: '',
    password: '',
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

  const isEmailValid = () => {
    const isValid = validateEmail(state.email)
    if (!isValid) {
      setState(pre => ({ ...pre, email: '' }))
      alert('email is not valid')
    } else {
      setState(pre => ({ ...pre, isEmailValid: true }))
    }
  }

  const handleReset = async () => {
    try {
      handleChange('loading', true)
      const payload = {
        email
      }
      const res = await resetEmail(payload)
      handleChange('loading', false)
      setUser(res?.data?.user)
      navigation.navigate('CheckMail')
      Toast.show('Password reset email sent successfully, Please check email!')
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
        <Text style={styles.loginText1}>Forgot Password</Text>
        <Text style={styles.loginText}>
          Please enter your email and we will send you a link to return to your
          account
        </Text>
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
      </View>
      <View style={styles.bottom}>
        <View style={styles.buttonWidth}>
          <AppButton
            title={'Reset Password'}
            loading={loading}
            disabled={!email}
            onPress={handleReset}
          />
        </View>
        <View style={styles.row}></View>
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
    textAlign: 'center',
    width: '80%',
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
