import React, { useContext } from 'react'
import { View, StyleSheet } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { COLORS, FONT1REGULAR } from '../../constants'
import { AppButton } from '../../components'
import AppContext from '../../store/Context'
import AsyncStorage from '@react-native-async-storage/async-storage'

function Profile ({ navigation }) {
  // Context
  const context = useContext(AppContext)
  const setUser = context?.setUser
  const user = context?.user
  const logout = async () => {
    setUser(null)
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('user')
    navigation.navigate('AuthLoading')
  }

  const list = [
    // { title: 'Account', icon: AccountIcon, route: 'Account' },
    // { title: 'Subscription', icon: SubscriptionIcon, route: 'AddCard' }
    // { title: 'Wallet', icon: WalletIcon, route: 'Wallets' },
    // { title: 'Password', icon: TermsIcon, route: 'EditPassword' },
    // { title: 'Terms & Conditions', icon: TermsIcon, route: 'TermsCondition' },
    // { title: 'Privacy policy', icon: PrivacyIcon, route: 'PrivacyPolicy' },
    // { title: 'Help', icon: PrivacyIcon, route: 'Help' }
  ]

  const mapList = list
  return (
    <View style={styles.container}>
      {/* <Header title={'Profile'} rightEmpty /> */}
      <View style={styles.body}>
        {/* <FlatList
          data={mapList}
          renderItem={({ item, index }) => {
            return (
              <AppButton
                title={item.title}
                outlined
                borderColor={COLORS.black}
                color={COLORS.logout}
                backgroundColor={COLORS.white}
                onPress={() => navigation.navigate(item.route)}
              />
            )
          }}
        /> */}
        <AppButton
          title={'Logout'}
          outlined
          borderColor={COLORS.black}
          color={COLORS.logout}
          backgroundColor={COLORS.white}
          onPress={logout}
        />
      </View>
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
    width: '90%'
  },
  top: { width: '100%' },
  body: {
    width: '90%',
    height: '85%',
    marginTop: 20,
    justifyContent: 'space-between'
  },
  name: {
    color: COLORS.darkBlack,
    fontFamily: FONT1REGULAR,
    fontSize: hp(2.2),
    marginLeft: 10
  },
  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 30,
    resizeMode: 'cover'
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40
  },
  title: {
    marginLeft: 10,
    fontFamily: FONT1REGULAR,
    color: COLORS.modalBG
  }
})

export default Profile
