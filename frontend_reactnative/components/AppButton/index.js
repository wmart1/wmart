import React from 'react'
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native'
import { COLORS, FONT1BOLD, FONT1REGULAR } from '../../constants'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import LinearGradient from 'react-native-linear-gradient'

export default function AppButton ({
  title,
  height,
  onPress,
  prefix,
  postfix,
  backgroundColor,
  disabled,
  loading,
  outlined,
  titleLight,
  color,
  borderColor
}) {
  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        styles.buttonContainer,
        {
          marginTop: hp('2%'),
          borderWidth: outlined ? 1 : 0,
          justifyContent: postfix ? 'space-between' : 'center',
          borderColor: borderColor || COLORS.primary,
          backgroundColor: backgroundColor ? backgroundColor : COLORS.primary,
          opacity: disabled ? 0.5 : 1,
          height: height ? height : hp(6)
        }
      ]}
      onPress={loading ? console.log('') : onPress}
    >
      <LinearGradient
        style={styles.buttonContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={
          backgroundColor
            ? [backgroundColor, backgroundColor]
            : ['rgba(86, 164, 255, 1)', 'rgba(30, 108, 198, 1)']
        }
      >
        {prefix && prefix}
        {loading ? (
          <ActivityIndicator color={color ? color : COLORS.white} />
        ) : (
          <Text
            style={[
              styles.title,
              {
                fontFamily: FONT1REGULAR,
                color: color ? color : outlined ? COLORS.primary : COLORS.white
              }
            ]}
          >
            {title}
          </Text>
        )}
        {postfix && postfix}
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    borderRadius: 8,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: { fontSize: hp(2.3) }
})
