import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useContext, useState } from 'react'
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native'
import { Icon } from 'react-native-elements'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { SvgXml } from 'react-native-svg'
import CreditCard from '../../assets/svg/CreditCard.svg'
import security from '../../assets/svg/security.svg'
import notificationIcon from '../../assets/svg/notificaionBlack.svg'
import privacypolicy from '../../assets/svg/privacypolicy.svg'
import message from '../../assets/svg/message.svg'
import terms from '../../assets/svg/terms.svg'
import InfoCircle from '../../assets/svg/InfoCircle.svg'
import { Header } from '../../components'
import { COLORS, FONT1BOLD, FONT1LIGHT, FONT1REGULAR } from '../../constants'
import AppContext from '../../store/Context'
import { deleteAccount } from '../../api/auth'
import Toast from 'react-native-simple-toast'
import { createBusinessStripe } from '../../api/business'
import WebView from 'react-native-webview'

function Settings ({ navigation }) {
  const list = [
    { title: 'Notifications', icon: notificationIcon, route: 'Notification' },
    { title: 'Change Password', icon: security, route: 'EditPassword' },
    {
      title: 'Payment Preferences',
      icon: CreditCard,
      route: 'PaymentPreference'
    },
    { title: 'Privacy Policy', icon: privacypolicy, route: 'PrivacyPolicy' },
    { title: 'Terms and Conditions', icon: terms, route: 'TermsCondition' },
    { title: 'Support/Dispute', icon: message, route: 'Support' },
    { title: 'Delete Account', icon: InfoCircle, delete: true }
  ]
  // Context
  const context = useContext(AppContext)
  const { user } = context

  // State
  const [state, setState] = useState({
    loading: false,
    selectedID: '',
    stripeLink: null
  })

  const { loading, stripeLink } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  const logout = async () => {
    context?.setUser(null)
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('user')
    navigation.navigate('AuthLoading')
  }

  const _deleteAccount = async () => {
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      await deleteAccount(user?.id, token)
      handleChange('loading', false)
      Toast.show(`Your account has been deleted!`)
      logout()
    } catch (error) {
      handleChange('loading', false)
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText}`)
    }
  }

  const _createBusinessStripe = async () => {
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      const res = await createBusinessStripe(token)
      handleChange('loading', false)
      handleChange('stripeLink', res?.data?.link)
    } catch (error) {
      handleChange('loading', false)
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText}`)
    }
  }

  const handleWebViewNavigationStateChange = newNavState => {
    const { url } = newNavState
    if (!url) {
      alert('Something went wrong!')
      return
    }
    if (url === 'http://localhost:8080/success/') {
      handleChange('stripeLink', null)
      Alert.alert('Success', 'Verification process has been completed!')
    }
  }

  if (stripeLink) {
    return (
      <WebView
        onNavigationStateChange={handleWebViewNavigationStateChange}
        source={{
          uri: stripeLink?.url
        }}
      />
    )
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.primary} size={'large'} />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: 'center' }}
    >
      <View style={styles.header}>
        <Text style={styles.name}>Settings</Text>
      </View>
      <View style={styles.mainBody}>
        {list.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.listView}
            onPress={() =>
              item.delete
                ? _deleteAccount()
                : item.title === 'Payment Preferences' &&
                  user?.type !== 'Customer'
                ? _createBusinessStripe()
                : navigation.navigate(item.route)
            }
          >
            <View style={styles.row}>
              <SvgXml xml={item.icon} width={30} />
              <Text style={styles.street}>{item.title}</Text>
            </View>
            <Icon
              name={'right'}
              type={'antdesign'}
              color={COLORS.grey}
              size={18}
            />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={{ marginTop: 20 }} onPress={logout}>
          <Text style={styles.logout}>Log Out</Text>
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
    alignItems: 'center',
    paddingTop: hp(2),
    zIndex: 0
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  name: {
    fontFamily: FONT1REGULAR,
    color: COLORS.white,
    fontSize: hp(3.2)
  },
  listView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    paddingHorizontal: 10,
    height: 45,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.settingBorder
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
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
    color: COLORS.darkBlack,
    fontSize: hp(2),
    marginLeft: 10
  },
  logout: {
    fontFamily: FONT1REGULAR,
    color: COLORS.primary,
    fontSize: hp(2)
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

export default Settings
