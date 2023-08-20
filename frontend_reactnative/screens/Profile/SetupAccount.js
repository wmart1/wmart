import React, { useContext, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { COLORS, FONT1BOLD, FONT1REGULAR } from '../../constants'
import { AppButton, Header } from '../../components'
import { updateProfile } from '../../api/auth'
import Toast from 'react-native-simple-toast'
import AppContext from '../../store/Context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import washingClothes from '../../assets/svg/washing-clothes.svg'
import { SvgXml } from 'react-native-svg'
import laundryDetergent from '../../assets/svg/laundry-detergent.svg'
import drying from '../../assets/svg/drying.svg'
import ironIcon from '../../assets/svg/ironIcon.svg'
import washingmachine from '../../assets/svg/washing-machine.svg'
import detergent from '../../assets/svg/detergent.svg'
import Geocoder from 'react-native-geocoder'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { Icon } from 'react-native-elements'
import { createBusinessStripe } from '../../api/business'
import { WebView } from 'react-native-webview'

function SetupAccount ({ navigation }) {
  // Context
  const context = useContext(AppContext)
  const { user } = context
  // State
  const [state, setState] = useState({
    email: '',
    dry_cleaning: '',
    special_detergent: false,
    intensive_clean: false,
    special_softener: false,
    ironing: false,
    priority: false,
    loading: false,
    modalVisible: false,
    stripeLink: ''
  })

  const {
    loading,
    dry_cleaning,
    special_detergent,
    intensive_clean,
    special_softener,
    ironing,
    priority,
    modalVisible,
    stripeLink
  } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  const handleProfile = async () => {
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      const user_id = user?.id
      const formData = new FormData()
      formData.append('serviceprovider.dry_cleaning', dry_cleaning)
      formData.append('serviceprovider.intensive_clean', intensive_clean)
      formData.append('serviceprovider.special_softener', special_softener)
      formData.append('serviceprovider.ironing', ironing)
      formData.append('serviceprovider.priority', priority)
      formData.append('serviceprovider.special_detergent', special_detergent)
      const res = await updateProfile(formData, user_id, token)
      const res1 = await createBusinessStripe(token)
      handleChange('stripeLink', res1?.data?.link)
      handleChange('loading', false)
      handleChange('modalVisible', false)
      await AsyncStorage.setItem('user', JSON.stringify(res?.data))
      context?.setUser(res?.data)
      Toast.show(`Your profile has been updated!`)
    } catch (error) {
      handleChange('loading', false)
      const showWError = Object.values(error.response?.data)
      if (showWError.length > 0) {
        Toast.show(`Error: ${JSON.stringify(showWError[0])}`)
      } else {
        Toast.show(`Error: ${JSON.stringify(error)}`)
      }
    }
  }

  const goBack = () => {
    navigation.goBack()
  }

  const logout = async () => {
    context?.setUser(null)
    context?.setUserType('')
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('user')
    navigation.navigate('GettingStarted')
  }

  const handleWebViewNavigationStateChange = newNavState => {
    const { url } = newNavState
    if (!url) {
      alert('Something went wrong!')
      return
    }
    if (url === 'http://localhost:8080/success/') {
      handleChange('stripeLink', null)
      Alert.alert('Success', 'Verification process has been completed!', [
        { text: 'OK', onPress: () => navigation.navigate('MainTabService') }
      ])
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
  return (
    <KeyboardAwareScrollView
      style={styles.container}
      keyboardShouldPersistTaps='handled'
      contentContainerStyle={{
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <View style={styles.header}>
        <Header
          leftEmpty
          blueBG
          title={'Set Up Account'}
          rightSide={
            <TouchableOpacity onPress={logout}>
              <Text style={styles.loginText}>Logout</Text>
            </TouchableOpacity>
          }
        />
      </View>
      <View style={styles.mainBody}>
        <Text style={styles.choseText}>Choose Service Type</Text>
        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: dry_cleaning ? COLORS.primary : COLORS.white,
              marginTop: 20
            }
          ]}
          onPress={() => handleChange('dry_cleaning', true)}
        >
          <SvgXml xml={drying} width={30} />
          <Text
            style={[
              styles.dryText,
              { color: dry_cleaning ? COLORS.white : COLORS.primary }
            ]}
          >
            Dry Cleaning
          </Text>
          <View style={{ width: '10%' }} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor:
                dry_cleaning === false ? COLORS.primary : COLORS.white
            }
          ]}
          onPress={() => handleChange('dry_cleaning', false)}
        >
          <SvgXml xml={washingmachine} width={30} />
          <Text
            style={[
              styles.dryText,
              { color: dry_cleaning === false ? COLORS.white : COLORS.primary }
            ]}
          >
            Wash and Fold
          </Text>
          <View style={{ width: '10%' }} />
        </TouchableOpacity>
        <View style={styles.hline} />
        <Text style={[styles.choseText, { marginBottom: 10 }]}>
          Choose Extra Services you offer
        </Text>
        <View style={[styles.extraDiv]}>
          <View style={styles.row}>
            <SvgXml xml={detergent} />
            <Text style={[styles.dryText, { marginLeft: 10 }]}>
              Use Special Detergent
            </Text>
          </View>
          <BouncyCheckbox
            iconStyle={{
              borderColor: COLORS.grey,
              borderRadius: 5,
              width: 20,
              height: 20
            }}
            fillColor={COLORS.primary}
            onPress={() =>
              handleChange('special_detergent', !special_detergent)
            }
            unfillColor={COLORS.white}
            disableBuiltInState
            isChecked={special_detergent}
          />
        </View>
        <View style={[styles.extraDiv]}>
          <View style={styles.row}>
            <SvgXml xml={washingClothes} />
            <Text style={[styles.dryText, { marginLeft: 10 }]}>
              Intensive Clean
            </Text>
          </View>
          <BouncyCheckbox
            iconStyle={{
              borderColor: COLORS.grey,
              borderRadius: 5,
              width: 20,
              height: 20
            }}
            fillColor={COLORS.primary}
            onPress={() => handleChange('intensive_clean', !intensive_clean)}
            unfillColor={COLORS.white}
            disableBuiltInState
            isChecked={intensive_clean}
          />
        </View>
        <View style={[styles.extraDiv]}>
          <View style={styles.row}>
            <SvgXml xml={laundryDetergent} />
            <Text style={[styles.dryText, { marginLeft: 10 }]}>
              Use Special Clothes softning
            </Text>
          </View>
          <BouncyCheckbox
            iconStyle={{
              borderColor: COLORS.grey,
              borderRadius: 5,
              width: 20,
              height: 20
            }}
            fillColor={COLORS.primary}
            onPress={() => handleChange('special_softener', !special_softener)}
            unfillColor={COLORS.white}
            disableBuiltInState
            isChecked={special_softener}
          />
        </View>
        <View style={[styles.extraDiv]}>
          <View style={styles.row}>
            <SvgXml xml={ironIcon} />
            <Text style={[styles.dryText, { marginLeft: 10 }]}>Ironing</Text>
          </View>
          <BouncyCheckbox
            iconStyle={{
              borderColor: COLORS.grey,
              borderRadius: 5,
              width: 20,
              height: 20
            }}
            fillColor={COLORS.primary}
            onPress={() => handleChange('ironing', !ironing)}
            unfillColor={COLORS.white}
            disableBuiltInState
            isChecked={ironing}
          />
        </View>
        <View style={[styles.extraDiv]}>
          <View style={styles.row}>
            <Text style={[styles.dryText, { marginLeft: 10 }]}>
              Priority(receive it the same day)
            </Text>
          </View>
          <BouncyCheckbox
            iconStyle={{
              borderColor: COLORS.grey,
              borderRadius: 5,
              width: 20,
              height: 20
            }}
            fillColor={COLORS.primary}
            onPress={() => handleChange('priority', !priority)}
            unfillColor={COLORS.white}
            disableBuiltInState
            isChecked={priority}
          />
        </View>
        <View style={styles.buttonWidth}>
          <AppButton
            title={'Next'}
            disabled={dry_cleaning === ''}
            onPress={() => handleChange('modalVisible', true)}
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
            <View
              style={{
                alignItems: 'flex-end',
                width: '100%',
                marginRight: -80,
                marginTop: -45
              }}
            >
              <TouchableOpacity
                onPress={() => handleChange('modalVisible', false)}
                style={{
                  backgroundColor: COLORS.darkGrey,
                  width: 30,
                  height: 30,
                  borderRadius: 30,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon
                  name='close'
                  type='antdesign'
                  color={COLORS.white}
                  size={12}
                />
              </TouchableOpacity>
            </View>
            <Text
              style={[styles.choseText, { marginBottom: 30, marginTop: 30 }]}
            >
              Service provider will get a warning message. He needs to confirm
              that he understands what dry cleaning is and that his business has
              equipment needed for the dry cleaning process. Service provider
              can not accept dry cleaning option if he closes pop-up and not
              agree to consent
            </Text>
            <AppButton
              title={'Confirm'}
              loading={loading}
              onPress={handleProfile}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.white,
    height: '100%'
  },
  top: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20
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
  },
  hline: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.borderColor,
    marginVertical: 20
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
  },
  header: {
    backgroundColor: COLORS.primary,
    height: hp(25),
    width: '100%',
    paddingTop: hp(2),
    zIndex: 0
  },
  buttonWidth: { width: '90%', marginBottom: 20 },
  textInputContainer: { marginBottom: hp('2%'), width: '90%' },
  loginText: {
    color: COLORS.white,
    fontSize: hp(2),
    fontFamily: FONT1REGULAR
  },
  choseText: {
    color: COLORS.darkBlack,
    fontSize: hp(2),
    fontFamily: FONT1REGULAR
  },
  profileIcon: {
    width: hp(10),
    height: hp(10),
    borderRadius: 100,
    resizeMode: 'cover'
  },
  extraDiv: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    borderBottomColor: COLORS.inputBorder,
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 10
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%'
  },
  placeholder: {
    fontFamily: FONT1REGULAR,
    color: COLORS.black,
    fontSize: hp(2)
  },
  card: {
    width: '90%',
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15
  },
  name: {
    fontFamily: FONT1BOLD,
    color: COLORS.white,
    fontSize: hp(3.2)
  },
  dryText: {
    fontFamily: FONT1REGULAR,
    color: COLORS.darkBlack,
    fontSize: hp(2.2)
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  menuTriggerText: {
    fontFamily: FONT1REGULAR,
    color: COLORS.placeholder,
    fontSize: hp(2.2),
    marginHorizontal: 10
  }
})

export default SetupAccount
