import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useContext } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import BG from '../../assets/images/WelcomeBG.png'
import { AppButton } from '../../components'
import { COLORS, FONT1BOLD } from '../../constants'
import AppContext from '../../store/Context'

function Welcome ({ navigation }) {
  // Context
  const context = useContext(AppContext)
  const { setUserType } = context

  const handleNavigate = async (route, type) => {
    await AsyncStorage.setItem('isLogin', 'true')
    setUserType(type)
    navigation.navigate(route)
  }

  return (
    <View style={styles.View_617_1877}>
      <Image source={BG} style={styles.bgimage} />
      <View style={styles.bottom}>
        <View style={styles.buttonWidth}>
          <Text style={styles.youare}>You Are</Text>
          <AppButton
            title={'Customer'}
            backgroundColor={COLORS.white}
            color={COLORS.primary}
            onPress={() => handleNavigate('Signup', 'Customer')}
          />
        </View>
        <View style={styles.buttonWidth}>
          <AppButton
            title={'Service Provider'}
            backgroundColor={COLORS.white}
            color={COLORS.primary}
            onPress={() => handleNavigate('Signup', 'Service Provider')}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  View_617_1877: {
    backgroundColor: COLORS.white,
    width: wp('100%'),
    height: hp('100%'),
    alignItems: 'center'
  },
  bottom: {
    width: '100%',
    height: '50%',
    paddingTop: '5%',
    marginTop: '-5%',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    alignItems: 'center',
    backgroundColor: COLORS.primary
  },
  buttonWidth: { width: '70%', marginBottom: 10 },
  bgimage: {
    width: '100%',
    height: '50%'
  },
  youare: {
    fontSize: hp(3),
    fontFamily: FONT1BOLD,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30
  }
})

export default Welcome
