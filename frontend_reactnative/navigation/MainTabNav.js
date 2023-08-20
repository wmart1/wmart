import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { TabBar } from '../components'
import Home from '../screens/Home'
import { COLORS } from '../constants'
import Profile from '../screens/Profile'
import Account from '../screens/Profile/Account'
import MyService from '../screens/MyService'
import Settings from '../screens/Settings'

function MainTabNav () {
  const Tab = createBottomTabNavigator()
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.white }
      }}
      initialRouteName={'Home'}
      tabBar={props => <TabBar {...props} />}
    >
      <Tab.Screen name='Home' component={Home} />
      <Tab.Screen name='My Services' component={MyService} />
      <Tab.Screen name='Profile' component={Account} />
      <Tab.Screen name='Settings' component={Settings} />
    </Tab.Navigator>
  )
}

export default MainTabNav
