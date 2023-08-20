import React, { useContext, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { COLORS, FONT1LIGHT, FONT2REGULAR } from '../../constants'
import { AppButton, AppInput, Header } from '../../components'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-simple-toast'
import { useStripe, CardField } from '@stripe/stripe-react-native'
import { addPaymentMethod } from '../../api/payments'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppContext from '../../store/Context'

function AddCard ({ navigation }) {
  const stripe = useStripe()
  // Context
  const context = useContext(AppContext)
  const { _getPaymentMethod } = context
  // State
  const [state, setState] = useState({
    loading: false,
    name: '',
    cardDetails: null
  })

  const { name, loading, cardDetails } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  const handlePayment = async () => {
    try {
      handleChange('loading', true)
      console.warn('cardDetails', cardDetails)
      stripe
        .createPaymentMethod({
          type: 'Card',
          paymentMethodType: 'Card',
          card: cardDetails,
          billing_details: {
            name: name
          }
        })
        .then(result => {
          console.warn('result', result?.paymentMethod?.id)
          if (result?.paymentMethod?.id) {
            _AddPayMethod(result?.paymentMethod?.id)
          } else {
            alert(result.error.message)
            handleChange('loading', false)
          }
        })
    } catch (error) {
      handleChange('loading', false)
      console.warn('error', error)
      // const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${JSON.stringify(error)}`)
    }
  }

  const _AddPayMethod = async payment_method => {
    try {
      const payload = {
        payment_method
      }
      const token = await AsyncStorage.getItem('token')
      await addPaymentMethod(payload, token)
      handleChange('loading', false)
      _getPaymentMethod()
      Toast.show(`Card has been added!`)
      navigation.navigate('MainTabNav')
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
          title={'Payment Method'}
          blueBG
          rightSide={
            <TouchableOpacity
              style={{
                height: 40,
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onPress={() => navigation.navigate('MainTabNav')}
            >
              <Text
                style={{
                  fontFamily: FONT2REGULAR,
                  fontSize: hp(1.8),
                  color: COLORS.white
                }}
              >
                Skip
              </Text>
            </TouchableOpacity>
          }
        />
      </View>
      <View style={styles.mainBody}>
        <View style={styles.top}>
          <View style={styles.textInputContainer}>
            <AppInput
              inputLabel={'Cardholder Name'}
              placeholder={'Cardholder Name'}
              name={'name'}
              prefixBGTransparent
              value={name}
              onChange={handleChange}
            />
          </View>
          <Text style={styles.placeholder}>Card Number</Text>
          <View style={styles.expireButton}>
            <CardField
              postalCodeEnabled={false}
              placeholder={{
                number: '4242 4242 4242 4242'
              }}
              cardStyle={{
                backgroundColor: '#FFFFFF',
                textColor: '#000000'
              }}
              style={{
                width: '100%',
                height: '100%',
                marginVertical: 30
              }}
              onCardChange={cardDetails => {
                // console.log('cardDetails', cardDetails)
                handleChange('cardDetails', cardDetails)
              }}
              onFocus={focusedField => {
                console.log('focusField', focusedField)
              }}
            />
          </View>
        </View>
        <View style={styles.buttonWidth}>
          <AppButton
            title={'Add Card'}
            disabled={!name || !cardDetails}
            loading={loading}
            onPress={handlePayment}
          />
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: '100%',
    height: '100%'
  },
  header: {
    backgroundColor: COLORS.primary,
    height: hp(25),
    width: '100%',
    paddingLeft: '5%',
    paddingTop: hp(2),
    zIndex: 0
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
  expireButton: {
    width: '100%',
    marginBottom: 10,
    marginTop: 5,
    height: hp(7),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    justifyContent: 'center',
    paddingHorizontal: 5
  },
  placeholder: {
    color: COLORS.darkBlack,
    fontFamily: FONT1LIGHT,
    fontSize: hp(1.8),
    marginTop: 20
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
  }
})

export default AddCard
