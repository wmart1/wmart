import { NavigationContainer } from "@react-navigation/native"
import React, { useEffect, useState } from "react"
import "react-native-gesture-handler"
import { RootStackNav } from "./navigation"
import AppContext from "./store/Context"
import { MenuProvider } from "react-native-popup-menu"
import { StripeProvider } from "@stripe/stripe-react-native"
import { getItems, getNotification, getOrder } from "./api/order"
import {
  getExtraServices,
  getPrivacyPolicy,
  getProfile,
  getTerms
} from "./api/auth"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Toast from "react-native-simple-toast"
import { Alert, Platform, SafeAreaView } from "react-native"
import { getPaymentMethod } from "./api/payments"
import messaging from "@react-native-firebase/messaging"
import PushNotification from "react-native-push-notification"
import PushNotificationIOS from "@react-native-community/push-notification-ios"

const App = () => {
  const [userType, setUserType] = useState("")
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [notifications, setNotifications] = useState([])
  const [mapLocationForAccount, setMapLocationForAccount] = useState(null)
  const [orders, setOrders] = useState([])
  const [nearbyOrders, setNearbyOrders] = useState([])
  const [terms, setTerms] = useState([])
  const [privacyPolicy, setPrivacyPolicy] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [extraServices, setExtraServices] = useState([])

  const _getProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const user = await AsyncStorage.getItem("user")
      const userData = JSON.parse(user)
      console.warn("userData?.id", userData?.id)
      const res = await getProfile(userData?.id, token)
      console.warn("pofile", res?.data)
      AsyncStorage.setItem("user", JSON.stringify(res?.data))
      setUser(res?.data)
    } catch (error) {
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText}`)
    }
  }

  const _getExtraServices = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const res = await getExtraServices(token)
      setExtraServices(res?.data)
    } catch (error) {
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText}`)
    }
  }

  const _getItems = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const res = await getItems(token)
      setItems(res?.data)
    } catch (error) {
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText}`)
    }
  }

  const _getNotification = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const res = await getNotification(token)
      setNotifications(res?.data)
    } catch (error) {
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText}`)
    }
  }

  const _getOrder = async payload => {
    try {
      const qs = payload ? payload : ""
      const token = await AsyncStorage.getItem("token")
      const res = await getOrder(qs, token)
      setOrders(res?.data)
    } catch (error) {
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText}`)
    }
  }

  const _getNearbyOrders = async payload => {
    try {
      const qs = payload ? payload : ""
      const token = await AsyncStorage.getItem("token")
      const res = await getOrder(qs, token)
      setNearbyOrders(res?.data)
    } catch (error) {
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText}`)
    }
  }

  const _getTerms = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const res = await getTerms(token)
      setTerms(res?.data)
    } catch (error) {
      Toast.show(`Error: ${error?.response?.data?.detail}`)
    }
  }

  const _getPrivacyPolicy = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const res = await getPrivacyPolicy(token)
      setPrivacyPolicy(res?.data)
    } catch (error) {
      Toast.show(`Error: ${error?.response?.data?.detail}`)
    }
  }
  const _getPaymentMethod = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const res = await getPaymentMethod(token)
      setPaymentMethods(res?.data)
    } catch (error) {
      Toast.show(`Error: ${error?.response?.data?.detail}`)
    }
  }

  useEffect(() => {
    requestUserPermission()
    PushNotification.createChannel({
      channelId: "com.wmart",
      channelName: "com.wmart"
    })
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        setTimeout(() => {
          if (remoteMessage?.notification?.title) {
          }
        }, 2000)
        // do whatever you want to here
      })
      .catch(err => {
        // alert(err)
      })
    messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log("Message handled in the background!", remoteMessage)
    })

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      var localNotification = {
        id: 0, // (optional) Valid unique 32 bit integer specified as string.
        title: remoteMessage.notification.title, // (optional)
        message: remoteMessage.notification.body // (required)
        // data: remoteMessage.data
      }

      Platform.OS == "android" &&
        (localNotification = {
          ...localNotification,
          channelId: "com.wmart" // (required) channelId, if the channel doesn't exist, notification will not trigger.
        })
      PushNotification.localNotification(localNotification)
      PushNotification.configure({
        onRegister: function (token) {
          console.warn("TOKEN:", token)
        },
        onNotification: function (notification) {
          const { data, title } = notification
          notification.finish(PushNotificationIOS.FetchResult.NoData)
        },
        onRegistrationError: function (err) {
          console.warn(err.message, err)
        },
        senderID: "585381866834",
        permissions: {
          alert: true,
          badge: true,
          sound: true
        },
        popInitialNotification: true,
        requestPermissions: true
      })
      // Alert.alert("A new FCM message arrived!", JSON.stringify(remoteMessage))
    })

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log("Message handled in the background!", remoteMessage)
    })
    NotificationPermission()
    return unsubscribe
  }, [])

  const NotificationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // await PermissionsAndroid.request(
          // PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        // );
      } catch (error) {
      }
    };
  }

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission()
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    console.warn("enabled", enabled)
    registerAppWithFCM()
    if (enabled) {
    }
  }

  // useEffect(() => {
  //   requestUserPermission()
  //   const unsubscribe = messaging().onMessage(async remoteMessage => {
  //     Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage))
  //   })

  //   messaging().setBackgroundMessageHandler(async remoteMessage => {
  //     console.log('Message handled in the background!', remoteMessage)
  //   })

  //   return unsubscribe
  // }, [])

  async function registerAppWithFCM() {
    messaging().deleteToken()
    const registered = await messaging().registerDeviceForRemoteMessages()
    console.warn('registered', registered)
  }

  // async function requestUserPermission () {
  //   const authStatus = await messaging().requestPermission()
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL

  //   if (enabled) {
  //     console.warn('Authorization status:', authStatus)
  //     registerAppWithFCM()
  //   }
  // }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StripeProvider
        publishableKey="add key stripe publish key here"
        // publishableKey="pk_test_51Ngy2lDzs5iF153A10X798aL3JRdAUW2bt8BMNIjr9Fmd2Fsu2FuJF0zAT2AjDbnM74gf3EgrvQzkpZZSgSeRWL0003J0jLhWo"
        merchantIdentifier="merchant.com.patient-hall-32664-18f3c6a0"
      >
        <AppContext.Provider
          value={{
            user,
            setUser,
            setMapLocationForAccount,
            mapLocationForAccount,
            _getItems,
            items,
            notifications,
            _getNotification,
            _getOrder,
            orders,
            terms,
            _getTerms,
            privacyPolicy,
            _getPrivacyPolicy,
            paymentMethods,
            _getPaymentMethod,
            setUserType,
            userType,
            _getNearbyOrders,
            nearbyOrders,
            _getProfile,
            extraServices,
            _getExtraServices
          }}
        >
          <NavigationContainer>
            <MenuProvider>
              <RootStackNav />
            </MenuProvider>
          </NavigationContainer>
        </AppContext.Provider>
      </StripeProvider>
    </SafeAreaView>
  )
}

export default App
