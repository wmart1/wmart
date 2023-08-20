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
import pinBlue from '../../assets/svg/pinBlue.svg'
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
  acceptOrder,
  createOrder,
  deleteOrder,
  getOrderByID,
  leaveReport,
  leaveCustomerReview,
  skipOrder,
  updateOrder
} from '../../api/order'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-simple-toast'
import { Icon } from 'react-native-elements'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { leaveTip } from '../../api/payments'
import BouncyCheckbox from 'react-native-bouncy-checkbox'

function ProviderServiceDetails ({ route, navigation }) {
  const item = route?.params?.item
  // Context
  const context = useContext(AppContext)
  const { _getProfile, _getOrder, _getNearbyOrders } = context
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
    loadingSkip: false,
    loadingReport: false
  })

  const {
    loading,
    orderData,
    isLeaveReview,
    isReviewProfile,
    isReview,
    rating,
    contextText,
    satisfaction,
    loadingReview,
    loadingCompleted,
    loadingSkip
  } = state

  useEffect(() => {
    // if (id) {
    //   _getOrderByID()
    // }
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

  const _acceptOrder = async () => {
    try {
      handleChange('loading', true)
      const payload = {
        order_id: item?.id
      }
      const token = await AsyncStorage.getItem('token')
      await acceptOrder(payload, token)
      _getOrder()
      _getNearbyOrders('?status=Pending')
      handleChange('loading', false)
      Toast.show(`Order has been accepted`)
      navigation.goBack()
    } catch (error) {
      handleChange('loading', false)
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText}`)
    }
  }

  const _skipOrder = async () => {
    try {
      handleChange('loadingSkip', true)
      const payload = {
        order_id: item?.id
      }
      const token = await AsyncStorage.getItem('token')
      await skipOrder(payload, token)
      _getOrder()
      _getNearbyOrders('?status=Pending')
      handleChange('loadingSkip', false)
      Toast.show(`Order has been skiped`)
      navigation.goBack()
    } catch (error) {
      handleChange('loadingSkip', false)
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText}`)
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
        user: item?.user?.id,
        rating,
        satisfaction,
        context: contextText,
        order: item?.id
      }
      await leaveCustomerReview(payload, token)
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

  const _updateOrder = async () => {
    try {
      handleChange('loadingCompleted', true)
      const token = await AsyncStorage.getItem('token')
      const payload = {
        status: 'Completed'
      }
      await updateOrder(item?.id, payload, token)
      handleChange('loadingCompleted', false)
      Toast.show(`Order has been completed!`)
      _getOrder()
      _getProfile()
      navigation.navigate('Services')
    } catch (error) {
      handleChange('loadingCompleted', false)
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

  console.warn('item?.service_provider', item)

  return (
    <View style={[styles.container, { alignItems: 'center' }]}>
      <ScrollView
        style={[
          styles.container,
          {
            marginBottom:
              item?.status === 'Pending' || item?.status === 'Unpaid'
                ? 100
                : item?.status === 'In Progress' || item?.status === 'Completed'
                ? 170
                : 10
          }
        ]}
        scrollEnabled
        contentContainerStyle={{
          alignItems: 'center'
        }}
      >
        <View style={styles.mainBody}>
          <Header back width={'100%'} title={'Service Request Details'} rightEmpty />
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
                  xml={item?.type === 'Dry Cleaning' ? drying : washingmachine}
                />
                <Text style={styles.name}>{item?.type}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.label}>Ordered on</Text>
              <Text style={styles.dateText}>
                {moment(item?.date).format('DD-MMM-YYYY')}
              </Text>
            </View>
          </View>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.label}>Customer Name</Text>
              <Text style={[styles.nameText, { color: COLORS.primary }]}>
                {item?.user?.name}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.label}>Service Price</Text>
              <Text
                style={[
                  styles.dateText,
                  { fontSize: hp(3), fontFamily: FONT1BOLD, color: COLORS.grey }
                ]}
              >
                ${item?.total_price}
              </Text>
            </View>
          </View>
          <View
            style={[styles.rowBetween, { marginTop: 10, marginBottom: 10 }]}
          >
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Chat', {
                  orderID: item?.id,
                  orderData: item
                })
              }
              disabled={item?.status !== 'In Progress'}
              style={{ alignItems: 'center' }}
            >
              <SvgXml
                width={20}
                xml={item?.status === 'In Progress' ? ChatIcon : ChatGreyIcon}
              />
              <Text
                style={[
                  styles.chatText,
                  {
                    color:
                      item?.status === 'In Progress'
                        ? COLORS.primary
                        : COLORS.grey
                  }
                ]}
              >
                Chat
              </Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.row}>
                <SvgXml xml={pinBlue} />
                <Text
                  style={[
                    styles.dateText,
                    { fontFamily: FONT1REGULAR, color: COLORS.primary }
                  ]}
                >
                  {item?.street}
                </Text>
              </View>
            </View>
          </View>
          {/* <View style={{ width: '100%', marginBottom: 20 }}>
            <View
              style={[
                styles.statusBox,
                {
                  backgroundColor:
                    item?.status === 'Completed'
                      ? COLORS.completed
                      : item?.status === 'In Progress'
                      ? COLORS.inprogress
                      : COLORS.pending,
                  borderColor:
                    item?.status === 'Completed'
                      ? COLORS.completedBorder
                      : item?.status === 'In Progress'
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
                      item?.status === 'Completed'
                        ? COLORS.completedBorder
                        : item?.status === 'In Progress'
                        ? COLORS.inprogressBorder
                        : COLORS.pendingBorder
                  }
                ]}
              >
                {item?.status}
              </Text>
            </View>
          </View> */}
          <View style={styles.rowBetween}>
            {item?.priority ? (
              <View style={styles.checkboxView}>
                <BouncyCheckbox
                  iconStyle={{
                    borderColor: COLORS.grey,
                    borderRadius: 5,
                    width: 20,
                    height: 20
                  }}
                  fillColor={COLORS.primary}
                  // onPress={() => handleChange('priority', !priority)}
                  unfillColor={COLORS.profileBackgroud}
                  disableBuiltInState
                  isChecked={true}
                />
                <Text style={styles.checkLabel}>Priority Servcie</Text>
              </View>
            ) : (
              <View />
            )}
            <Text style={[styles.totalText]}>
              Total Clothes: {item?.items?.length}
            </Text>
          </View>
          <View style={styles.listContainer}>
            <Text style={styles.typeText}>{item?.type}</Text>
            {item?.items?.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.listCard,
                  {
                    borderBottomWidth: index < item?.items?.length - 1 ? 1 : 0
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
      {(item?.status === 'Pending' || item?.status === 'Unpaid') && (
        <View style={styles.editBox}>
          <View style={{ width: '45%' }}>
            <AppButton
              title={'Accept'}
              onPress={_acceptOrder}
              backgroundColor={COLORS.primary}
              color={COLORS.white}
            />
          </View>
          <View style={{ width: '45%' }}>
            <AppButton
              title={'Skip'}
              loading={loadingSkip}
              backgroundColor={COLORS.white}
              borderColor={COLORS.deleteButon}
              color={COLORS.deleteButon}
              outlined
              onPress={_skipOrder}
            />
          </View>
        </View>
      )}
      {(item?.status === 'In Progress' || item?.status === 'Completed') &&
        isLeaveReview && (
          <View style={styles.completedBox}>
            <View style={{ width: '90%' }}>
              <AppButton
                title={'Completed'}
                loading={loadingCompleted}
                disabled={item?.status === 'Completed'}
                onPress={_updateOrder}
              />
            </View>
            <View style={{ width: '90%' }}>
              <AppButton
                title={'Leave Review'}
                borderColor={COLORS.primary}
                disabled={item?.status !== 'Completed'}
                backgroundColor={COLORS.white}
                outlined
                onPress={() => {
                  handleChange('isReviewProfile', true)
                  handleChange('isLeaveReview', false)
                  handleChange('isReview', false)
                }}
              />
            </View>
          </View>
        )}
      {item?.status === 'Completed' && isReviewProfile && (
        <View
          style={[
            styles.completedBox,
            { height: '50%', padding: 0, paddingHorizontal: 0 }
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
              item?.user?.customer?.photo
                ? { uri: item?.user?.customer?.photo }
                : userProfile
            }
          />
          <Text style={styles.price}>{item?.user?.name}</Text>
          <Text style={[styles.price]}>{item?.user?.email}</Text>
          <View style={{ width: '80%' }}>
            <AppButton
              title={'Leave Review'}
              onPress={() => {
                handleChange('isReviewProfile', false)
                handleChange('isLeaveReview', false)
                handleChange('isReview', true)
              }}
            />
          </View>
        </View>
      )}
      {item?.status === 'Completed' && isReview && (
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
              item?.user?.customer?.photo
                ? { uri: item?.user?.customer?.photo }
                : userProfile
            }
          />
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            style={{ width: '100%' }}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            <Text style={styles.price}>{item?.user?.name}</Text>
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
              How are you satisfied with the customer?
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.profileBackgroud,
    width: '100%',
    height: '100%'
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
    height: 180,
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
    height: '7880%',
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
    backgroundColor: COLORS.white,
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
    height: '35%',
    width: '100%',
    alignItems: 'flex-start',
    padding: 10,
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30
  },
  checkboxView: {
    flexDirection: 'row',
    alignItems: 'center'
  }
})

export default ProviderServiceDetails
