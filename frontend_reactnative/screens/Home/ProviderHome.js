import React, { useCallback, useContext, useState } from 'react'
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { SvgXml } from 'react-native-svg'
import locationIcon from '../../assets/svg/blueLocation.svg'
import drying from '../../assets/svg/drying.svg'
import washingmachine from '../../assets/svg/washing-machine.svg'
import { AppButton, Header } from '../../components'
import {
  COLORS,
  FONT1BOLD,
  FONT1LIGHT,
  FONT1REGULAR,
  FONT1SEMIBOLD
} from '../../constants'
import AppContext from '../../store/Context'
import moment from 'moment'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { acceptOrder, skipOrder } from '../../api/order'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-simple-toast'
import { useFocusEffect } from '@react-navigation/native'

function ProviderHome ({ navigation }) {
  // Context
  const context = useContext(AppContext)
  const { _getNearbyOrders, _getOrder, nearbyOrders } = context
  const [state, setState] = useState({
    loading: false,
    loadingSkip: false,
    selectedIndex: ''
  })

  const { loading, selectedIndex, loadingSkip } = state
  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  useFocusEffect(
    useCallback(() => {
      _getNearbyOrders('?status=Pending')
    }, [])
  )
  const _acceptOrder = async (order_id, selectedIndex) => {
    try {
      handleChange('loading', true)
      handleChange('selectedIndex', selectedIndex)
      const payload = {
        order_id
      }
      const token = await AsyncStorage.getItem('token')
      await acceptOrder(payload, token)
      _getOrder()
      _getNearbyOrders('?status=Pending')
      handleChange('loading', false)
      handleChange('selectedIndex', '')
      Toast.show(`Order has been accepted`)
    } catch (error) {
      handleChange('loading', false)
      handleChange('selectedIndex', '')
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText}`)
    }
  }

  const _skipOrder = async order_id => {
    try {
      handleChange('loadingSkip', true)
      const payload = {
        order_id
      }
      const token = await AsyncStorage.getItem('token')
      await skipOrder(payload, token)
      _getOrder()
      _getNearbyOrders('?status=Pending')
      handleChange('loadingSkip', false)
      Toast.show(`Order has been skiped`)
    } catch (error) {
      handleChange('loadingSkip', false)
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText}`)
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: 'center' }}
    >
      <View style={styles.header}>
        <Header
          leftEmpty
          blueBG
          marginLeft={'-5%'}
          fontSize={hp(3.2)}
          fontFamily={FONT1BOLD}
          title={'Service Provider'}
          notification
        />
        <Text style={styles.welcomeText}>Welcome</Text>
        <Text style={styles.description}>
          All Service requests 
        </Text>
      </View>
      <View style={styles.mainBody}>
        <Text style={styles.typeText}>Service Requests</Text>
        <FlatList
          data={nearbyOrders}
          style={{ width: '90%', marginVertical: 20 }}
          renderItem={({ item, index }) => {
            return (
              <View key={index} style={styles.card}>
                <View s tyle={styles.cardBody}>
                  <View style={[styles.rowBetween]}>
                    <View>
                      <Text style={styles.label}>Service Type</Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          marginTop: -12,
                          alignItems: 'center'
                        }}
                      >
                        <Text style={styles.name}>{item?.type}</Text>
                        <SvgXml
                          width={20}
                          xml={
                            item?.type === 'Dry Cleaning'
                              ? drying
                              : washingmachine
                          }
                        />
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
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.label}>Service Price</Text>
                      <Text style={styles.priceText}>${item?.total_price}</Text>
                    </View>
                  </View>
                  <View style={[styles.rowBetween, { marginBottom: 20 }]}>
                    <View style={{ width: '40%' }}>
                      <AppButton
                        title={'Accept'}
                        loading={loading && selectedIndex === index}
                        onPress={() => _acceptOrder(item?.id, index)}
                        backgroundColor={COLORS.primary}
                        color={COLORS.white}
                      />
                    </View>
                    <View style={{ width: '40%' }}>
                      <AppButton
                        title={'Skip'}
                        backgroundColor={COLORS.white}
                        borderColor={COLORS.deleteButon}
                        color={COLORS.deleteButon}
                        outlined
                        loading={loadingSkip}
                        onPress={() => _skipOrder(item?.id)}
                      />
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.listButton}
                  onPress={() =>
                    navigation.navigate('ProviderServiceDetails', {
                      item: item
                    })
                  }
                >
                  <Text style={styles.listButtonText}>See Details</Text>
                </TouchableOpacity>
              </View>
            )
          }}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    width: wp('100%'),
    height: hp('100%')
  },
  header: {
    backgroundColor: COLORS.primary,
    height: hp(25),
    width: '100%',
    paddingLeft: '5%',
    paddingTop: hp(2),
    zIndex: 0
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
  cardBody: {
    paddingHorizontal: 10,
    paddingTop: 10,
    width: '100%'
  },
  card: {
    width: '97%',
    marginLeft: '1.5%',
    marginTop: 5,
    marginBottom: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: 'rgb(17, 107, 255)',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // width: '100%'
  },
  welcomeText: {
    fontFamily: FONT1SEMIBOLD,
    color: COLORS.white,
    fontSize: hp(3.2),
    marginRight: 5
  },
  name: {
    fontFamily: FONT1BOLD,
    color: COLORS.primary,
    fontSize: hp(3),
    marginRight: 5
  },
  checkLabel: {
    fontFamily: FONT1REGULAR,
    color: COLORS.darkBlack,
    fontSize: hp(2)
  },
  checkboxView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  typeText: {
    fontFamily: FONT1REGULAR,
    color: COLORS.primary,
    fontSize: hp(2.5),
    marginTop: -20
  },
  label: {
    fontFamily: FONT1LIGHT,
    color: COLORS.darkBlack,
    fontSize: hp(1.8)
  },
  dateText: {
    fontFamily: FONT1LIGHT,
    color: COLORS.grey,
    fontSize: hp(1.8)
  },
  priceText: {
    fontFamily: FONT1BOLD,
    color: COLORS.grey,
    fontSize: hp(2.5)
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
  listButton: {
    width: '100%',
    height: hp(7),
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listButtonText: {
    fontFamily: FONT1REGULAR,
    fontSize: hp(2),
    color: COLORS.white
  },
  street: {
    fontFamily: FONT1REGULAR,
    color: COLORS.grey,
    fontSize: hp(1.8),
    marginLeft: 10,
    width: '90%'
  },
  description: {
    fontFamily: FONT1REGULAR,
    color: COLORS.white,
    fontSize: hp(2),
    width: '80%',
    marginTop: 5
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
  }
})

export default ProviderHome
