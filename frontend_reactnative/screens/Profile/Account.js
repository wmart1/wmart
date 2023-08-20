import React, { useContext, useState, useCallback } from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView
} from "react-native"
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen"
import { Icon } from "react-native-elements"
import { COLORS, FONT1MEDIUM, FONT1REGULAR, states } from "../../constants"
import { AppButton, AppInput } from "../../components"
import { updateProfile } from "../../api/auth"
import Toast from "react-native-simple-toast"
import AppContext from "../../store/Context"
import AddPicture from "../../assets/images/AddPicture.png"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect } from "@react-navigation/native"
import ImagePicker from "react-native-image-crop-picker"
import { SvgXml } from "react-native-svg"
import AddButton from "../../assets/svg/AddButton.svg"
import profileIcon from "../../assets/svg/profile.svg"
import locationIcon from "../../assets/svg/location.svg"
import phoneIcon from "../../assets/svg/phone.svg"
import downIcon from "../../assets/svg/down.svg"
import flagIcon from "../../assets/svg/flag.svg"
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from "react-native-popup-menu"
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete"
import Geocoder from "react-native-geocoder"
import { onlySpaces, zipCode } from "../../utils/ValidateEmail"

function Account({ navigation }) {
  // Context
  const context = useContext(AppContext)
  const { user, mapLocationForAccount, setMapLocationForAccount } = context
  // State
  const [state, setState] = useState({
    email: "",
    name: user?.name,
    city: user?.customer?.city,
    street: user?.customer?.street,
    zip: user?.customer?.zip,
    phone: user?.customer?.phone || "",
    avatarSourceURL: user?.customer?.photo,
    clientState: user?.customer?.state,
    photo: null,
    location: user?.customer?.location,
    loading: false,
    invalidPhone: false,
    invalidZip: false
  })

  const {
    loading,
    name,
    phone,
    avatarSourceURL,
    clientState,
    photo,
    zip,
    street,
    city,
    location,
    invalidPhone,
    invalidZip
  } = state

  useFocusEffect(
    useCallback(() => {
      if (mapLocationForAccount) {
        console.warn("mapLocationForAccount", mapLocationForAccount)
        Geocoder.geocodePosition({
          lat: mapLocationForAccount?.latitude,
          lng: mapLocationForAccount?.longitude
        })
          .then(res => {
            console.warn("res", mapLocationForAccount?.street)
            const coords = `POINT (${mapLocationForAccount?.latitude} ${mapLocationForAccount?.longitude})`
            handleChange("zip", res?.length > 0 && res[0].postalCode)
            handleChange(
              "street",
              mapLocationForAccount?.street
                ? mapLocationForAccount?.street
                : res?.length > 0 && res[0].formattedAddress
            )
            handleChange("city", mapLocationForAccount?.city)
            handleChange("location", coords)
            handleChange("clientState", mapLocationForAccount?.dState)
            setMapLocationForAccount(null)
          })
          .catch(err => console.log(err))
      }
    }, [mapLocationForAccount])
  )

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  const _uploadImage = async type => {
    handleChange("uploading", true)
    let OpenImagePicker =
      type == "camera"
        ? ImagePicker.openCamera
        : type == ""
        ? ImagePicker.openPicker
        : ImagePicker.openPicker

    OpenImagePicker({
      width: 300,
      height: 300,
      cropping: true
    })
      .then(async response => {
        if (!response.path) {
          handleChange("uploading", false)
        } else {
          console.warn("response", response)
          const uri = response.path
          const uploadUri =
            Platform.OS === "ios" ? uri.replace("file://", "") : uri
          const photo = {
            uri: uploadUri,
            name: "userimage1.png",
            type: response.mime
          }
          handleChange("avatarSourceURL", uploadUri)
          handleChange("photo", photo)
          handleChange("uploading", false)
          Toast.show("Profile Add Successfully")
        }
      })
      .catch(err => {
        handleChange("showAlert", false)
        handleChange("uploading", false)
      })
  }

  const handleSearch = (data, details) => {
    if (details?.geometry?.location) {
      const coords = `POINT (${details.geometry.location.lat} ${details.geometry.location.lng})`
      handleChange("street", data.description)
      handleChange("location", coords)
    }
  }

  const handleProfile = async () => {
    try {
      handleChange("loading", true)
      const token = await AsyncStorage.getItem("token")
      const user_id = user?.id
      const formData = new FormData()
      if (photo) {
        formData.append("customer.photo", photo)
      }
      formData.append("name", name)
      formData.append("customer.phone", phone)
      formData.append("customer.city", city)
      formData.append("customer.zip", zip)
      formData.append("customer.state", clientState)
      formData.append("customer.street", street)
      formData.append("customer.location", location)
      const res = await updateProfile(formData, user_id, token)
      if (!user?.customer?.location) {
        navigation.navigate("AddCard")
      }
      handleChange("loading", false)
      await AsyncStorage.setItem("user", JSON.stringify(res?.data))
      context?.setUser(res?.data)
      Toast.show(`Your profile has been updated!`)
    } catch (error) {
      handleChange("loading", false)
      if (error.response?.data) {
        let message = ""
        for (const [key, value] of Object.entries(error.response?.data)) {
          message = message + ` ${JSON.stringify(value)} `
        }
        Toast.show(message)
      } else {
        Toast.show(error.message)
      }
      // const showWError = Object.values(error.response?.data)
      // if (showWError.length > 0) {
      //   Toast.show(`Error: ${JSON.stringify(showWError[0])}`)
      // } else {
      //   Toast.show(`Error: ${JSON.stringify(error)}`)
      // }
    }
  }

  const checkPhone = () => {
    if (phone.length > 5 && phone?.length < 15) {
      if (phone != "") {
        handleChange("invalidPhone", false)
      } else {
        handleChange("phone", "")
      }
    } else {
      handleChange("invalidPhone", true)
    }
  }

  const checkZip = () => {
    if (!zipCode(zip)) {
      Toast.show("Please enter valid zip code", Toast.LONG)
      handleChange("zip", "")
      return
    }
    if (zip.length > 3 && zip?.length < 10) {
      if (zip != "") {
        handleChange("invalidZip", false)
      } else {
        handleChange("zip", "")
      }
    } else {
      handleChange("invalidZip", true)
    }
  }

  const goBack = () => {
    navigation.goBack()
  }

  const checkSpace = key => {
    if (state[key] && onlySpaces(state[key])) {
      Toast.show("Space only not allowed", Toast.LONG)
      handleChange(key, "")
      return
    }
  }

  const logout = async () => {
    context?.setUser(null)
    await AsyncStorage.removeItem("token")
    await AsyncStorage.removeItem("user")
    navigation.navigate("AuthLoading")
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <View style={styles.top}>
        <View style={styles.header}>
          <View style={styles.backContainer}>
            <TouchableOpacity onPress={goBack}>
              <Icon name="arrow-back" type="material" />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout}>
              <Text style={styles.loginText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          onPress={_uploadImage}
          style={styles.businessProfileIcon}
        >
          <Image
            source={avatarSourceURL ? { uri: avatarSourceURL } : AddPicture}
            style={styles.profileIcon}
          />
          <SvgXml xml={AddButton} style={{ marginTop: -20 }} />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: FONT1MEDIUM,
            fontSize: hp(2.5),
            marginBottom: 20
          }}
        >
          Set Up Profile
        </Text>
        <View style={styles.textInputContainer}>
          {
            <AppInput
              placeholder={"Full Name"}
              prefix={<SvgXml xml={profileIcon} />}
              name={"name"}
              onBlur={() => checkSpace("name")}
              value={name}
              backgroundColor={"transparent"}
              prefixBGTransparent
              onChange={handleChange}
            />
          }
        </View>
        <View style={styles.textInputContainer}>
          <AppInput
            placeholder={"Mobile Number"}
            backgroundColor={"transparent"}
            prefix={<SvgXml xml={phoneIcon} />}
            name={"phone"}
            value={phone}
            keyboardType={"phone-pad"}
            onBlur={checkPhone}
            prefixBGTransparent
            onChange={handleChange}
          />
        </View>
        {invalidPhone ? (
          <View style={{ width: "90%", marginBottom: 10 }}>
            <Text style={styles.errorText}>Invalid Phone Number</Text>
          </View>
        ) : null}
        <View
          style={{
            justifyContent: "center",
            flexDirection: "row",
            width: "90%",
            marginVertical: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: COLORS.inputBorder,
            backgroundColor: COLORS.profileBackgroud
          }}
        >
          <SvgXml
            xml={locationIcon}
            width={35}
            style={{ marginLeft: 10, marginTop: hp(1) }}
          />
          <GooglePlacesAutocomplete
            placeholder={street || "Street Adress"}
            fetchDetails={true}
            onPress={(data, details) => {
              // 'details' is provided when fetchDetails = true
              console.log(data, details)
              handleSearch(data, details)
            }}
            textInputProps={{
              defaultValue: street,
              placeholderTextColor: COLORS.placeholder
              // value: street,
              // onChangeText: text => handleChange('street', text)
            }}
            styles={{
              // container: styles.textInput,
              textInput: {
                // flex: 1,
                fontSize: hp(1.8),
                backgroundColor: "transparent",
                width: "80%",
                height: "100%",
                color: COLORS.darkGrey,
                fontFamily: FONT1REGULAR
              },
              poweredContainer: { backgroundColor: COLORS.white },
              row: { backgroundColor: COLORS.white }
            }}
            query={{
              key: "AIzaSyAEmKGJ68eGUiasdk3A3Ws5PJ2VvB0wSPg",
              language: "en"
            }}
            GooglePlacesDetailsQuery={{
              fields: "geometry"
            }}
            filterReverseGeocodingByTypes={[
              "locality",
              "administrative_area_level_3"
            ]}
            keyboardShouldPersistTaps={"handled"}
            listViewDisplayed={false}
            renderRow={data => (
              <View style={{ width: "100%" }}>
                <Text style={{ color: COLORS.black }}>{data.description}</Text>
              </View>
            )}
            debounce={200}
            currentLocation={false}
            currentLocationLabel="Current location"
            nearbyPlacesAPI="GooglePlacesSearch"
          />
        </View>
        {/* <View style={styles.rowBetween}>
          <View style={[styles.textInputContainer, { width: "65%" }]}>
            <AppInput
              placeholder={"City"}
              backgroundColor={"transparent"}
              name={"city"}
              onBlur={() => checkSpace("city")}
              value={city}
              prefixBGTransparent
              onChange={handleChange}
            />
          </View>
          <View style={[styles.textInputContainer, { width: "30%" }]}>
            <AppInput
              placeholder={"ZIP"}
              backgroundColor={"transparent"}
              name={"zip"}
              onBlur={checkZip}
              value={zip}
              prefixBGTransparent
              onChange={handleChange}
            />
          </View>
        </View>
        {invalidZip ? (
          <View style={{ width: "90%", marginBottom: 10 }}>
            <Text style={styles.errorText}>Invalid Zip Code</Text>
          </View>
        ) : null} */}
        {/* <View style={styles.textInputContainer}>
          <View
            style={[
              styles.billingTypeBox,
              {
                marginLeft: 0,
                marginTop: 12
              }
            ]}
          >
            <Menu
              rendererProps={{
                preferredPlacement: 'top'
              }}
              style={{ width: '100%' }}
            >
              <MenuTrigger>
                <View style={[styles.menuTrigger]}>
                  <View style={styles.row}>
                    <SvgXml xml={flagIcon} />
                    <Text style={styles.menuTriggerText}>
                      {clientState || 'State'}
                    </Text>
                  </View>
                  <SvgXml xml={downIcon} />
                </View>
              </MenuTrigger>
              <MenuOptions
                optionsContainerStyle={{
                  width: '50%'
                }}
              >
                <ScrollView style={{ height: 200 }}>
                  {states.map((el, index) => (
                    <MenuOption
                      key={index}
                      onSelect={() => {
                        handleChange('clientState', el.name)
                      }}
                    >
                      <Text>{el.name}</Text>
                    </MenuOption>
                  ))}
                </ScrollView>
              </MenuOptions>
            </Menu>
          </View>
        </View> */}
        {/* <View style={[styles.textInputContainer]}>
          <AppInput
            placeholder={"State"}
            backgroundColor={"transparent"}
            name={"clientState"}
            onBlur={() => checkSpace("clientState")}
            value={clientState}
            prefixBGTransparent
            onChange={handleChange}
          />
        </View> */}
        <Text>OR</Text>
        <View style={{ width: "50%" }}>
          <AppButton
            title={"Select on Map"}
            outlined
            backgroundColor={"transparent"}
            borderColor={COLORS.primary}
            onPress={() => navigation.navigate("PickupLocation")}
          />
        </View>
      </View>
      <View style={styles.buttonWidth}>
        <AppButton
          title={"Save"}
          loading={loading}
          disabled={
            !name ||
            !phone ||
            !street ||
            // !city ||
            // !zip ||
            // !clientState ||
            invalidPhone ||
            // !avatarSourceURL ||
            !location
          }
          onPress={handleProfile}
        />
      </View>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: wp("100%"),
    backgroundColor: COLORS.profileBackgroud,
    height: "100%"
  },
  top: {
    width: "100%",
    alignItems: "center",
    marginTop: 20
  },
  backContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: 10
  },
  header: {
    flexDirection: "row",
    marginBottom: 10,
    width: "90%",
    alignItems: "center"
  },
  buttonWidth: { width: "90%", marginBottom: 20 },
  textInputContainer: { marginBottom: hp("2%"), width: "90%" },
  loginText: {
    color: COLORS.primary,
    fontSize: hp(2),
    fontFamily: FONT1REGULAR
  },
  profileIcon: {
    width: hp(10),
    height: hp(10),
    borderRadius: 100,
    resizeMode: "cover"
  },
  businessProfileIcon: {
    width: hp(10),
    alignItems: "center",
    height: hp(10),
    resizeMode: "cover",
    marginBottom: 40
  },
  errorText: {
    color: COLORS.alertButon,
    fontFamily: FONT1REGULAR,
    fontSize: hp(1.8)
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%"
  },
  placeholder: {
    fontFamily: FONT1REGULAR,
    color: COLORS.black,
    fontSize: hp(2)
  },
  billingTypeBox: {
    width: "100%",
    height: hp(6),
    borderRadius: 8,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center"
  },
  menuTrigger: {
    width: "95%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  menuTriggerText: {
    fontFamily: FONT1REGULAR,
    color: COLORS.placeholder,
    fontSize: hp(2.2),
    marginHorizontal: 10
  }
})

export default Account
