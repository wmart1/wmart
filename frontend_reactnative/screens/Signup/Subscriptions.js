import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { SvgXml } from 'react-native-svg'
import logo from '../../assets/svg/splash.svg'
import { Header } from '../../components'
import { COLORS, FONT1BOLD, FONT1ITALIC, FONT1REGULAR } from '../../constants'

function Subscriptions ({}) {
  const list = [
    { title: 'One week', price: '3.99' },
    { title: 'One month', price: '9.99' }
  ]
  const list1 = [
    { title: 'Six months', price: '49.99' },
    { title: 'One year', price: '94.99' }
  ]
  return (
    <View style={styles.container}>
      <Header back />
      <Text style={styles.headingText}>Subscriptions</Text>
      <View style={styles.listContainer}>
        {list.map((item, index) => (
          <TouchableOpacity key={index} style={styles.listView}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>${item.price}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.listContainer}>
        {list1.map((item, index) => (
          <TouchableOpacity key={index} style={styles.listView}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>${item.price}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.listViewFree}>
        <Text style={styles.titleFree}>Free Trial Offer</Text>
        <Text style={styles.priceFree}>30 days trial</Text>
      </TouchableOpacity>
      <SvgXml xml={logo} width={'60%'} height={'50%'} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroud,
    width: wp('100%'),
    paddingTop: 20,
    height: hp('100%'),
    alignItems: 'center'
  },
  headingText: {
    color: COLORS.secondary,
    width: '90%',
    textAlign: 'center',
    fontSize: hp(3),
    fontFamily: FONT1BOLD
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginTop: 20,
    justifyContent: 'space-around'
  },
  listView: {
    width: '40%',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.inputBorder
  },
  listViewFree: {
    width: '40%',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    marginTop: 20,
    borderColor: COLORS.inputBorder
  },
  title: {
    fontFamily: FONT1REGULAR,
    color: COLORS.navy,
    fontSize: hp(2.2)
  },
  price: {
    fontFamily: FONT1BOLD,
    color: COLORS.secondary,
    fontSize: hp(2.8)
  },
  titleFree: {
    fontFamily: FONT1REGULAR,
    color: COLORS.navy,
    fontSize: hp(2.2)
  },
  priceFree: {
    fontFamily: FONT1ITALIC,
    color: COLORS.secondary,
    fontSize: hp(2)
  }
})

export default Subscriptions
