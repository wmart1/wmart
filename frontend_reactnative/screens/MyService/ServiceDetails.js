import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { SvgXml } from 'react-native-svg'
import drying from '../../assets/svg/drying.svg'
import happy from '../../assets/svg/happy.svg'
import good from '../../assets/svg/good.svg'
import sad from '../../assets/svg/sad.svg'
import ChatIcon from '../../assets/svg/Chat.svg'
import ChatGreyIcon from '../../assets/svg/ChatGrey.svg'
import userProfile from '../../assets/images/userProfile.png'
import { Rating } from 'react-native-elements'
import laundry from '../../assets/svg/laundry.svg'
import washingmachine from '../../assets/svg/washing-machine.svg'
import { AppButton, AppInput, CustomModal, Header } from '../../components'
import {
  COLORS,
  FONT1BOLD,
  FONT1LIGHT,
  FONT1MEDIUM,
  FONT1REGULAR,
  FONT1SEMIBOLD
} from '../../constants'
import AppContext from '../../store/Context'
import moment from 'moment'
import {
  createOrder,
  deleteOrder,
  getOrderByID,
  leaveReport,
  leaveReview
} from '../../api/order'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-simple-toast'
import { Icon } from 'react-native-elements'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { leaveTip } from '../../api/payments'

