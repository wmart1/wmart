import React, { useContext } from 'react'
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { SvgXml } from 'react-native-svg'
import locationIcon from '../../assets/svg/blueLocation.svg'
import drying from '../../assets/svg/drying.svg'
import washingmachine from '../../assets/svg/washing-machine.svg'
import { Header } from '../../components'
import { COLORS, FONT1BOLD, FONT1LIGHT, FONT1REGULAR } from '../../constants'
import AppContext from '../../store/Context'

function Home ({ navigation }) {
  // Context
  const context = useContext(AppContext)
  const { user, paymentMethods } = context
  console.warn('user', user?.type)
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: 'center' }}
    >
      <View style={styles.header}>
        <Header
          blueBG
          leftEmpty
          marginLeft={'-5%'}
          fontSize={hp(3.2)}
          fontFamily={FONT1BOLD}
          title={'Customer'}
          notification
        />
        <Text style={styles.name}>Hi, {user?.name}</Text>
        <Text style={styles.description}>
          Get your laundry washed, folded and delivered straight away.
        </Text>
      </View>
      <View style={styles.mainBody}>
        {/* <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '90%',
            marginVertical: 10,
            borderRadius: 10,
            borderWidth: 1,
            minHeight: 40,
            paddingVertical: 5,
            borderColor: COLORS.inputBorder,
            backgroundColor: COLORS.white
          }}
        >
          <SvgXml xml={locationIcon} style={{ marginLeft: 10 }} />
          <Text style={styles.street}>{user?.customer?.street}</Text>
        </View> */}
        <Text style={styles.chooseText}>
          Choose the type of laundry service you are interested in from the set
          below
        </Text>
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            paymentMethods?.data?.length > 0
              ? navigation.navigate('DryCleaner')
              : alert('You need to add payment method first!')
          }
        >
          <SvgXml xml={drying} />
          <Text style={styles.dryText}>Order Dry Cleaning</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            paymentMethods?.data?.length 
              ? navigation.navigate('WashFold')
              : alert('You need to add payment method first!')   
          }
        >
          <SvgXml xml={washingmachine} />
          <Text style={styles.dryText}>Order Wash and Fold service</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    width: wp('100%'),
    height: hp('100%')
  },
  header: {
    backgroundColor: COLORS.primary,
    height: hp(25),
    width: '100%',
    paddingLeft: '5%',
    paddingTop: hp(2),
    zIndex: 0
  },
  card: {
    width: '90%',
    height: 100,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    shadowColor: 'rgb(17, 107, 255)',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7
  },
  name: {
    fontFamily: FONT1BOLD,
    color: COLORS.white,
    fontSize: hp(3.2)
  },
  dryText: {
    fontFamily: FONT1REGULAR,
    color: COLORS.darkBlack,
    fontSize: hp(2.2)
  },
  chooseText: {
    fontFamily: FONT1LIGHT,
    width: '90%',
    marginTop: 10,
    marginBottom: 30,
    color: COLORS.darkBlack,
    fontSize: hp(2.2)
  },
  street: {
    fontFamily: FONT1REGULAR,
    color: COLORS.grey,
    fontSize: hp(1.8),
    marginLeft: 10,
    width: '90%'
  },
  description: {
    fontFamily: FONT1REGULAR,
    color: COLORS.white,
    fontSize: hp(2),
    width: '80%',
    marginTop: 5
  },
  mainBody: {
    width: '100%',
    marginTop: -40,
    paddingTop: 40,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30
  }
})

export default Home
