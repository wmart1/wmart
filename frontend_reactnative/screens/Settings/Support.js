import React, { useContext, useState } from 'react'
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  Modal
} from 'react-native'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import {
  COLORS,
  FONT1LIGHT,
  FONT1MEDIUM,
  FONT1REGULAR,
  FONT2REGULAR
} from '../../constants'
import { AppButton, AppInput, Header } from '../../components'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import supportUpload from '../../assets/svg/supportUpload.svg'
import cameraIcon from '../../assets/svg/camera.svg'
import browseIcon from '../../assets/svg/browse.svg'
import copyIcon from '../../assets/svg/copy.svg'
import Toast from 'react-native-simple-toast'
import { useStripe, CardField } from '@stripe/stripe-react-native'
import { SvgXml } from 'react-native-svg'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppContext from '../../store/Context'
import ImagePicker from 'react-native-image-crop-picker'
import { createSupport } from '../../api/auth'

function Support ({ navigation }) {
  const stripe = useStripe()
  // Context
  const context = useContext(AppContext)
  const { _getPaymentMethod } = context
  // State
  const [state, setState] = useState({
    loading: false,
    modalVisible: false,
    subject: '',
    message: '',
    avatarSourceURL: '',
    photo: null
  })

  const {
    subject,
    modalVisible,
    loading,
    message,
    avatarSourceURL,
    photo
  } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  const _uploadImage = async type => {
    handleChange('uploading', true)
    handleChange('modalVisible', false)
    let OpenImagePicker =
      type == 'camera'
        ? ImagePicker.openCamera
        : type == ''
        ? ImagePicker.openPicker
        : ImagePicker.openPicker

    OpenImagePicker({
      width: 300,
      height: 300,
      cropping: true
    })
      .then(async response => {
        if (!response.path) {
          handleChange('uploading', false)
        } else {
          console.warn('response', response)
          const uri = response.path
          const uploadUri =
            Platform.OS === 'ios' ? uri.replace('file://', '') : uri
          const photo = {
            uri: uploadUri,
            name: 'userimage1.png',
            type: response.mime
          }
          handleChange('avatarSourceURL', uploadUri)
          handleChange('photo', photo)
          handleChange('uploading', false)
          Toast.show('Picture Add Successfully')
        }
      })
      .catch(err => {
        handleChange('showAlert', false)
        handleChange('uploading', false)
      })
  }

  const _createSupport = async () => {
    try {
      // const payload = {
      //   message,
      //   subject,
      //   // photo
      // }
      const payload = new FormData()
      payload.append('message', message)
      payload.append('subject', subject)
      payload.append('image', photo)
      const token = await AsyncStorage.getItem('token')
      await createSupport(payload, token)
      handleChange('loading', false)
      Toast.show(`Your request has been submitted!`)
      navigation.goBack()
    } catch (error) {
      handleChange('loading', false)
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText}`)
    }
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: 'center', height: '100%' }}
    >
      <View style={styles.header}>
        <Header
          back
          backColor={COLORS.white}
          title={'Support/Dispute'}
          blueBG
          rightEmpty
        />
      </View>
      <View style={styles.mainBody}>
        <View style={styles.top}>
          <View style={styles.textInputContainer}>
            <AppInput
              inputLabel={'Subject'}
              placeholder={''}
              name={'subject'}
              prefixBGTransparent
              value={subject}
              onChange={handleChange}
            />
          </View>
          <View style={styles.textInputContainer}>
            <AppInput
              inputLabel={'Message'}
              placeholder={''}
              name={'message'}
              multiline
              height={100}
              prefixBGTransparent
              value={message}
              onChange={handleChange}
            />
          </View>
          <TouchableOpacity
            onPress={() => handleChange('modalVisible', true)}
            style={styles.businessProfileIcon}
          >
            {avatarSourceURL ? (
              <Image
                source={{ uri: avatarSourceURL }}
                style={styles.profileIcon}
              />
            ) : (
              <SvgXml
                xml={supportUpload}
                style={{ marginTop: 20, marginBottom: -20 }}
                width={'60%'}
                height={120}
              />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.buttonWidth}>
          <AppButton
            title={'Submit'}
            disabled={!subject || !message || !photo}
            loading={loading}
            onPress={_createSupport}
          />
        </View>
      </View>
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          handleChange('modalVisible', false)
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.rowBetween}
              onPress={() => _uploadImage('camera')}
            >
              <Text style={styles.modalText}>Take photo or Video</Text>
              <SvgXml xml={cameraIcon} />
            </TouchableOpacity>
            <View style={styles.vline} />
            <TouchableOpacity
              style={[styles.rowBetween, { marginTop: 20 }]}
              onPress={() => _uploadImage('gallery')}
            >
              <Text style={styles.modalText}>Local Storage</Text>
              <SvgXml xml={copyIcon} />
            </TouchableOpacity>
            <View style={styles.vline} />
            <TouchableOpacity
              style={[styles.rowBetween, { marginTop: 20 }]}
              onPress={() => _uploadImage('gallery')}
            >
              <Text style={styles.modalText}>Browse</Text>
              <SvgXml xml={browseIcon} />
            </TouchableOpacity>
            <AppButton
              title={'Cancel'}
              loading={loading}
              onPress={() => handleChange('modalVisible', false)}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: '100%',
    height: '100%'
  },
  vline: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.borderColor,
    marginTop: 20
  },
  header: {
    backgroundColor: COLORS.primary,
    height: hp(25),
    width: '100%',
    paddingLeft: '5%',
    paddingTop: hp(2),
    zIndex: 0
  },
  businessProfileIcon: {
    alignItems: 'center',
    resizeMode: 'cover',
    marginBottom: 40
  },
  mainBody: {
    height: '75%',
    width: '100%',
    marginTop: -40,
    paddingTop: 40,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30
  },
  profileIcon: {
    width: '60%',
    height: 120,
    marginTop: 20,
    marginBottom: -20,
    borderRadius: 10,
    resizeMode: 'cover'
  },
  body: { width: '90%', flex: 1 },
  top: {
    width: '90%'
  },
  buttonWidth: {
    width: '80%'
  },
  hLine: {
    width: '110%',
    height: 1,
    marginVertical: 20,
    backgroundColor: COLORS.borderColor
  },
  textInputContainer: {
    marginBottom: 10
  },
  placeholder: {
    color: COLORS.darkBlack,
    fontFamily: FONT1LIGHT,
    fontSize: hp(1.8),
    marginTop: 20
  },
  modalText: {
    color: COLORS.primary,
    fontFamily: FONT1MEDIUM,
    fontSize: hp(2)
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between'
  },
  text1: {
    color: COLORS.darkBlack,
    fontFamily: FONT2REGULAR,
    fontSize: hp(2),
    marginLeft: 10
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmButton: {
    width: '90%',
    marginTop: 20
  },
  centeredView: {
    flex: 1,
    backgroundColor: COLORS.modalBG,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    width: '90%',
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  }
})

export default Support
