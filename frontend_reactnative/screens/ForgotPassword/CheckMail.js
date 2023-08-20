import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { COLORS, FONT1BOLD, FONT1MEDIUM, FONT1REGULAR } from '../../constants'
import { AppButton } from '../../components'
import { SvgXml } from 'react-native-svg'
import checkMail from '../../assets/svg/checkMail.svg'

function CheckMail ({ navigation }) {
  const handleReset = () => {
    navigation.navigate('LoginScreen')
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <SvgXml
          xml={checkMail}
          height={60}
          style={{ marginTop: 100, marginBottom: 30 }}
        />
        <Text style={styles.loginText1}>Check your mail</Text>
        <Text style={styles.loginText}>
          We have sent a password recover instructions to your mail
        </Text>
        <View style={styles.buttonWidth}>
          <AppButton title={'Continue'} onPress={handleReset} />
        </View>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.loginText}>
          Did not recieve email ? Check your spam or add a correct address
        </Text>
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
    width: '70%',
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

export default CheckMail
