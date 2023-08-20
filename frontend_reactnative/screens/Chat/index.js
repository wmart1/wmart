/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useEffect, useState } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  BackHandler,
  Platform,
  ActivityIndicator
} from 'react-native'
import { Icon, Input } from 'react-native-elements'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
// import {Header} from '../../components'
// import {connect} from 'react-redux'
import database from '@react-native-firebase/database'
// import {getMessages} from '../../actions'
import Toast from 'react-native-simple-toast'
import AppContext from '../../store/Context'
import { COLORS, FONT1REGULAR } from '../../constants'
import userProfile from '../../assets/images/userProfile.png'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import moment from 'moment'
import { SvgXml } from 'react-native-svg'
import sendIcon from '../../assets/svg/sendIcon.svg'
import insertIcon from '../../assets/svg/insertIcon.svg'
// import i18n from '../../../i18n'
import ImagePicker from 'react-native-image-crop-picker'
import storage from '@react-native-firebase/storage'

function Messages ({ navigation, route }) {
  const orderID = route?.params?.orderID
  const orderData = route?.params?.orderData
  // Context
  const context = useContext(AppContext)
  const { user } = context
  const messageuid = orderID
  let scrollView
  const [state, setState] = useState({
    listHeight: 0,
    scrollViewHeight: 0,
    messages: [],
    messageText: '',
    messageData: null,
    uploading: false
  })

  const downButtonHandler = () => {
    if (scrollView !== null) {
      scrollView.scrollToEnd !== null &&
        scrollView.scrollToEnd({ animated: true })
    }
  }
  console.warn('orderData', orderData?.user?.customer?.photo)
  useEffect(() => {
    const backAction = () => {
      navigation.goBack()
      return true
    }
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    )
    return () => backHandler.remove()
  }, [])

  useEffect(() => {
    const db = database()
    if (user) {
      db.ref('Messages/' + messageuid).on('value', snapshot => {
        if (snapshot.val()) {
          if (snapshot.val().senderId === user.uid) {
            db.ref('Messages/' + messageuid)
              .update({ senderRead: 0 })
              .then(res => {
                db.ref('Messages/' + messageuid).once('value', snapshot => {
                  if (snapshot.val()) {
                    // getMessages()
                    setState(prevState => ({
                      ...prevState,
                      messages: snapshot.val().messages,
                      messageData: snapshot.val()
                    }))
                  }
                })
              })
          }
          if (snapshot.val().receiverId === user.uid) {
            db.ref('Messages/' + messageuid)
              .update({ receiverRead: 0 })
              .then(res => {
                db.ref('Messages/' + messageuid).once('value', snapshot => {
                  if (snapshot.val()) {
                    // getMessages()
                    setState(prevState => ({
                      ...prevState,
                      messages: snapshot.val().messages,
                      messageData: snapshot.val()
                    }))
                  }
                })
              })
          }
        }
      })
    }
  }, [user])

  const handleChange = (key, value) => {
    setState(pre => ({ ...pre, [key]: value }))
  }

  useEffect(() => {
    if (scrollView !== null) {
      downButtonHandler()
    }
  })

  const _uploadImage = async type => {
    handleChange('uploading', true)
    let OpenImagePicker =
      type == 'camera'
        ? ImagePicker.openCamera
        : type == ''
        ? ImagePicker.openPicker
        : ImagePicker.openPicker

    OpenImagePicker({
      cropping: true
    })
      .then(async response => {
        if (!response.path) {
          handleChange('uploading', false)
        } else {
          const uri = response.path
          const filename = Date.now()
          const uploadUri =
            Platform.OS === 'ios' ? uri.replace('file://', '') : uri
          const task = storage()
            .ref('Chat/' + filename)
            .putFile(uploadUri)
          // set progress state
          task.on('state_changed', snapshot => {})
          try {
            const durl = await task
            task.snapshot.ref.getDownloadURL().then(downloadURL => {
              onSend(downloadURL, 'image')
            })
          } catch (e) {
            console.error(e)
          }
          handleChange('uploading', false)
        }
      })
      .catch(err => {
        handleChange('showAlert', false)
        handleChange('uploading', false)
      })
  }

  const onSend = (text, type) => {
    const data = {
      text: text || state.messageText,
      timeStamp: Date.now(),
      type: type || 'text',
      senderId: user?.id
    }
    let messages = state.messages.concat(data)
    const values = {
      messages,
      senderRead:
        state?.messageData?.senderRead > 0
          ? Number(state.messageData.senderRead) + 1
          : 1,
      receiverRead:
        state?.messageData?.receiverRead > 0
          ? Number(state.messageData.receiverRead) + 1
          : 1
    }

    database()
      .ref('Messages/' + messageuid)
      .update(values)
      .then(res => {
        setState(prevState => ({
          ...prevState,
          loading: false,
          messageText: ''
        }))
        downButtonHandler()
      })
      .catch(err => {
        console.log(err)
        Toast.show('Something went wrong!', Toast.LONG)
      })
  }

  const _handleSend = (message, id) => {
    var data = {
      app_id: '15b1f37a-b123-45e3-a8c4-f0ef7e091130',
      android_channel_id: '97ad04d8-51d2-4739-8e83-0479a7e8cd60',
      headings: { en: user?.username ? user?.username : 'Guest User' },
      contents: { en: message },
      include_player_ids: [id]
    }
    // sendNotification(data)
    //   .then(res => {
    //     if (res.status == 200) {
    //       console.log('done')
    //     } else {
    //       alert(JSON.stringify(res))
    //     }
    //   })
    //   .catch(error => {
    //     Alert.alert('Error!', error)
    //   })
  }

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        backgroundColor: COLORS.profileBackgroud
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '90%',
          marginTop: 20
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name='arrowleft' type='antdesign' />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Image
            style={{ width: 80, height: 80, borderRadius: 50 }}
            source={
              user?.type !== 'Customer'
                ? orderData?.user?.customer?.photo
                  ? { uri: orderData?.user?.customer?.photo }
                  : userProfile
                : orderData?.service_provider?.photo
                ? { uri: orderData?.service_provider?.photo }
                : userProfile
            }
          />
          <Text
            style={{
              fontFamily: FONT1REGULAR,
              color: COLORS.darkBlack,
              fontSize: hp(2),
              marginTop: 10
            }}
          >
            {user?.type !== 'Customer'
              ? orderData?.user?.name
              : orderData?.service_provider?.business_name}
          </Text>
        </View>
        <View style={{ width: '10%' }} />
      </View>
      {/* <Header title={i18n.t('Messages')} navigation={navigation} back={true} /> */}
      <View style={styles.container}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps={'handled'}
          contentContainerStyle={{
            justifyContent: 'flex-end',
            alignItems: 'center',
            flex: 1
          }}
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          <FlatList
            data={state.messages}
            keyboardDismissMode='on-drag'
            onContentSizeChange={(contentWidth, contentHeight) => {
              setState(prevState => ({
                ...prevState,
                listHeight: contentHeight
              }))
            }}
            onLayout={e => {
              const height = e.nativeEvent.layout.height
              setState(prevState => ({
                ...prevState,
                scrollViewHeight: height
              }))
            }}
            style={{ width: '90%', flex: 1 }}
            contentContainerStyle={{
              alignItems: 'flex-start',
              justifyContent: 'flex-end'
            }}
            ref={ref => {
              scrollView = ref
            }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => {
              if (item.senderId !== user?.id) {
                return (
                  <View
                    key={index}
                    style={{
                      width: '100%',
                      marginVertical: 10
                    }}
                  >
                    <View
                      style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-end',
                        paddingBottom: 10
                      }}
                    >
                      <View
                        style={{
                          width: 0,
                          height: 0,
                          borderTopWidth: 8,
                          borderTopColor: 'transparent',
                          borderBottomWidth: 0,
                          borderBottomColor: 'transparent',
                          borderRightWidth: 18,
                          borderRightColor: '#56A4FF'
                        }}
                      />
                      <View
                        style={{
                          backgroundColor: '#56A4FF',
                          maxWidth: '75%',
                          borderRadius: 15,
                          borderBottomLeftRadius: 0,
                          padding: 15
                        }}
                      >
                        {item?.type === 'image' ? (
                          <Image
                            source={{ uri: item?.text }}
                            style={{
                              width: 200,
                              height: 200,
                              resizeMode: 'contain'
                            }}
                          />
                        ) : (
                          <Text
                            style={{
                              color: '#fff',
                              fontFamily: FONT1REGULAR,
                              fontSize: hp(1.8)
                            }}
                          >
                            {item?.text}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text
                      style={{
                        color: COLORS.darkGrey,
                        fontFamily: FONT1REGULAR,
                        fontSize: hp(1.5),
                        marginTop: -5
                      }}
                    >
                      {moment(item?.timeStamp).fromNow()}
                    </Text>
                  </View>
                )
              } else {
                return (
                  <View
                    key={index}
                    style={{
                      width: '100%',
                      marginVertical: 10,
                      alignItems: 'flex-end'
                    }}
                  >
                    <View
                      style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        paddingBottom: 10
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: '#EAEAEA',
                          maxWidth: '95%',
                          alignItems: 'flex-end',
                          borderRadius: 15,
                          borderBottomRightRadius: 0,
                          padding: 15
                        }}
                      >
                        {item?.type === 'image' ? (
                          <Image
                            source={{ uri: item?.text }}
                            style={{
                              width: 200,
                              height: 200,
                              resizeMode: 'contain'
                            }}
                          />
                        ) : (
                          <Text
                            style={{
                              color: '#595F69',
                              fontFamily: FONT1REGULAR,
                              fontSize: hp(1.8)
                            }}
                          >
                            {item?.text}
                          </Text>
                        )}
                      </View>
                      <View
                        style={{
                          width: 0,
                          height: 0,
                          borderTopWidth: 8,
                          borderTopColor: 'transparent',
                          borderBottomWidth: 0,
                          borderBottomColor: 'transparent',
                          borderLeftWidth: 18,
                          borderLeftColor: '#EAEAEA'
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        color: COLORS.darkGrey,
                        fontFamily: FONT1REGULAR,
                        fontSize: hp(1.5),
                        marginTop: -5
                      }}
                    >
                      {moment(item?.timeStamp).fromNow()}
                    </Text>
                  </View>
                )
              }
            }}
          />
          {state.uploading && (
            <View
              style={{ width: '100%', alignItems: 'center', marginBottom: 10 }}
            >
              <ActivityIndicator size={'small'} color={COLORS.primary} />
            </View>
          )}
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              height: 70,
              backgroundColor: COLORS.white
            }}
          >
            <Input
              placeholderTextColor='#58595B'
              disabled={orderData?.status === 'Completed'}
              inputStyle={{
                fontSize: hp(1.8),
                color: COLORS.darkGrey,
                fontFamily: FONT1REGULAR,
                marginLeft: 10
              }}
              inputContainerStyle={{
                borderBottomWidth: 0,
                backgroundColor: '#E6E7E8',
                borderRadius: 50
              }}
              containerStyle={{ paddingLeft: 0, height: 40, width: '75%' }}
              onChangeText={message =>
                setState(prevState => ({ ...prevState, messageText: message }))
              }
              value={state.messageText}
              onSubmitEditing={() =>
                state.messageText ? onSend() : console.log('')
              }
              blurOnSubmit={false}
              returnKeyType='send'
              placeholder={'Write a message...'}
            />
            <TouchableOpacity
              disabled={orderData?.status === 'Completed'}
              style={{
                marginRight: 5
              }}
              onPress={_uploadImage}
            >
              <SvgXml xml={insertIcon} />
            </TouchableOpacity>
            <TouchableOpacity
              disabled={orderData?.status === 'Completed'}
              style={{ opacity: orderData?.status === 'Completed' ? 0.4 : 1 }}
              onPress={() => {
                state.messageText && orderData?.status !== 'Completed'
                  ? onSend()
                  : console.log('')
              }}
            >
              <SvgXml xml={sendIcon} />
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    alignItems: 'center'
  }
})

export default Messages
