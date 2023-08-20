import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import Splash from '../screens/Splash'
import LoginScreen from '../screens/LoginScreen'
import ForgotPassword from '../screens/ForgotPassword'
import Signup from '../screens/Signup'
import Onboard from '../screens/Signup/Onboard'
import Subscriptions from '../screens/Signup/Subscriptions'
import GettingStarted from '../screens/GettingStarted'
import Welcome from '../screens/GettingStarted/Welcome'
import SetPasswrod from '../screens/Signup/SetPasswrod'
import AuthLoading from '../screens/AuthLoading'
import MainTabNav from './MainTabNav'
import EditPassword from '../screens/Profile/EditPassword'
import Account from '../screens/Profile/Account'
import AddCard from '../screens/Profile/AddCard'
import PickupLocation from '../screens/Profile/PickupLocation'
import DryCleaner from '../screens/Home/DryCleaner'
import ServicePrice from '../screens/Home/ServicePrice'
import WashFold from '../screens/Home/WashFold'
import Notification from '../screens/Notification'
import ServiceDetails from '../screens/MyService/ServiceDetails'
import TermsCondition from '../screens/TermsCondition'
import PrivacyPolicy from '../screens/PrivacyPolicy'
import PaymentPreference from '../screens/Settings/PaymentPreference'
import Support from '../screens/Settings/Support'
import Chat from '../screens/Chat'
import SetupAccount from '../screens/Profile/SetupAccount'
import MainTabService from './MainTabService'
import ProviderServiceDetails from '../screens/MyService/ProviderServiceDetails'
import CheckMail from '../screens/ForgotPassword/CheckMail'

const Stack = createStackNavigator()
function MainStackNav () {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'card'
      }}
    >
      <Stack.Screen name='Splash' component={Splash} />
      <Stack.Screen name='Welcome' component={Welcome} />
      <Stack.Screen name='GettingStarted' component={GettingStarted} />
      <Stack.Screen name='Onboard' component={Onboard} />
      <Stack.Screen name='Subscriptions' component={Subscriptions} />
      <Stack.Screen name='SetPasswrod' component={SetPasswrod} />
      <Stack.Screen name='EditPassword' component={EditPassword} />
      <Stack.Screen name='Account' component={Account} />
      <Stack.Screen name='PickupLocation' component={PickupLocation} />
      <Stack.Screen name='AddCard' component={AddCard} />
      <Stack.Screen name='Support' component={Support} />
      <Stack.Screen name='DryCleaner' component={DryCleaner} />
      <Stack.Screen name='WashFold' component={WashFold} />
      <Stack.Screen name='ServicePrice' component={ServicePrice} />
      <Stack.Screen name='ServiceDetails' component={ServiceDetails} />
      <Stack.Screen name='Notification' component={Notification} />
      <Stack.Screen name='TermsCondition' component={TermsCondition} />
      <Stack.Screen name='PrivacyPolicy' component={PrivacyPolicy} />
      <Stack.Screen name='Chat' component={Chat} />
      <Stack.Screen name='PaymentPreference' component={PaymentPreference} />
      <Stack.Screen name='AuthLoading' component={AuthLoading} />
      <Stack.Screen name='LoginScreen' component={LoginScreen} />
      <Stack.Screen name='CheckMail' component={CheckMail} />
      <Stack.Screen name='Signup' component={Signup} />
      <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
      <Stack.Screen name='MainTabNav' component={MainTabNav} />
      <Stack.Screen name='MainTabService' component={MainTabService} />
      <Stack.Screen name='SetupAccount' component={SetupAccount} />
      <Stack.Screen name='ProviderServiceDetails' component={ProviderServiceDetails} />
    </Stack.Navigator>
  )
}

export default MainStackNav
