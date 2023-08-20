import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { MainStackNav } from '.'

const Stack = createStackNavigator()

function RootNav () {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name='Main' component={MainStackNav} />
    </Stack.Navigator>
  )
}

export default RootNav
