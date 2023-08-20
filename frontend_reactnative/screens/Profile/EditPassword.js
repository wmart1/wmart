import React, { useContext, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { Icon } from 'react-native-elements'
import { COLORS, FONT1BOLD, FONT1REGULAR } from '../../constants'
import { AppButton, AppInput, Header } from '../../components'
import { setPassword } from '../../api/auth'
import Toast from 'react-native-simple-toast'
import AppContext from '../../store/Context'
import AsyncStorage from '@react-native-async-storage/async-storage'

function EditPassword ({ navigation }) {
  // Context
  const context = useContext(AppContext)
  const { isForgot, setIsForgot } = context

  // State
  const [state, setState] = useState({
    password: '',
    confirm_password: '',
    loading: false,
    showPassword: false,
    showConfirmPassword: false,
    invalidPass: false
  })

  const {
    loading,
    showPassword,
    showConfirmPassword,
    confirm_password,
    password,
    invalidPass
  } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  const handlePassword = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      handleChange('loading', true)
      const payload = {
        password_1: password,
        password_2: confirm_password
      }
      const res = await setPassword(payload, token)
      if (res?.status === 200) {
        handleChange('loading', false)
        navigation.goBack()
        Toast.show('Password has been changed!')
      } else {
        console.warn('else res', res)
        handleChange('loading', false)
        Toast.show('Something went wrong!')
      }
    } catch (error) {
      handleChange('loading', false)
      console.warn('err', error)
      Toast.show(`Error: ${error.message}`)
    }
  }

  const checkPass = () => {
    const regex = /^.{6,}$/
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

  const goBack = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header
          back
          backColor={COLORS.white}
          title={'Change Password'}
          blueBG
          rightEmpty
        />
      </View>
      <View style={styles.mainBody}>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <View style={styles.textInputContainer}>
            <AppInput
              label={'Password'}
              placeholder={'New Password'}
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
          {invalidPass && (
            <View style={styles.textFieldContainer}>
              <Text style={styles.errorText}>
                Password at least 6 characters
              </Text>
            </View>
          )}
          <View style={styles.textInputContainer}>
            <AppInput
              label={'Password'}
              placeholder={'Confirm New Password'}
              prefixBGTransparent
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
        </View>
        <View style={styles.buttonWidth}>
          <AppButton
            title={'Save'}
            loading={loading}
            disabled={!password || !confirm_password}
            onPress={handlePassword}
          />
          <AppButton
            title={'Cancel'}
            backgroundColor={COLORS.white}
            color={COLORS.black}
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.white,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  mainBody: {
    height: '80%',
    width: '100%',
    marginTop: -50,
    paddingTop: 40,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30
  },
  backContainer: { width: '25%', alignItems: 'flex-start', marginRight: 10 },
  header: {
    backgroundColor: COLORS.primary,
    height: '25%',
    width: '100%',
    paddingLeft: '5%',
    paddingTop: hp(2),
    zIndex: 0
  },
  textFieldContainer: { width: '90%', marginBottom: 10 },
  underlineStyleHighLighted: {
    borderColor: '#03DAC6'
  },
  resendView: { width: '80%' },
  buttonWidth: { width: '90%', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  hLine: { height: 1, width: 100, backgroundColor: COLORS.grey },
  textInputContainer: { marginBottom: hp('2%'), width: '90%' },
  loginText: {
    color: COLORS.darkGrey,
    fontSize: hp('3%'),
    fontFamily: FONT1BOLD
  },
  dontacount: { color: COLORS.darkGrey },
  checkedBox: {
    backgroundColor: 'transparent',
    marginBottom: -10,
    borderWidth: 0,
    width: '100%'
  },
  lightText: {
    color: COLORS.black,
    textAlign: 'center',
    width: '80%',
    marginBottom: 20,
    lineHeight: 22,
    opacity: 0.5,
    fontFamily: FONT1REGULAR
  },
  signUp: { color: COLORS.darkBlack, textDecorationLine: 'underline' },
  errorText: {
    fontFamily: FONT1REGULAR,
    color: COLORS.alertButon
  }
})

export default EditPassword
