import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  View,
  Dimensions,
  StyleSheet,
  PermissionsAndroid,
  Text,
  Platform,
  TouchableOpacity
} from 'react-native'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps' // remove PROVIDER_GOOGLE import if not using Google Maps
import Geolocation from '@react-native-community/geolocation'
import { COLORS, FONT1REGULAR, mapStyle } from '../../constants'
import AppContext from '../../store/Context'
import { useFocusEffect } from '@react-navigation/native'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import locationIcon from '../../assets/svg/blueLocation.svg'
import homeOutline from '../../assets/svg/HomeOutline.svg'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { AppButton, Header } from '../../components'
import { SvgXml } from 'react-native-svg'
import Geocoder from 'react-native-geocoding'

Geocoder.init('AIzaSyAEmKGJ68eGUiasdk3A3Ws5PJ2VvB0wSPg')

const { width, height } = Dimensions.get('window')
const ASPECT_RATIO = width / height
let LATITUDE_DELTA = 0.0922
let LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

function PickupLocation ({ navigation }) {
  var mapRef = useRef(null)
  const [state, setState] = useState({
    loading: false,
    truckLocation: null,
    street: '',
    isFocus: false
  })

  // Context
  const context = useContext(AppContext)
  const { loading, truckLocation, street, isFocus } = state
  const { setMapLocationForAccount } = context

  useFocusEffect(
    useCallback(() => {
      requestGeolocationPermission()
    }, [])
  )

  useEffect(() => {
    requestGeolocationPermission()
  }, [])

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  const handleNext = () => {
    setMapLocationForAccount(truckLocation)
    navigation.goBack()
  }

  const handleSearch = (data, details) => {
    if (details?.geometry?.location) {
      Geocoder.from(
        details?.geometry?.location?.lat?.toFixed(6),
        details?.geometry?.location?.lng?.toFixed(6)
      )
        .then(async json => {
          var address_components = json.results[0].address_components
          let dState = ''
          let country = ''
          let city = ''
          let street_number = ''
          let route = ''
          let sublocality = ''
          if (address_components !== undefined) {
            const addrComp = address_components
            for (let i = 0; i < addrComp.length; ++i) {
              var typ = addrComp[i].types[0]
              if (typ === 'administrative_area_level_1') {
                dState = addrComp[i].long_name
              } else if (typ === 'locality') {
                city = addrComp[i].long_name
              } else if (typ === 'street_number') {
                street_number = addrComp[i].long_name
              } else if (typ === 'route') {
                route = addrComp[i].long_name
              } else if (typ === 'sublocality') {
                sublocality = addrComp[i].long_name
              } else if (typ === 'country') {
                country = addrComp[i].long_name
              } //store the country
            }
          }
          const region = {
            latitude: details?.geometry?.location.lat,
            longitude: details?.geometry?.location?.lng,
            city,
            street: route ? route + ' ' + sublocality : '',
            country,
            dState,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          }
          mapRef && mapRef?.current?.animateToRegion(region)
          handleChange('street', data.description)
          handleChange('truckLocation', region)
        })
        .catch(error => alert(error?.origin?.error_message))
    }
  }

  async function requestGeolocationPermission () {
    try {
      if (Platform.OS === 'ios') {
        getCurrentLocation()
      }
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Wash and Fold Geolocation Permission',
          message: 'Wash and Fold needs access to your current location.'
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation()
      } else {
        console.log('Geolocation permission denied')
      }
    } catch (err) {
      console.warn(err)
    }
  }

  const getCurrentLocation = async () => {
    // geolocation.requestAuthorization();
    Geolocation.getCurrentPosition(
      position => {
        var lat = parseFloat(position.coords.latitude)
        var long = parseFloat(position.coords.longitude)
        Geocoder.from(
          position.coords.latitude?.toFixed(6),
          position.coords.longitude?.toFixed(6)
        )
          .then(async json => {
            var address_components = json.results[0].address_components
            let dState = ''
            let country = ''
            let city = ''
            let street_number = ''
            let route = ''
            let sublocality = ''
            if (address_components !== undefined) {
              const addrComp = address_components
              for (let i = 0; i < addrComp.length; ++i) {
                var typ = addrComp[i].types[0]
                if (typ === 'administrative_area_level_1') {
                  dState = addrComp[i].long_name
                } else if (typ === 'locality') {
                  city = addrComp[i].long_name
                } else if (typ === 'street_number') {
                  street_number = addrComp[i].long_name
                } else if (typ === 'route') {
                  route = addrComp[i].long_name
                } else if (typ === 'sublocality') {
                  sublocality = addrComp[i].long_name
                } else if (typ === 'country') {
                  country = addrComp[i].long_name
                } //store the country
              }
            }
            const region = {
              latitude: lat,
              longitude: long,
              city,
              country,
              street: route ? route + ' ' + sublocality : '',
              dState,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA
            }
            handleChange('truckLocation', region)
            mapRef && mapRef?.current?.animateToRegion(region)
          })
          .catch(error => alert(error?.origin?.error_message))
      },
      error => console.log('Error', JSON.stringify(error)),
      {
        enableHighAccuracy: Platform.OS === 'ios' ? false : true,
        timeout: 20000,
        maximumAge: 1000
      }
    )
    Geolocation.watchPosition(position => {
      var lat = parseFloat(position.coords.latitude)
      var long = parseFloat(position.coords.longitude)
      const region = {
        latitude: lat,
        longitude: long,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
      setState(pre => ({ ...pre, initialRegion: region }))
      mapRef && mapRef?.current?.animateToRegion(region)
    })
  }

  const onMapPress = coordinates => {
    const location = {
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA
    }
    handleChange('truckLocation', location)
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      keyboardShouldPersistTaps={'handled'}
      contentContainerStyle={{ alignItems: 'center', height: '100%' }}
    >
      <View style={[styles.header, { height: isFocus ? '100%' : '35%' }]}>
        <Header
          back
          backColor={COLORS.white}
          title={'Enter Pick Up Location'}
          blueBG
          rightEmpty
        />
        <View
          style={{
            justifyContent: 'center',
            flexDirection: 'row',
            width: '94%',
            marginVertical: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: COLORS.inputBorder,
            backgroundColor: COLORS.profileBackgroud
          }}
        >
          <SvgXml
            xml={locationIcon}
            style={{ marginLeft: 10, marginTop: 15 }}
          />
          <GooglePlacesAutocomplete
            placeholder={'Search by city'}
            fetchDetails={true}
            onPress={(data, details) => {
              // 'details' is provided when fetchDetails = true
              console.log(data, details)
              handleSearch(data, details)
            }}
            textInputProps={{
              placeholderTextColor: COLORS.placeholder,
              value: street,
              onFocus: () => handleChange('isFocus', true),
              onBlur: () => handleChange('isFocus', false),
              onChangeText: text => handleChange('street', text)
            }}
            styles={{
              // container: styles.textInput,
              textInput: {
                // flex: 1,
                fontSize: hp(1.8),
                backgroundColor: 'transparent',
                // width: '85%',
                height: '100%',
                color: COLORS.darkGrey,
                fontFamily: FONT1REGULAR
              },
              poweredContainer: { backgroundColor: COLORS.white },
              row: { backgroundColor: COLORS.white }
            }}
            query={{
              key: 'AIzaSyAEmKGJ68eGUiasdk3A3Ws5PJ2VvB0wSPg',
              language: 'en'
            }}
            GooglePlacesDetailsQuery={{
              fields: 'geometry'
            }}
            filterReverseGeocodingByTypes={[
              'locality',
              'administrative_area_level_3'
            ]}
            keyboardShouldPersistTaps={'handled'}
            listViewDisplayed={false}
            renderRow={data => (
              <View style={{ width: '100%' }}>
                <Text style={{ color: COLORS.black }}>{data.description}</Text>
              </View>
            )}
            debounce={200}
            currentLocation={false}
            currentLocationLabel='Current location'
            nearbyPlacesAPI='GooglePlacesSearch'
          />
        </View>
        <TouchableOpacity
          style={styles.homeOutline}
          onPress={getCurrentLocation}
        >
          <SvgXml xml={homeOutline} />
          <Text style={styles.homeText}>Home Address</Text>
        </TouchableOpacity>
      </View>
      {!isFocus && (
        <View style={styles.mainBody}>
          <MapView
            provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={styles.map}
            customMapStyle={mapStyle}
            initialRegion={truckLocation}
            onPress={props => onMapPress(props.nativeEvent.coordinate)}
            onRegionChange={() => console.log('')}
            ref={mapRef}
          >
            {truckLocation && (
              <Marker
                title={'My Location'}
                style={{ alignItems: 'center' }}
                // onPress={() => handleClickFood(truck)}
                coordinate={{
                  latitude: truckLocation?.latitude,
                  longitude: truckLocation?.longitude
                }}
              />
            )}
          </MapView>
        </View>
      )}
      <View style={{ bottom: 20, position: 'absolute', width: '80%' }}>
        <AppButton
          title={'Next'}
          disabled={!truckLocation}
          onPress={handleNext}
        />
      </View>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%'
  },
  mainBody: {
    height: '72%',
    width: '100%',
    marginTop: -40,
    // zIndex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    borderTopLeftRadius: 30
  },
  map: {
    height: '100%',
    width: '100%',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30
  },
  header: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingLeft: '5%',
    paddingTop: hp(2)
  },
  homeOutline: {
    width: '50%',
    marginTop: 10,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  homeText: {
    fontFamily: FONT1REGULAR,
    color: COLORS.white,
    fontSize: hp(2),
    marginLeft: 10
  }
})

export default PickupLocation
