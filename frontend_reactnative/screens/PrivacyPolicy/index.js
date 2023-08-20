import React, { useContext } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { COLORS, FONT1REGULAR } from '../../constants'
import { Header } from '../../components'
import AppContext from '../../store/Context'

function PrivacyPolicy ({ navigation }) {
  // Context
  const context = useContext(AppContext)
  const { privacyPolicy } = context
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header blueBG title={'Privacy Policy'} back rightEmpty />
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {privacyPolicy?.map((term, index) => (
          <Text key={index} style={styles.paragragh}>
            The terms and codnition are udner progress
          </Text>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: wp('100%'),
    height: '100%',
    alignItems: 'center'
  },
  header: {
    backgroundColor: COLORS.primary,
    height: hp(15),
    width: '100%',
    alignItems: 'center',
    paddingTop: hp(2),
    zIndex: 0
  },
  scrollView: {
    width: '100%',
    paddingHorizontal: '5%',
    marginTop: -20,
    backgroundColor: COLORS.white,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    zIndex: 2
  },
  paragragh: {
    color: COLORS.darkBlack,
    opacity: 0.5,
    fontFamily: FONT1REGULAR,
    fontSize: 12
  },
  headingText: {
    color: COLORS.black,
    fontSize: hp('3%'),
    marginTop: '5%',
    marginBottom: '5%',
    fontFamily: FONT1REGULAR
  }
})

export default PrivacyPolicy
