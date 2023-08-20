import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { SvgXml } from 'react-native-svg'
import closeIcon from '../../assets/svg/close.svg'
import shirtIcon from '../../assets/svg/shirt.svg'
import coatIcon from '../../assets/svg/coat.svg'
import dressIcon from '../../assets/svg/dress.svg'
import trousersIcon from '../../assets/svg/trousers.svg'
import tieIcon from '../../assets/svg/tie.svg'
import detergent from '../../assets/svg/detergent.svg'
import laundryDetergent from '../../assets/svg/laundry-detergent.svg'
import washingClothes from '../../assets/svg/washing-clothes.svg'
import { AppButton, AppInput, CustomModal, Header } from '../../components'
import { COLORS, FONT1BOLD, FONT1MEDIUM, FONT1REGULAR } from '../../constants'
import AppContext from '../../store/Context'
import BouncyCheckbox from 'react-native-bouncy-checkbox'

const images = [shirtIcon, coatIcon, dressIcon, trousersIcon, tieIcon]
function WashFold ({ navigation, route }) {
  const orderData = route?.params?.orderData
  // Context
  const context = useContext(AppContext)
  const { user, items } = context
  const [state, setState] = useState({
    priority: false,
    loading: false,
    listModal: false,
    modalList: [],
    special_detergent: false,
    special_softener: false,
    intensive_clean: false,
    total_weight: '',
    showAll: false
  })

  const {
    priority,
    listModal,
    special_detergent,
    special_softener,
    intensive_clean,
    modalList,
    showAll,
    total_weight
  } = state

  console.warn('items',items);
  useEffect(() => {
    if (items?.length > 0) {
      handleChange('modalList', items)
      if (orderData) {
        const newList = []
        items?.forEach(element => {
          const matched = orderData?.items?.filter(
            e => e?.item?.id === element?.id
          )
          if (matched?.length > 0) {
            element.quantity = matched[0].quantity
          }
          newList.push(element)
        })
        handleChange('modalList', newList)
        handleChange('priority', orderData?.priority)
        handleChange('special_detergent', orderData?.special_detergent)
        handleChange('total_weight', orderData?.total_weight)
        handleChange('special_softener', orderData?.special_softener)
        handleChange('intensive_clean', orderData?.intensive_clean)
      }
    }
  }, [items, orderData])

  const addItems = index => {
    modalList[index].iron = modalList[index].iron ? false : true
    handleChange('modalList', modalList)
  }

  const addQuantity = (index, quantity) => {
    if (quantity === 1) {
      modalList[index].quantity =
        modalList[index].quantity > 0 ? modalList[index].quantity + 1 : 1
      handleChange('modalList', modalList)
    } else {
      modalList[index].quantity =
        modalList[index].quantity > 0 ? modalList[index].quantity - 1 : 0
      handleChange('modalList', modalList)
    }
  }

  const handleNext = () => {
    const list = []
    let totalQuantity = 0
    let totalPrice = 0
    let totalIron = 0
    modalList?.forEach(element => {
      if (element?.quantity > 0) {
        totalQuantity = Number(element.quantity) + totalQuantity
        totalIron = element.iron
          ? Number(element.quantity) + totalIron
          : totalIron
        totalPrice = Number(element.quantity) * total_weight + totalPrice
        list.push(element)
      }
    })
    if (list?.length > 0) {
      const body = {
        item: list,
        intensive_clean,
        special_detergent,
        special_softener,
        priority,
        totalQuantity,
        total_weight,
        totalPrice,
        totalIron,
        type: 'Wash and Fold'
      }
      navigation.navigate('ServicePrice', { body, id: orderData?.id })
    }
  }

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: 'center' }}
    >
      <View style={styles.mainBody}>
        <Header back width={'100%'} title={'Wash and Fold'} rightEmpty />
        <Text style={styles.description}>
          This service is priced by weight. Please add items for washing.
        </Text>

        <FlatList
          data={modalList}
          showsVerticalScrollIndicator={false}
          style={{
            marginTop: 20,
            width: '105%',
            paddingHorizontal: 5
          }}
          renderItem={({ item, index }) => {
            if (!showAll ? index < 5 : index >= 0) {
              return (
                <View key={index} style={styles.listCard}>
                  <View
                    style={[
                      styles.row,
                      { width: '100%', justifyContent: 'space-between' }
                    ]}
                  >
                    <View style={styles.row}>
                      <Image
                        source={{ uri: item?.image }}
                        style={{
                          marginRight: 10,
                          width: 30,
                          height: 50,
                          resizeMode: 'contain'
                        }}
                      />
                      <View>
                        <Text style={styles.name1}>{item?.name}</Text>
                        {/* <Text style={styles.price}>${item?.weight_price}</Text> */}
                      </View>
                    </View>
                    <View style={styles.row}>
                      <TouchableOpacity
                        style={styles.addMinus}
                        onPress={() => addQuantity(index, -1)}
                      >
                        <Text style={styles.minusText}>-</Text>
                      </TouchableOpacity>
                      <Text style={[styles.name, { marginHorizontal: 5 }]}>
                        {item?.quantity || 0}
                      </Text>
                      <TouchableOpacity
                        style={styles.addMinus}
                        onPress={() => addQuantity(index, 1)}
                      >
                        <Text style={styles.minusText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )
            }
          }}
        />
        {modalList.length > 5 && (
          <View style={styles.addmore}>
            <AppButton
              title={showAll ? 'Hide More' : 'Add More'}
              backgroundColor={'transparent'}
              color={COLORS.primary}
              outlined
              onPress={() => handleChange('showAll', !showAll)}
            />
          </View>
        )}
        <Text style={styles.chooseText}>Total Weight</Text>
        <AppInput
          placeholder={'Weight'}
          value={total_weight}
          keyboardType={'number-pad'}
          name={'total_weight'}
          onChange={handleChange}
        />

        <Text style={styles.chooseText}>Extra Services</Text>
        <Text style={[styles.street, { marginBottom: 20 }]}>
          (each selection will add extra cost)
        </Text>
        <View style={styles.card}>
          <View style={[styles.rowBetween, { marginTop: 10 }]}>
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
          {/* <AppInput
            placeholder={'Input detergent'}
            value={special_detergent}
            name={'special_detergent'}
            onChange={handleChange}
          /> */}
        </View>
        <View style={styles.card}>
          <View style={[styles.rowBetween, { marginTop: 10 }]}>
            <View style={styles.row}>
              <SvgXml xml={laundryDetergent} />
              <Text style={[styles.dryText, { marginLeft: 10 }]}>
                Use Special Clothes softening
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
                handleChange('special_softener', !special_softener)
              }
              unfillColor={COLORS.white}
              disableBuiltInState
              isChecked={special_softener}
            />
          </View>
        </View>
        <View style={[styles.card, { height: 50 }]}>
          <View style={[styles.rowBetween, { marginTop: 10 }]}>
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
        </View>
        <View style={styles.checkboxView}>
          <BouncyCheckbox
            iconStyle={{
              borderColor: COLORS.grey,
              borderRadius: 5,
              width: 20,
              height: 20
            }}
            fillColor={COLORS.primary}
            onPress={() => handleChange('priority', !priority)}
            unfillColor={COLORS.profileBackgroud}
            disableBuiltInState
            isChecked={priority}
          />
          <Text style={styles.checkLabel}>
            Priority(receive it the same day)
          </Text>
        </View>
        <View style={[styles.addmore, { marginTop: 0, marginBottom: 10 }]}>
          <AppButton
            title={'Ironing'}
            backgroundColor={'transparent'}
            color={COLORS.primary}
            outlined
            onPress={() => handleChange('listModal', true)}
          />
        </View>
        <View style={{ width: '90%', marginBottom: 20 }}>
          <AppButton
            title={'Next'}
            disabled={!total_weight || modalList.length === 0}
            onPress={handleNext}
          />
        </View>
      </View>
      <CustomModal
        visible={listModal}
        onClose={() => handleChange('listModal', false)}
      >
        <View
          style={{
            alignItems: 'center'
          }}
        >
          <View style={{ width: '90%', alignItems: 'center' }}>
            <View style={[styles.rowBetween, { alignItems: 'flex-start' }]}>
              <View>
                <Text
                  style={{
                    fontSize: hp(2.5),
                    fontFamily: FONT1REGULAR,
                    color: COLORS.darkBlack
                  }}
                >
                  Items
                </Text>
                <Text
                  style={{
                    fontSize: hp(1.8),
                    fontFamily: FONT1REGULAR,
                    color: COLORS.darkBlack
                  }}
                >
                  select items you want to be ironed
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
              data={modalList}
              showsVerticalScrollIndicator={false}
              style={{
                height: '68%',
                marginTop: 20,
                width: '100%',
                paddingHorizontal: 5
              }}
              renderItem={({ item, index }) => {
                return (
                  <View key={index} style={styles.modalListCard}>
                    <View style={styles.row}>
                      <Image
                        source={{ uri: item?.image }}
                        style={{
                          marginRight: 10,
                          width: 30,
                          height: 50,
                          resizeMode: 'contain'
                        }}
                      />
                      <Text style={styles.name}>{item?.name}</Text>
                    </View>
                    <BouncyCheckbox
                      iconStyle={{
                        borderColor: COLORS.grey,
                        borderRadius: 5,
                        width: 20,
                        height: 20
                      }}
                      fillColor={COLORS.primary}
                      onPress={() => addItems(index)}
                      unfillColor={COLORS.white}
                      disableBuiltInState
                      isChecked={item?.iron}
                    />
                  </View>
                )
              }}
            />
            <View style={{ width: '90%' }}>
              <AppButton
                title={'Save'}
                onPress={() => handleChange('listModal', false)}
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
  addMinus: {
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: 25
  },
  minusText: {
    fontFamily: FONT1BOLD,
    marginTop: -2,
    color: COLORS.primary,
    fontSize: 14
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rowBetween: {
    width: '100%',
    marginTop: 20,
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
  card: {
    width: '100%',
    height: 50,
    marginBottom: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    alignItems: 'center',
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
  modalListCard: {
    width: '98%',
    marginTop: 2,
    marginLeft: 2,
    height: 50,
    marginBottom: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  listCard: {
    width: '98%',
    marginTop: 2,
    marginLeft: 2,
    height: 80,
    marginBottom: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  checkLabel: {
    fontFamily: FONT1REGULAR,
    color: COLORS.grey,
    width: '90%',
    fontSize: hp(1.8)
  },
  name: {
    fontFamily: FONT1REGULAR,
    color: COLORS.darkBlack,
    fontSize: hp(2)
  },
  name1: {
    fontFamily: FONT1REGULAR,
    color: COLORS.darkBlack,
    fontSize: hp(2.3)
  },
  price: {
    fontFamily: FONT1REGULAR,
    color: COLORS.Attention,
    fontSize: hp(2)
  },
  dryText: {
    fontFamily: FONT1REGULAR,
    color: COLORS.darkBlack,
    fontSize: hp(2)
  },
  chooseText: {
    fontFamily: FONT1MEDIUM,
    width: '100%',
    marginTop: 20,
    color: COLORS.darkBlack,
    fontSize: hp(2.5)
  },
  street: {
    fontFamily: FONT1REGULAR,
    color: COLORS.darkBlack,
    width: '100%',
    marginTop: 5,
    fontSize: hp(1.8)
  },
  description: {
    fontFamily: FONT1REGULAR,
    color: COLORS.darkBlack,
    fontSize: hp(1.8),
    textAlign: 'center',
    width: '60%',
    marginTop: 5
  },
  mainBody: {
    width: '90%',
    marginTop: 20,
    alignItems: 'center'
  },
  addmore: {
    width: 200,
    marginTop: 20,
    alignItems: 'center'
  },
  checkboxView: {
    height: hp(7),
    flexDirection: 'row',
    alignItems: 'center'
  },
  hline: {
    width: '100%',
    height: 1,
    marginTop: 10,
    backgroundColor: COLORS.borderColor
  }
})

export default WashFold
