import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { Icon } from 'react-native-elements'
import { COLORS, FONT1BOLD, FONT1REGULAR } from '../../constants'

function Help ({ navigation }) {
  // Context

  const goBack = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.header}>
          <View style={styles.backContainer}>
            <TouchableOpacity onPress={goBack}>
              <Icon name='arrow-back' type='material' />
            </TouchableOpacity>
          </View>
          <Text style={styles.loginText}>Help</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.heading}>
            If you are running into any issues, our team would love to help!
          </Text>
          <Text style={styles.heading1}>Phone</Text>
          <Text style={styles.text}>1-866-594-5785</Text>
          <Text style={styles.heading1}>Email</Text>
          <Text style={styles.text}>support@foodtruckjunkie.com</Text>
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
  top: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20
  },
  backContainer: { width: '40%', alignItems: 'flex-start', marginRight: 10 },
  header: {
    flexDirection: 'row',
    marginBottom: 30,
    width: '90%',
    alignItems: 'center'
  },

  loginText: {
    color: COLORS.darkGrey,
    fontSize: hp('3%'),
    fontFamily: FONT1REGULAR
  },
  heading: {
    color: COLORS.primary,
    fontSize: hp('3%'),
    fontFamily: FONT1BOLD
  },
  heading1: {
    color: COLORS.darkBlack,
    fontSize: hp(2.2),
    fontFamily: FONT1REGULAR,
    marginTop: 20,
    marginBottom: 10
  },
  text: {
    color: COLORS.darkGrey,
    fontSize: hp(2.2),
    fontFamily: FONT1REGULAR
  },
  body: {
    width: '90%'
  }
})

export default Help
