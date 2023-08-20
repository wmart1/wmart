import React from 'react'
import { View, StyleSheet, Text, Image } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import logo from '../../assets/images/FullLogo.png'
import { AppButton } from '../../components'
import { COLORS, FONT1BOLD } from '../../constants'

class Splash extends React.Component {
  constructor (props) {
    super(props)

    this.state = {}
  }
  render = () => (
    <View style={styles.View_617_1877}>
      <Text style={styles.loadingText}>Welcome to</Text>
      <Image
        source={logo}
        style={{ width: '90%', resizeMode: 'contain', height: 300 }}
      />
      <View style={styles.buttonWidth}>
        <AppButton
          title={'Continue'}
          onPress={() => this.props.navigation.navigate('GettingStarted')}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  View_617_1877: {
    backgroundColor: COLORS.backgroud,
    width: wp('100%'),
    height: hp('100%'),
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    fontFamily: FONT1BOLD,
    fontSize: hp(3),
    color: COLORS.secondary,
    textAlign: 'center'
  },
  buttonWidth: { width: '70%', marginBottom: 20 }
})

export default Splash
