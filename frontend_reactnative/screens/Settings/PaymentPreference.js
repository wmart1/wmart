import AsyncStorage from "@react-native-async-storage/async-storage"
import React, { useContext, useState } from "react"
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList
} from "react-native"
import { Icon } from "react-native-elements"
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen"
import { SvgXml } from "react-native-svg"
import CreditCard from "../../assets/svg/CreditCard.svg"
import BouncyCheckbox from "react-native-bouncy-checkbox"
import notificationIcon from "../../assets/svg/notificaionBlack.svg"
import visa from "../../assets/svg/visa.svg"
import mastercard from "../../assets/svg/mastercard.svg"
import terms from "../../assets/svg/terms.svg"
import InfoCircle from "../../assets/svg/InfoCircle.svg"
import { AppButton, Header } from "../../components"
import { COLORS, FONT1BOLD, FONT1LIGHT, FONT1REGULAR } from "../../constants"
import AppContext from "../../store/Context"
import { deletePayMethod } from "../../api/payments"
import Toast from "react-native-simple-toast"

function PaymentPreference({ navigation }) {
  // Context
  const context = useContext(AppContext)
  const { paymentMethods, _getPaymentMethod } = context

  // State
  const [state, setState] = useState({
    loading: false,
    selectedID: ""
  })

  const { selectedID, loading } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  const _deletePayMethod = async () => {
    try {
      handleChange("loading", true)
      const token = await AsyncStorage.getItem("token")
      const payload = {
        payment_method: selectedID
      }
      await deletePayMethod(payload, token)
      handleChange("loading", false)
      _getPaymentMethod()
      Toast.show(`Card has been deleted!`)
      navigation.navigate("MainTabNav")
    } catch (error) {
      handleChange("loading", false)
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText}`)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header title={"Payment Preference"} back rightEmpty blueBG />
      </View>
      <View style={styles.mainBody}>
        <View style={{ height: "100%", width: "100%", alignItems: "center" }}>
          <FlatList
            data={paymentMethods?.data}
            style={{ width: "90%", height: "80%" }}
            renderItem={({ item, index }) => (
              <View
                key={index}
                style={styles.listView}
                // onPress={() => item?.route && navigation.navigate(item.route)}
              >
                <View style={styles.row}>
                  <View style={styles.cardBG}>
                    <SvgXml
                      xml={item?.card?.brand === "visa" ? visa : mastercard}
                      width={30}
                    />
                  </View>
                  <View>
                    <Text style={styles.brand}>{item?.card?.brand}</Text>
                    <Text style={styles.street}>
                      ****************{item?.card?.last4}
                    </Text>
                  </View>
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
                    handleChange(
                      "selectedID",
                      selectedID === item?.id ? "" : item?.id
                    )
                  }
                  unfillColor={COLORS.white}
                  disableBuiltInState
                  isChecked={selectedID === item?.id || item?.default}
                />
              </View>
            )}
          />
        </View>
      </View>
      <View style={{ width: "80%",  marginTop: 20 }}>
        <AppButton
          title={"Delete Card"}
          backgroundColor={COLORS.deleteButon}
          loading={loading}
          disabled={!selectedID}
          onPress={_deletePayMethod}
        />
        <AppButton
          onPress={() => navigation.navigate("AddCard")}
          title={"Add New Card"}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    width: "100%",
    height: "100%",
    alignItems: "center"
  },
  header: {
    backgroundColor: COLORS.primary,
    height: "25%",
    width: "100%",
    alignItems: "center",
    paddingTop: hp(2),
    zIndex: 0
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  name: {
    fontFamily: FONT1REGULAR,
    color: COLORS.white,
    fontSize: hp(3.2)
  },
  listView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 10,
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: COLORS.paymethodBorder
  },
  chooseText: {
    fontFamily: FONT1LIGHT,
    width: "90%",
    marginTop: 10,
    marginBottom: 30,
    color: COLORS.darkBlack,
    fontSize: hp(2.2)
  },
  street: {
    fontFamily: FONT1REGULAR,
    color: COLORS.grey,
    fontSize: hp(1.8),
    marginLeft: 10
  },
  brand: {
    fontFamily: FONT1REGULAR,
    color: COLORS.darkBlack,
    fontSize: hp(2),
    marginLeft: 10,
    textTransform: "capitalize"
  },
  logout: {
    fontFamily: FONT1REGULAR,
    color: COLORS.primary,
    fontSize: hp(2)
  },
  mainBody: {
    width: "100%",
    height: "57%",
    marginTop: -40,
    paddingTop: 40,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30
  },
  cardBG: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.paymethodBG,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  }
})

export default PaymentPreference
