import React, { useContext, useEffect, useState } from "react"
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image
} from "react-native"
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen"
import { SvgXml } from "react-native-svg"
import closeIcon from "../../assets/svg/close.svg"
import { AppButton, CustomModal, Header } from "../../components"
import { COLORS, FONT1BOLD, FONT1MEDIUM, FONT1REGULAR } from "../../constants"
import AppContext from "../../store/Context"
import BouncyCheckbox from "react-native-bouncy-checkbox"

function DryCleaner({ navigation, route }) {
  const orderData = route?.params?.orderData

  // Context
  const context = useContext(AppContext)
  const { _getItems, items } = context
  const [state, setState] = useState({
    priority: false,
    loading: false,
    listModal: false,
    showAll: false,
    modalList: []
  })

  useEffect(() => {
    if (items?.length > 0) {
      console.warn("modalList", items)
      handleChange("modalList", items)
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
        handleChange("modalList", newList)
        handleChange("priority", orderData?.priority)
      }
    }
  }, [items, orderData])

  useEffect(() => {
    _getItems()
  }, [])

  const addItems = index => {
    modalList[index].isAdded = modalList[index].isAdded ? false : true
    handleChange("modalList", modalList)
  }

  const addQuantity = (index, quantity) => {
    if (quantity === 1) {
      modalList[index].quantity =
        modalList[index].quantity > 0 ? modalList[index].quantity + 1 : 1
      handleChange("modalList", modalList)
    } else {
      modalList[index].quantity =
        modalList[index].quantity > 0 ? modalList[index].quantity - 1 : 0
      handleChange("modalList", modalList)
    }
  }

  const handleNext = () => {
    const list = []
    let totalQuantity = 0
    let totalPrice = 0
    modalList?.forEach(element => {
      if (element?.quantity > 0) {
        totalQuantity = Number(element.quantity) + totalQuantity
        totalPrice =
          Number(element.quantity) * Number(element.unit_price) + totalPrice
        list.push(element)
      }
    })
    if (list?.length > 0) {
      const body = {
        item: list,
        priority,
        totalQuantity,
        totalPrice,
        type: "Dry Cleaning"
      }
      navigation.navigate("ServicePrice", { body, id: orderData?.id })
    }
  }

  const { loading, priority, listModal, showAll, modalList } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: "center" }}
    >
      <View style={styles.mainBody}>
        <Header back width={"100%"} title={"Dry Cleaning"} rightEmpty />
        <Text style={styles.description}>
          This service is priced piece by piece and will require special care.
        </Text>

        <FlatList
          data={modalList}
          showsVerticalScrollIndicator={false}
          style={{
            marginTop: 20,
            width: "100%",
            paddingHorizontal: 5
          }}
          renderItem={({ item, index }) => {
            if (!showAll ? index < 5 : index >= 0) {
              return (
                <View key={index} style={styles.listCard}>
                  <View
                    style={[
                      styles.row,
                      { width: "100%", justifyContent: "space-between" }
                    ]}
                  >
                    <View style={styles.row}>
                      <Image
                        source={{ uri: item?.image }}
                        style={{
                          marginRight: 10,
                          width: 30,
                          height: 50,
                          resizeMode: "contain"
                        }}
                      />
                      <View>
                        <Text style={styles.name1}>{item?.name}</Text>
                        <Text style={styles.price}>${item?.unit_price}</Text>
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
              title={showAll ? "Hide More" : "Add More"}
              backgroundColor={"transparent"}
              color={COLORS.primary}
              outlined
              onPress={() => handleChange("showAll", !showAll)}
            />
          </View>
        )}
        <View style={styles.checkboxView}>
          <BouncyCheckbox
            iconStyle={{
              borderColor: COLORS.grey,
              borderRadius: 5,
              width: 20,
              height: 20
            }}
            fillColor={COLORS.primary}
            onPress={() => handleChange("priority", !priority)}
            unfillColor={COLORS.profileBackgroud}
            disableBuiltInState
            isChecked={priority}
          />
          <Text style={styles.checkLabel}>
            Priority(receive it the same day)
          </Text>
        </View>
        <View style={{ width: "90%", marginBottom: 20 }}>
          <AppButton title={"Next"} onPress={handleNext} />
        </View>
      </View>
      <CustomModal
        visible={listModal}
        onClose={() => handleChange("listModal", false)}
      >
        <View
          style={{
            alignItems: "center"
          }}
        >
          <View style={{ width: "90%", alignItems: "center" }}>
            <View style={[styles.rowBetween, { alignItems: "flex-start" }]}>
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
                onPress={() => handleChange("listModal", false)}
              >
                <SvgXml xml={closeIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.hline} />
            <FlatList
              data={modalList}
              showsVerticalScrollIndicator={false}
              style={{
                height: "68%",
                marginTop: 20,
                width: "100%",
                paddingHorizontal: 5
              }}
              renderItem={({ item, index }) => {
                return (
                  <View key={index} style={styles.modalListCard}>
                    <View style={styles.row}>
                      <SvgXml
                        xml={item?.image}
                        width={30}
                        style={{ marginRight: 30 }}
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
                      isChecked={item?.isAdded}
                    />
                  </View>
                )
              }}
            />
            <View style={{ width: "90%" }}>
              <AppButton
                title={"Save"}
                onPress={() => handleChange("listModal", false)}
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
    width: wp("100%"),
    height: hp("100%")
  },
  addMinus: {
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    alignItems: "center"
  },
  rowBetween: {
    width: "100%",
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  header: {
    width: "100%",
    paddingLeft: "5%",
    paddingTop: hp(2),
    zIndex: 0
  },
  card: {
    width: "48%",
    height: 50,
    marginBottom: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    shadowColor: "rgb(17, 107, 255)",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7
  },
  modalListCard: {
    width: "98%",
    marginTop: 2,
    marginLeft: 2,
    height: 50,
    marginBottom: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    shadowColor: "rgb(17, 107, 255)",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7
  },
  listCard: {
    width: "98%",
    marginTop: 2,
    marginLeft: 2,
    height: 80,
    marginBottom: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    shadowColor: "rgb(17, 107, 255)",
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
    width: "90%",
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
    fontSize: hp(2.2)
  },
  chooseText: {
    fontFamily: FONT1MEDIUM,
    width: "100%",
    marginTop: 20,
    color: COLORS.darkBlack,
    fontSize: hp(2.5)
  },
  street: {
    fontFamily: FONT1REGULAR,
    color: COLORS.darkBlack,
    width: "100%",
    marginTop: 5,
    fontSize: hp(1.8)
  },
  description: {
    fontFamily: FONT1REGULAR,
    color: COLORS.darkBlack,
    fontSize: hp(1.8),
    textAlign: "center",
    width: "60%",
    marginTop: 5
  },
  mainBody: {
    width: "90%",
    marginTop: 20,
    alignItems: "center"
  },
  addmore: {
    width: 200,
    marginTop: 20,
    alignItems: "center"
  },
  checkboxView: {
    height: hp(7),
    marginLeft: 15,
    flexDirection: "row",
    alignItems: "center"
  },
  hline: {
    width: "100%",
    height: 1,
    marginTop: 10,
    backgroundColor: COLORS.borderColor
  }
})

export default DryCleaner
