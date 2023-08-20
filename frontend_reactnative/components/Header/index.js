import React, { useContext } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { COLORS, FONT1BOLD, FONT1REGULAR } from '../../constants'
import { useNavigation } from '@react-navigation/native'
import { Icon } from 'react-native-elements'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import notificationIcon from '../../assets/svg/notification.svg'
import bellIcon from '../../assets/svg/bell.svg'
import { SvgXml } from 'react-native-svg'
import AppContext from '../../store/Context'

export default function Header ({
  title,
  back,
  logo,
  blueBG,
  leftEmpty,
  rightEmpty,
  notification,
  width,
  rightSide,
  marginLeft,
  fontSize,
  fontFamily
}) {
  const navigation = useNavigation()
  // Context
  const context = useContext(AppContext)
  const { notifications } = context

  return (
    <View style={[styles.header, { width: width || '95%' }]}>
      {leftEmpty && <View style={{ width: 50 }} />}
      {back && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            name='arrowleft'
            type='antdesign'
            color={blueBG ? COLORS.white : COLORS.black}
          />
        </TouchableOpacity>
      )}
      {title && (
        <Text
          style={[
            styles.title,
            {
              fontFamily: fontFamily || FONT1REGULAR,
              fontSize: fontSize || hp(2.7),
              marginLeft: marginLeft || 0,
              color: blueBG ? COLORS.white : COLORS.black
            }
          ]}
        >
          {title}
        </Text>
      )}
      {rightEmpty && <View style={{ width: '5%' }} />}
      {rightSide && rightSide}
      {notification && (
        <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
          <SvgXml
            xml={
              notifications?.some(e => !e?.read) ? notificationIcon : bellIcon
            }
          />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  menuView: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 45
  },
  title: {
    color: COLORS.darkGrey,
    fontSize: hp(2.7),
    marginLeft: 20,
    fontFamily: FONT1REGULAR
  },
  backText: {
    color: COLORS.inputBorder,
    fontFamily: FONT1BOLD
  }
})
