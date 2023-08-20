import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useContext, useEffect } from 'react'
import { StyleSheet, View, ActivityIndicator } from 'react-native'
import { COLORS } from '../../constants'
import AppContext from '../../store/Context'

function AuthLoading ({ navigation }) {
  // Context
  const context = useContext(AppContext)
  const {
    user,
    _getItems,
    _getNotification,
    _getOrder,
    _getNearbyOrders,
    _getPaymentMethod
  } = context

  useEffect(() => {
    _bootstrapAsync()
    navigation.addListener('focus', () => {
      _bootstrapAsync()
    })
  }, [])
  const _bootstrapAsync = async () => {
    const userUID = await AsyncStorage.getItem('token')
    const isLogin = await AsyncStorage.getItem('isLogin')
    // const user = await AsyncStorage.getItem('user')
    console.warn('user', user)
    if (userUID && user) {
      // const userData = JSON.parse(user)
      // setUser(userData)
      // _getItems()
      // _getNotification()
      // _getPaymentMethod()
      // console.warn('userData', user)
      // if (!user?.customer?.location && user?.type === 'Customer') {
      //   navigation.navigate('Account')
      //   console.warn('user', user)
      // } else if (
      //   !user?.serviceprovider?.location &&
      //   user?.type !== 'Customer'
      // ) {
      //   navigation.navigate('SetupAccount')
      // } else if (user?.type === 'Customer') {
      //   _getOrder()
      //   navigation.navigate('MainTabNav')
      // } else {
      //   _getOrder()
      //   _getNearbyOrders('?status=Pending')
      //   navigation.navigate('MainTabService')
      // }
    } else {
    }
    if (isLogin) {
      navigation.navigate('LoginScreen')
    } else {
      navigation.navigate('GettingStarted')
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size='large' color={COLORS.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default AuthLoading
