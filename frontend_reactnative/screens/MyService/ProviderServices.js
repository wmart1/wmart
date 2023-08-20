import React, { useContext, useState } from 'react'
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
import closeIcon from '../../assets/svg/close.svg'
import drying from '../../assets/svg/drying.svg'
import washingmachine from '../../assets/svg/washing-machine.svg'
import { AppButton, AppInput, CustomModal, Header } from '../../components'
import {
  COLORS,
  FONT1BOLD,
  FONT1LIGHT,
  FONT1REGULAR,
  FONT1SEMIBOLD,
  OrderStatus2
} from '../../constants'
import AppContext from '../../store/Context'
import notificaionBlack from '../../assets/svg/notificaionBlack.svg'
import filterIcon from '../../assets/svg/filterIcon.svg'
import moment from 'moment'
import BouncyCheckbox from 'react-native-bouncy-checkbox'

function ProviderServices ({ navigation }) {
  // Context
  const context = useContext(AppContext)
  const { user, orders } = context
  const [state, setState] = useState({
    loading: false,
    listModal: false,
    selected: []
  })

  const { loading, listModal, selected } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  const filterBy = () => {
    if (selected.length > 0) {
      return orders?.filter(e => selected.some(f => f === e.status))
    } else {
      return orders?.filter(
        e =>
          e.status?.toLowerCase() !== 'pending' &&
          e.status?.toLowerCase() !== 'unpaid'
      )
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: 'center' }}
    >
      <View style={styles.header}>
        <Text style={styles.headingText}>My{'\n'}Services</Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.label}>Total Amount Earned</Text>
          <Text style={styles.priceText}>
            ${user?.serviceprovider?.earnings}
          </Text>
        </View>
      </View>
      <View style={styles.mainBody}>
        <View style={{ width: '90%' }}>
          <AppInput
            disabled
            placeholder={selected.length > 0 ? selected?.toString() : 'All'}
            postfix={
              <TouchableOpacity onPress={() => handleChange('listModal', true)}>
                <SvgXml xml={filterIcon} />
              </TouchableOpacity>
            }
          />
          <FlatList
            data={filterBy()}
            style={{ width: '100%', marginVertical: 20 }}
            renderItem={({ item, index }) => {
              return (
                <View key={index} style={styles.card}>
                  <View style={styles.cardBody}>
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
                          <Text style={styles.checkLabel}>
                            Priority Servcie
                          </Text>
                        </View>
                      ) : (
                        <View />
                      )}
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.label}>Service Price</Text>
                        <Text style={styles.priceText}>
                          ${item?.total_price}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.rowBetween}>
                      <View>
                        <Text
                          style={[
                            styles.priceText,
                            {
                              fontSize: hp(2),
                              fontFamily: FONT1REGULAR,
                              color:
                                item?.status === 'In Progress'
                                  ? COLORS.inprogressBorder
                                  : COLORS.completedBorder
                            }
                          ]}
                        >
                          {item?.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.listButton,
                      {
                        backgroundColor:
                          item?.status === 'Completed'
                            ? COLORS.grey
                            : COLORS.primary
                      }
                    ]}
                    // disabled={item?.status === 'Completed'}
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
      </View>
      <CustomModal
        visible={listModal}
        height={'40%'}
        onClose={() => handleChange('listModal', false)}
      >
        <View
          style={{
            alignItems: 'center'
          }}
        >
          <View
            style={{
              width: '90%',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <View
              style={[
                styles.rowBetween,
                { alignItems: 'flex-start', marginTop: 10 }
              ]}
            >
              <View>
                <Text
                  style={{
                    fontSize: hp(2.5),
                    fontFamily: FONT1REGULAR,
                    color: COLORS.darkBlack
                  }}
                >
                  Filter By Status
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleChange('listModal', false)}
              >
                <SvgXml xml={closeIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.hline} />
            <FlatList
              data={OrderStatus2}
              numColumns={2}
              style={{ marginTop: 20, width: '90%' }}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              renderItem={({ item, index }) => (
                <BouncyCheckbox
                  key={index}
                  iconStyle={{
                    borderColor: COLORS.grey,
                    borderRadius: 5,
                    width: 20,
                    height: 20
                  }}
                  text={item}
                  textStyle={{
                    fontFamily: FONT1REGULAR,
                    color: COLORS.darkBlack,
                    fontSize: hp(2),
                    textDecorationLine: 'none'
                  }}
                  style={{ marginRight: 20 }}
                  fillColor={COLORS.primary}
                  onPress={() => {
                    if (selected.some(e => e === item)) {
                      const removed = selected.filter(e => e !== item)
                      handleChange('selected', removed)
                    } else {
                      handleChange('selected', [...selected, item])
                    }
                  }}
                  unfillColor={COLORS.white}
                  disableBuiltInState
                  isChecked={selected?.some(e => e === item)}
                />
              )}
            />

            <View style={{ width: '90%', marginTop: 20 }}>
              <AppButton
                title={'Apply'}
                onPress={() => handleChange('listModal', false)}
              />
              <AppButton
                title={'Clear'}
                outlined
                backgroundColor={COLORS.white}
                onPress={() => {
                  handleChange('listModal', false)
                  handleChange('selected', [])
                }}
              />
            </View>
          </View>
        </View>
      </CustomModal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.profileBackgroud,
    width: wp('100%'),
    height: hp('100%')
  },
  header: {
    backgroundColor: COLORS.profileBackgroud,
    width: '100%',
    paddingHorizontal: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: hp(2),
    zIndex: 0
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
    marginTop: 20,
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
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30
  }
})

export default ProviderServices
