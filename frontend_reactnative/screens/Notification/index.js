import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { Header } from '../../components'
import { COLORS, FONT1BOLD, FONT1REGULAR } from '../../constants'
import AppContext from '../../store/Context'
import { allNotificationRead, notificationRead } from '../../api/order'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-simple-toast'

function Notification ({ route, navigation }) {
  // Context
  const context = useContext(AppContext)
  const { _getNotification, notifications } = context
  const [state, setState] = useState({
    priority: false,
    loading: false,
    listModal: false,
    fold: false,
    hang: false,
    modalList: []
  })

  const handleRead = async notification => {
    try {
      const token = await AsyncStorage.getItem('token')
      handleChange('loading', true)

      const formData = {
        notification
      }
      await notificationRead(formData, token)
      handleChange('loading', false)
      Toast.show('Notification Opened!')
      _getNotification()
    } catch (error) {
      handleChange('loading', false)
      const errorText = Object.values(error?.response?.data)
      if (errorText.length > 0) {
        Toast.show(`Error: ${errorText[0]}`)
      } else {
        Toast.show(`Error: ${error}`)
      }
    }
  }

  const handleAllRead = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      handleChange('loading', true)

      await allNotificationRead(token)
      handleChange('loading', false)
      Toast.show('All Notification Opened!')
      _getNotification()
    } catch (error) {
      handleChange('loading', false)
      const errorText = Object.values(error?.response?.data)
      if (errorText.length > 0) {
        Toast.show(`Error: ${errorText[0]}`)
      } else {
        Toast.show(`Error: ${error}`)
      }
    }
  }

  const { loading } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  console.warn('notifications', notifications)

  return (
    <View style={styles.container}>
      <View style={styles.mainBody}>
        <Header back width={'100%'} title={'Notifications'} rightEmpty />
        <View style={styles.rowEnd}>
          <TouchableOpacity onPress={handleAllRead}>
            <Text style={styles.leftText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={notifications}
          showsVerticalScrollIndicator={false}
          style={{ width: '100%' }}
          renderItem={({ item, index }) => {
            return (
              <View key={index} style={styles.card}>
                <Text
                  style={[
                    styles.title,
                    { fontFamily: item?.read ? FONT1REGULAR : FONT1BOLD }
                  ]}
                >
                  {item?.title}
                </Text>
                <Text style={styles.content}>{item?.content}</Text>
                <View style={styles.hline} />
                <TouchableOpacity
                  onPress={() => handleRead(item?.id)}
                  style={{ width: '100%', alignItems: 'center' }}
                >
                  <Text style={styles.readText}>Read</Text>
                </TouchableOpacity>
              </View>
            )
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.profileBackgroud,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rowEnd: {
    width: '100%',
    marginTop: 10,
    alignItems: 'flex-end'
  },
  rowBetween: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  header: {
    width: '100%',
    paddingLeft: '5%',
    paddingTop: hp(2),
    zIndex: 0
  },
  title: {
    fontFamily: FONT1BOLD,
    width: '100%',
    fontSize: hp(2.5),
    color: COLORS.darkBlack
  },
  content: {
    fontFamily: FONT1REGULAR,
    width: '100%',
    fontSize: hp(2),
    color: COLORS.darkBlack
  },
  leftText: {
    fontFamily: FONT1REGULAR,
    fontSize: hp(2),
    color: COLORS.primary
  },
  readText: {
    fontFamily: FONT1REGULAR,
    fontSize: hp(2),
    marginVertical: 10,
    color: COLORS.primary
  },
  mainBody: {
    width: '90%',
    height: '90%',
    marginTop: 20,
    alignItems: 'center'
  },
  card: {
    width: '98%',
    backgroundColor: COLORS.white,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 20,
    marginLeft: 3,
    marginTop: 5,
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    shadowColor: 'rgb(17, 107, 255)',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7
  },
  hline: {
    width: '100%',
    height: 1,
    marginTop: 10,
    backgroundColor: COLORS.borderColor
  }
})

export default Notification