function ServiceDetails ({ route, navigation }) {
  const id = route?.params?.id
  // Context
  const context = useContext(AppContext)
  const { user, _getOrder } = context
  const [state, setState] = useState({
    orderData: null,
    loading: false,
    isLeaveReview: true,
    isReviewProfile: false,
    isReview: false,
    isTip: false,
    loadingReview: false,
    loadingTip: false,
    rating: 0,
    contextText: '',
    satisfaction: '',
    tip: '',
    report: '',
    isReport: false,
    loadingReport: false
  })

  const {
    loading,
    orderData,
    isLeaveReview,
    isReviewProfile,
    isReview,
    isTip,
    rating,
    contextText,
    satisfaction,
    loadingReview,
    tip,
    loadingTip,
    report,
    isReport,
    loadingReport
  } = state

  useEffect(() => {
    if (id) {
      _getOrderByID()
    }
  }, [])

  const _getOrderByID = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      handleChange('loading', true)
      const res = await getOrderByID(id, token)
      handleChange('orderData', res?.data)
      handleChange('loading', false)
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

  const _deleteOrder = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      handleChange('loading', true)
      const res = await deleteOrder(id, token)
      Toast.show(`Order has been deleted!`)
      handleChange('loading', false)
      _getOrder()
      navigation.navigate('MainTabNav')
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

  const _leaveReview = async () => {
    try {
      handleChange('loadingReview', true)
      const token = await AsyncStorage.getItem('token')
      const payload = {
        service_provider: orderData?.service_provider?.id,
        rating,
        satisfaction,
        context: contextText,
        order: orderData?.id
      }
      await leaveReview(payload, token)
      Toast.show(`Review has been submitted!`)
      handleChange('loadingReview', false)
      handleChange('isReview', false)
      handleChange('isLeaveReview', true)
    } catch (error) {
      handleChange('loadingReview', false)
      const errorText = Object.values(error?.response?.data)
      if (errorText.length > 0) {
        if (errorText[0] == 'This field must be unique.') {
          Toast.show(`You already submitted!`)
          handleChange('isReview', false)
          handleChange('isLeaveReview', true)
        } else {
          Toast.show(`Error: ${errorText[0]}`)
        }
      } else {
        Toast.show(`Error: ${error}`)
      }
    }
  }

  const _leaveTip = async () => {
    try {
      handleChange('loadingTip', true)
      const token = await AsyncStorage.getItem('token')
      const payload = {
        tip: Number(tip),
        order_id: orderData?.id
      }
      await leaveTip(payload, token)
      Toast.show(`Tip has been sent!`)
      handleChange('loadingTip', false)
      handleChange('isTip', false)
      handleChange('isLeaveReview', true)
      handleChange('tip', '')
    } catch (error) {
      handleChange('loadingTip', false)
      const errorText = Object.values(error?.response?.data)
      if (errorText.length > 0) {
        Toast.show(`Error: ${errorText[0]}`)
      } else {
        Toast.show(`Error: ${error}`)
      }
    }
  }

  const _leaveReport = async () => {
    try {
      handleChange('loadingTip', true)
      const token = await AsyncStorage.getItem('token')
      const payload = {
        message: report
        // order_id: orderData?.id
      }
      await leaveReport(payload, token)
      Toast.show(`Report has been submitted!`)
      handleChange('loadingReport', false)
      handleChange('isReport', false)
      handleChange('isLeaveReview', true)
      handleChange('report', '')
    } catch (error) {
      handleChange('loadingReport', false)
      const errorText = Object.values(error?.response?.data)
      if (errorText.length > 0) {
        Toast.show(`Error: ${errorText[0]}`)
      } else {
        Toast.show(`Error: ${error}`)
      }
    }
  }

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size={'large'} color={COLORS.primary} />
      </View>
    )
  }

  console.warn('orderData?.service_provider', orderData?.service_provider)

  return (
    <View style={[styles.container, { height: '100%', alignItems: 'center' }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <View style={styles.mainBody}>
          <Header back width={'100%'} title={'Service Details'} rightEmpty />
          <View style={[styles.rowBetween, { marginTop: 20 }]}>
            <View>
              <Text style={styles.label}>Service Type</Text>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: -12,
                  alignItems: 'center'
                }}
              >
                <SvgXml
                  width={20}
                  xml={
                    orderData?.type === 'Dry Cleaning' ? drying : washingmachine
                  }
                />
                <Text style={styles.name}>{orderData?.type}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.label}>Ordered on</Text>
              <Text style={styles.dateText}>
                {moment(orderData?.date).format('DD-MMM-YYYY')}
              </Text>
            </View>
          </View>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.label}>Service Provider name</Text>
              <Text style={styles.nameText}>
                {orderData?.service_provider?.business_name || 'NIl'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Chat', {
                  orderID: orderData?.id,
                  orderData
                })
              }
              disabled={
                orderData?.status !== 'In Progress' &&
                orderData?.status !== 'Completed'
              }
              style={{ alignItems: 'center' }}
            >
              <SvgXml
                width={20}
                xml={
                  orderData?.status === 'In Progress' ||
                  orderData?.status === 'Completed'
                    ? ChatIcon
                    : ChatGreyIcon
                }
              />
              <Text
                style={[
                  styles.chatText,
                  {
                    color:
                      orderData?.status === 'In Progress' ||
                      orderData?.status === 'Completed'
                        ? COLORS.primary
                        : COLORS.grey
                  }
                ]}
              >
                Chat
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ width: '100%', marginBottom: 20 }}>
            <View
              style={[
                styles.statusBox,
                {
                  backgroundColor:
                    orderData?.status === 'Completed'
                      ? COLORS.completed
                      : orderData?.status === 'In Progress'
                      ? COLORS.inprogress
                      : COLORS.pending,
                  borderColor:
                    orderData?.status === 'Completed'
                      ? COLORS.completedBorder
                      : orderData?.status === 'In Progress'
                      ? COLORS.inprogressBorder
                      : COLORS.pendingBorder
                }
              ]}
            >
              <Text
                style={[
                  styles.statusBoxText,
                  {
                    color:
                      orderData?.status === 'Completed'
                        ? COLORS.completedBorder
                        : orderData?.status === 'In Progress'
                        ? COLORS.inprogressBorder
                        : COLORS.pendingBorder
                  }
                ]}
              >
                {orderData?.status}
              </Text>
            </View>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.totalText}>Total Clothes</Text>
            <Text style={[styles.totalText, { color: COLORS.primary }]}>
              {orderData?.items?.length} selected
            </Text>
          </View>
          <View style={styles.listContainer}>
            <Text style={styles.typeText}>{orderData?.type}</Text>
            {orderData?.items?.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.listCard,
                  {
                    borderBottomWidth:
                      index < orderData?.items?.length - 1 ? 1 : 0
                  }
                ]}
              >
                <View
                  style={[
                    styles.row,
                    { width: '100%', justifyContent: 'space-between' }
                  ]}
                >
                  <View style={styles.row}>
                    <Image
                      source={{ uri: item?.item?.image }}
                      style={{
                        marginRight: 10,
                        width: 30,
                        height: 50,
                        resizeMode: 'contain'
                      }}
                    />
                    <View>
                      <Text style={styles.name1}>{item?.item?.name}</Text>
                      <Text style={styles.price}>
                        ${item?.item?.unit_price}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <Text style={[styles.qty, { marginHorizontal: 5 }]}>
                      Qty:{item?.quantity || 0}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      {(orderData?.status === 'Pending' || orderData?.status === 'Unpaid') && (
        <View style={styles.editBox}>
          <View style={{ width: '45%' }}>
            <AppButton
              title={'Edit'}
              onPress={() =>
                navigation.navigate(
                  orderData?.type === 'Dry Cleaning'
                    ? 'DryCleaner'
                    : 'WashFold',
                  { orderData }
                )
              }
              backgroundColor={COLORS.white}
              borderColor={COLORS.primary}
              outlined
            />
          </View>
          <View style={{ width: '45%' }}>
            <AppButton
              title={'Cancel'}
              backgroundColor={COLORS.deleteButon}
              onPress={_deleteOrder}
            />
          </View>
        </View>
      )}
      {orderData?.status === 'Completed' && isLeaveReview && (
        <View style={styles.completedBox}>
          <View style={{ width: '90%' }}>
            <AppButton
              title={'Leave Review'}
              onPress={() => {
                handleChange('isReviewProfile', true)
                handleChange('isLeaveReview', false)
                handleChange('isReview', false)
                handleChange('isTip', false)
              }}
            />
          </View>
          <View style={{ width: '90%' }}>
            <AppButton
              title={'Tip Provider'}
              borderColor={COLORS.primary}
              backgroundColor={COLORS.white}
              outlined
              onPress={() => {
                handleChange('isReviewProfile', false)
                handleChange('isLeaveReview', false)
                handleChange('isReview', false)
                handleChange('isTip', true)
              }}
            />
          </View>
          <View style={{ width: '90%' }}>
            <AppButton
              title={'Report a Problem'}
              borderColor={COLORS.primary}
              backgroundColor={COLORS.white}
              outlined
              onPress={() => {
                handleChange('isReviewProfile', false)
                handleChange('isLeaveReview', false)
                handleChange('isReview', false)
                handleChange('isTip', false)
                handleChange('isReport', true)
              }}
            />
          </View>
        </View>
      )}
      {orderData?.status === 'Completed' && isReviewProfile && (
        <View
          style={[
            styles.completedBox,
            { height: '80%', padding: 0, paddingHorizontal: 0 }
          ]}
        >
          <View style={styles.leaveHeader}>
            <TouchableOpacity
              onPress={() => {
                handleChange('isReviewProfile', false)
                handleChange('isLeaveReview', true)
                handleChange('isReview', false)
                handleChange('isTip', false)
              }}
            >
              <Icon name='arrowleft' type='antdesign' color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Image
            style={{
              width: 100,
              height: 100,
              borderRadius: 100,
              marginTop: -50,
              zIndex: 1
            }}
            source={
              orderData?.service_provider?.photo
                ? { uri: orderData?.service_provider?.photo }
                : userProfile
            }
          />
          <Text style={styles.price}>
            {orderData?.service_provider?.business_name}
          </Text>
          <Text style={[styles.name, { color: COLORS.darkGrey }]}>{'Bio'}</Text>
          <Text
            style={[
              styles.price,
              { textAlign: 'justify', width: '80%', marginTop: 10 }
            ]}
          >
            {orderData?.service_provider?.bio}
          </Text>
          <View style={{ width: '80%' }}>
            <AppButton
              title={'Leave Review'}
              onPress={() => {
                handleChange('isReviewProfile', false)
                handleChange('isLeaveReview', false)
                handleChange('isReview', true)
                handleChange('isTip', false)
              }}
            />
          </View>
          <View style={{ width: '80%' }}>
            <AppButton
              title={'Tip Provider'}
              borderColor={COLORS.primary}
              backgroundColor={COLORS.white}
              outlined
              onPress={() => {
                handleChange('isReviewProfile', false)
                handleChange('isLeaveReview', false)
                handleChange('isReview', false)
                handleChange('isTip', true)
              }}
            />
          </View>
        </View>
      )}
      {orderData?.status === 'Completed' && isReview && (
        <View
          style={[
            styles.completedBox,
            { height: '70%', padding: 0, paddingHorizontal: 0 }
          ]}
        >
          <Image
            style={{
              width: 100,
              height: 100,
              borderRadius: 100,
              marginTop: -50,
              zIndex: 1
            }}
            source={
              orderData?.service_provider?.photo
                ? { uri: orderData?.service_provider?.photo }
                : userProfile
            }
          />
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            style={{ width: '100%' }}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            <Text style={styles.price}>
              {orderData?.service_provider?.business_name}
            </Text>
            <Rating
              showRating={false}
              type='custom'
              ratingColor={COLORS.Attention}
              ratingCount={5}
              imageSize={20}
              startingValue={rating || 0}
              onFinishRating={rating => handleChange('rating', rating)}
              style={{ paddingVertical: 10 }}
            />
            <Text
              style={[
                styles.price,
                {
                  textAlign: 'center',
                  width: '60%',
                  marginTop: 20,
                  marginBottom: 20
                }
              ]}
            >
              How are you satisfied with the service?
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: '60%',
                marginBottom: 20
              }}
            >
              <TouchableOpacity
                onPress={() => handleChange('satisfaction', 'Excellent')}
              >
                <SvgXml xml={happy} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleChange('satisfaction', 'Good')}
              >
                <SvgXml xml={good} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleChange('satisfaction', 'Bad')}
              >
                <SvgXml xml={sad} />
              </TouchableOpacity>
            </View>
            <View style={{ width: '90%' }}>
              <AppInput
                placeholder={'Tell us why'}
                value={contextText}
                name={'contextText'}
                onChange={handleChange}
                backgroundColor={COLORS.backgroud}
                multiline
                height={100}
              />
            </View>
            <View style={{ width: '80%' }}>
              <AppButton
                title={'Submit'}
                loading={loadingReview}
                disabled={!rating || !contextText || !satisfaction}
                onPress={_leaveReview}
              />
            </View>
          </KeyboardAwareScrollView>
        </View>
      )}
      {orderData?.status === 'Completed' && isTip && (
        <View
          style={[
            styles.completedBox,
            { height: '30%', padding: 0, paddingHorizontal: 0 }
          ]}
        >
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            style={{ width: '100%' }}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            <Text
              style={[
                styles.price,
                {
                  color: COLORS.primary,
                  width: '90%',
                  marginTop: 30,
                  marginBottom: 5
                }
              ]}
            >
              Tip Service Provider
            </Text>
            <View style={{ width: '90%' }}>
              <AppInput
                placeholder={'$'}
                value={tip}
                name={'tip'}
                keyboardType={'number-pad'}
                onChange={handleChange}
              />
            </View>
            <View style={{ width: '90%' }}>
              <AppButton
                title={'Next'}
                loading={loadingTip}
                disabled={!tip}
                onPress={_leaveTip}
              />
            </View>
          </KeyboardAwareScrollView>
        </View>
      )}
      {orderData?.status === 'Completed' && isReport && (
        <View
          style={[
            styles.completedBox,
            { height: '30%', padding: 0, paddingHorizontal: 0 }
          ]}
        >
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            style={{ width: '100%' }}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            <Text
              style={[
                styles.price,
                {
                  color: COLORS.primary,
                  width: '90%',
                  marginTop: 30,
                  marginBottom: 5
                }
              ]}
            >
              Report a Problem
            </Text>
            <View style={{ width: '90%' }}>
              <AppInput
                placeholder={'Write a problem...'}
                value={report}
                name={'report'}
                onChange={handleChange}
              />
            </View>
            <View style={{ width: '90%' }}>
              <AppButton
                title={'Report'}
                loading={loadingReport}
                disabled={!report}
                onPress={_leaveReport}
              />
            </View>
          </KeyboardAwareScrollView>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.profileBackgroud,
    width: '100%'
    // height: '100%'
  },
  editBox: {
    width: '100%',
    backgroundColor: COLORS.white,
    paddingHorizontal: '5%',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    position: 'absolute',
    bottom: 0,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#116BFF',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    padding: 20,
    elevation: 3
  },
  completedBox: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: '5%',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    position: 'absolute',
    bottom: 0,
    height: 250,
    shadowColor: '#116BFF',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    padding: 20,
    elevation: 3
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
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  rightText: {
    fontFamily: FONT1BOLD,
    fontSize: hp(2),
    color: COLORS.grey
  },
  leftText: {
    fontFamily: FONT1REGULAR,
    fontSize: hp(2),
    color: COLORS.darkBlack
  },
  mainBody: {
    width: '90%',
    height: '80%',
    marginTop: 20,
    alignItems: 'center'
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  name: {
    fontFamily: FONT1BOLD,
    color: COLORS.primary,
    fontSize: hp(3.2),
    marginRight: 5
  },
  label: {
    fontFamily: FONT1LIGHT,
    color: COLORS.darkBlack,
    fontSize: hp(1.8)
  },
  statusBox: {
    height: hp(5),
    maxWidth: 130,
    marginTop: 5,
    paddingHorizontal: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 10
  },
  statusBoxText: {
    fontFamily: FONT1REGULAR,
    fontSize: hp(1.8)
  },
  dateText: {
    fontFamily: FONT1LIGHT,
    color: COLORS.grey,
    fontSize: hp(1.8)
  },
  chatText: {
    fontFamily: FONT1LIGHT,
    color: COLORS.primary,
    fontSize: hp(2)
  },
  nameText: {
    fontFamily: FONT1SEMIBOLD,
    color: COLORS.darkBlack,
    fontSize: hp(2.2)
  },
  headingText: {
    fontFamily: FONT1SEMIBOLD,
    color: COLORS.darkBlack,
    fontSize: hp(3.5)
  },
  dryText: {
    fontFamily: FONT1REGULAR,
    color: COLORS.darkBlack,
    fontSize: hp(2.2)
  },
  name1: {
    fontFamily: FONT1REGULAR,
    color: COLORS.darkBlack,
    fontSize: hp(2.3)
  },
  typeText: {
    fontFamily: FONT1MEDIUM,
    color: COLORS.primary,
    fontSize: hp(2.3)
  },
  totalText: {
    fontFamily: FONT1REGULAR,
    color: COLORS.darkGrey,
    fontSize: hp(2)
  },
  qty: {
    fontFamily: FONT1REGULAR,
    color: COLORS.primary,
    fontSize: hp(2)
  },
  price: {
    fontFamily: FONT1REGULAR,
    color: COLORS.darkBlack,
    fontSize: hp(2)
  },
  dryText: {
    fontFamily: FONT1REGULAR,
    color: COLORS.darkBlack,
    fontSize: hp(2.2)
  },
  listCard: {
    width: '100%',
    marginTop: 2,
    paddingBottom: 10,
    marginLeft: 2,
    borderColor: COLORS.inputBorder,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  listContainer: {
    borderRadius: 10,
    marginBottom: 30,
    marginTop: 10,
    width: '100%',
    shadowColor: '#116BFF',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    padding: 20,
    elevation: 3
  },
  leaveHeader: {
    height: '20%',
    width: '100%',
    alignItems: 'flex-start',
    padding: 10,
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30
  }
})

export default ServiceDetails
