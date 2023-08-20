import React, { useContext, useState } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { SvgXml } from 'react-native-svg'
import drying from '../../assets/svg/drying.svg'
import detergent from '../../assets/svg/detergent.svg'
import laundryDetergent from '../../assets/svg/laundry-detergent.svg'
import washingClothes from '../../assets/svg/washing-clothes.svg'
import washingmachine from '../../assets/svg/washing-machine.svg'
import { AppButton, Header } from '../../components'
import { COLORS, FONT1BOLD, FONT1MEDIUM, FONT1REGULAR } from '../../constants'
import AppContext from '../../store/Context'
import { createOrder, updateOrder } from '../../api/order'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-simple-toast'

function ServicePrice ({ route, navigation }) {
  const body = route?.params?.body
  const orderID = route?.params?.id
  // Context
  const context = useContext(AppContext)
  const { user, _getOrder, _getNearbyOrders, extraServices } = context
  const [state, setState] = useState({
    priority: false,
    loading: false,
    listModal: false,
    fold: false,
    hang: false,
    modalList: []
  })

  const handleOrder = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      handleChange('loading', true)
      if (body?.type === 'Wash and Fold') {
        const formData = new FormData()
        formData.append('type', body?.type)
        formData.append('special_detergent', body?.special_detergent)
        formData.append('special_softener', body?.special_softener)
        formData.append('total_weight', body?.total_weight)
        formData.append('intensive_clean', body?.intensive_clean)
        formData.append('priority', body?.priority)
        formData.append('street', user?.customer?.street)
        formData.append('city', user?.customer?.city)
        formData.append('zip', user?.customer?.zip)
        formData.append('state', user?.customer?.state)
        formData.append('location', user?.customer?.location)
        body?.item?.forEach((element, index) => {
          formData.append(`items[${index}]item`, element?.id)
          formData.append(`items[${index}]quantity`, element?.quantity)
          formData.append(`items[${index}]iron`, element?.iron || false)
        })
        if (orderID) {
          await updateOrder(orderID, formData, token)
        } else {
          await createOrder(formData, token)
        }
        _getOrder()
        _getNearbyOrders('?status=Pending')
        handleChange('loading', false)
        navigation.navigate('Home')
        Toast.show('Request Service Sumitted!')
      } else {
        const formData = new FormData()
        formData.append('type', body?.type)
        formData.append('priority', body?.priority)
        formData.append('street', user?.customer?.street)
        formData.append('city', user?.customer?.city)
        formData.append('zip', user?.customer?.zip)
        formData.append('state', user?.customer?.state)
        formData.append('location', user?.customer?.location)
        body?.item?.forEach((element, index) => {
          formData.append(`items[${index}]item`, element?.id)
          formData.append(`items[${index}]quantity`, element?.quantity)
        })
        if (orderID) {
          await updateOrder(orderID, formData, token)
        } else {
          await createOrder(formData, token)
        }
        _getOrder()
        handleChange('loading', false)
        navigation.navigate('Home')
        Toast.show('Request Service Sumitted!')
      }
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

  const getPrice = type => {
    const filtered = extraServices?.filter(extra => extra?.name === type)
    return filtered?.length > 0 ? filtered[0]?.price : 0
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainBody}>
        <Header back width={'100%'} title={'Service Price'} rightEmpty />
        <View style={styles.rowBetween}>
          <Text style={styles.leftText}>Service Type</Text>
          <View style={styles.row}>
            <Text style={styles.rightText}>{body?.type}</Text>
            <SvgXml
              xml={body?.type === 'Wash and Fold' ? washingmachine : drying}
              width={30}
              style={{ marginLeft: 10 }}
            />
          </View>
        </View>
        <View style={styles.hline} />
        <View style={styles.rowBetween}>
          <Text style={styles.leftText}>Number of clothes</Text>
          <View style={styles.row}>
            <Text style={styles.rightText}>
              {body?.totalQuantity +
                (body?.type === 'Wash and Fold' ? ' Piece' : ' Piece') +
                (+Number(body?.totalQuantity) > 1 ? 's' : '')}
            </Text>
          </View>
        </View>
        <View style={styles.hline} />
        {body?.type === 'Wash and Fold' &&
          (body?.special_detergent ||
            body?.special_softener ||
            body?.intensive_clean) && (
            <View
              style={[
                styles.rowBetween,
                { minHeight: 50, height: 'auto', alignItems: 'flex-start' }
              ]}
            >
              <Text style={[styles.leftText, { marginTop: 10 }]}>
                Extra Services
              </Text>
              <View
                style={{
                  width: '70%',
                  marginBottom: 10,
                  alignItems: 'flex-end'
                }}
              >
                {body?.special_detergent && (
                  <View style={[styles.row, { marginVertical: 5 }]}>
                    <Text style={[styles.rightText, { marginLeft: 10 }]}>
                      {'Use Special Detergent ($' +
                        getPrice('Special Detergent') +
                        ')'}
                    </Text>
                    <SvgXml
                      xml={detergent}
                      width={30}
                      style={{ marginLeft: 10 }}
                    />
                  </View>
                )}
                {body?.special_softener && (
                  <View style={[styles.row, { marginVertical: 5 }]}>
                    <Text style={[styles.rightText, { marginLeft: 10 }]}>
                      {'Use Special Clothes softening ($' +
                        getPrice('Special Softener') +
                        ')'}
                    </Text>
                    <SvgXml
                      xml={laundryDetergent}
                      width={30}
                      style={{ marginLeft: 10 }}
                    />
                  </View>
                )}
                {body?.intensive_clean && (
                  <View style={[styles.row, { marginVertical: 5 }]}>
                    <Text style={[styles.rightText, { marginLeft: 10 }]}>
                      {'Intensive Clean ($' + getPrice('Intensive Clean') + ')'}
                    </Text>
                    <SvgXml
                      xml={washingClothes}
                      width={30}
                      style={{ marginLeft: 10 }}
                    />
                  </View>
                )}
              </View>
            </View>
          )}
        {body?.type === 'Wash and Fold' && Number(body?.totalIron) > 0 && (
          <>
            <View style={styles.hline} />
            <View style={styles.rowBetween}>
              <Text style={styles.leftText}>Ironing</Text>
              <View style={styles.row}>
                <Text style={styles.rightText}>
                  {body?.totalIron +
                    (body?.type === 'Wash and Fold' ? ' Piece' : ' Piece') +
                    (+Number(body?.totalIron) > 1 ? 's' : '')}
                  {' ($' + getPrice('Ironing') + ')'}
                </Text>
              </View>
            </View>
          </>
        )}
        <View style={styles.hline} />
        {body?.priority && (
          <>
            <View style={styles.rowBetween}>
              <Text style={styles.leftText}>
                Priority (receive it the same day)
              </Text>
              <Text style={styles.leftText}>
                {' ($' + getPrice('Priority') + ')'}
              </Text>
            </View>
            <View style={styles.hline} />
          </>
        )}
        {body?.type === 'Wash and Fold' && (
          <>
            <View style={[styles.rowBetween, { height: 30, marginTop: 20 }]}>
              <Text style={styles.leftText}>Total Weight</Text>
              <Text style={styles.totalText}>
                {body?.total_weight} lbs (${getPrice('Weight')}/lbs)
              </Text>
            </View>

            <View style={[styles.rowBetween, { height: 30 }]}>
              <Text style={styles.leftText}>Subtotal</Text>
              <Text style={styles.totalText}>
                ${Number(body?.total_weight) * Number(getPrice('Weight'))}
              </Text>
            </View>
            <View style={[styles.rowBetween, { height: 30 }]}>
              <Text style={styles.leftText}>Tax</Text>
              <Text style={styles.totalText}>25%</Text>
            </View>
            <View style={[styles.rowBetween, { height: 30 }]}>
              <Text style={styles.leftText}>Total Price in $</Text>
              <Text style={styles.totalText1}>
                $
                {(
                  (body?.special_detergent
                    ? Number(getPrice('Special Detergent'))
                    : 0) +
                  (body?.special_softener
                    ? Number(getPrice('Special Softener'))
                    : 0) +
                  (body?.intensive_clean
                    ? Number(getPrice('Intensive Clean'))
                    : 0) +
                  (Number(body?.totalIron) > 0
                    ? Number(getPrice('Ironing')) * Number(body?.totalIron)
                    : 0) +
                  (body?.priority ? Number(getPrice('Priority')) : 0) +
                  Number(body?.total_weight) * Number(getPrice('Weight')) +
                  ((Number(body?.total_weight) * Number(getPrice('Weight'))) /
                    100) *
                    25
                ).toFixed(2)}
              </Text>
            </View>
          </>
        )}
        {body?.type !== 'Wash and Fold' && (
          <>
            <View style={[styles.rowBetween, { height: 30 }]}>
              <Text style={styles.leftText}>Subtotal</Text>
              <Text style={styles.totalText}>${body?.totalPrice}</Text>
            </View>
            <View style={[styles.rowBetween, { height: 30 }]}>
              <Text style={styles.leftText}>Tax</Text>
              <Text style={styles.totalText}>25%</Text>
            </View>
            <View style={[styles.rowBetween, { height: 30 }]}>
              <Text style={styles.leftText}>Total Price in $</Text>
              <Text style={styles.totalText1}>
                $
                {(
                  (body?.priority ? Number(getPrice('Priority')) : 0) +
                  body?.totalPrice +
                  (body?.totalPrice / 100) * 25
                ).toFixed(2)}
              </Text>
            </View>
          </>
        )}
      </View>
      <View style={styles.addmore}>
        <AppButton
          title={orderID ? 'Update Service' : 'Request Service'}
          loading={loading}
          onPress={handleOrder}
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
  rightText: {
    fontFamily: FONT1BOLD,
    fontSize: hp(2),
    textAlign: 'right',
    color: COLORS.grey
  },
  leftText: {
    fontFamily: FONT1REGULAR,
    fontSize: hp(2),
    color: COLORS.darkBlack
  },
  totalText: {
    fontFamily: FONT1MEDIUM,
    fontSize: hp(2),
    color: COLORS.black
  },
  totalText1: {
    fontFamily: FONT1MEDIUM,
    fontSize: hp(3),
    color: COLORS.primary
  },
  mainBody: {
    width: '90%',
    height: '80%',
    marginTop: 20,
    alignItems: 'center'
  },
  addmore: {
    width: '80%',
    marginBottom: 20
  },
  hline: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.borderColor
  }
})

export default ServicePrice
