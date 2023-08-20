import React, { Fragment } from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { SvgXml } from 'react-native-svg'
import Tab1Icon from '../../assets/svg/tabs/Home.svg'
import Tab1IconFill from '../../assets/svg/tabs/HomeFill.svg'
import Tab4Icon from '../../assets/svg/tabs/Settings.svg'
import Tab4IconFill from '../../assets/svg/tabs/SettingsFill.svg'
import Tab3Icon from '../../assets/svg/tabs/User.svg'
import Tab3IconFill from '../../assets/svg/tabs/User.svg'
import Tab2Icon from '../../assets/svg/tabs/Bookmark.svg'
import Tab2IconFill from '../../assets/svg/tabs/BookmarkFill.svg'
import { COLORS, FONT1REGULAR } from '../../constants'

function TabBar ({ state, descriptors, navigation }) {
  const focusedOptions = descriptors[state.routes[state.index]?.key].options

  if (focusedOptions.tabBarVisible === false) {
    return null
  }

  return (
    <Fragment>
      <View style={styles.container}>
        {state?.routes.length > 0 &&
          state?.routes?.map((route, index) => {
            if (route) {
              const { options } = descriptors[route?.key]
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.name

              const isFocused = state.index === index

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route?.key
                })

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name)
                }
              }

              const onLongPress = () => {
                navigation.emit({
                  type: 'tabLongPress',
                  target: route?.key
                })
              }

              const _getIcon = () => {
                switch (label) {
                  case 'Home':
                    return (
                      <View style={styles.inActiveTab}>
                        <SvgXml
                          xml={isFocused ? Tab1IconFill : Tab1Icon}
                          width={hp(3)}
                          height={hp(3)}
                        />
                      </View>
                    )
                  case 'Services':
                    return (
                      <View style={styles.inActiveTab}>
                        <SvgXml
                          xml={isFocused ? Tab2IconFill : Tab2Icon}
                          width={hp(3)}
                          height={hp(3)}
                        />
                      </View>
                    )
                  case 'Profile':
                    return (
                      <View style={styles.inActiveTab}>
                        <SvgXml
                          xml={isFocused ? Tab3IconFill : Tab3Icon}
                          width={hp(3)}
                          height={hp(3)}
                        />
                      </View>
                    )
                  default:
                    return (
                      <View style={styles.inActiveTab}>
                        <SvgXml
                          xml={isFocused ? Tab4IconFill : Tab4Icon}
                          width={hp(3)}
                          height={hp(3)}
                        />
                      </View>
                    )
                }
              }

              return (
                <TouchableOpacity
                  key={label}
                  accessibilityRole='button'
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  activeOpacity={0.75}
                  onLongPress={onLongPress}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {_getIcon()}
                  <Text
                    style={{
                      fontFamily: FONT1REGULAR,
                      fontSize: hp('1.5%'),
                      color: COLORS.white
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              )
            }
          })}
      </View>
    </Fragment>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: hp('10%'),
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    paddingBottom: hp('2%'),
    backgroundColor: COLORS.primary
  },
  inActiveTab: {
    alignItems: 'center',
    justifyContent: 'center',
    width: hp(7),
    height: hp('5%'),
    borderRadius: 20,
    borderTopWidth: 0,
    backgroundColor: 'transparent'
  }
})

export default TabBar
