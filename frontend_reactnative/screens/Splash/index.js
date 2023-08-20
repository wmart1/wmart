import React from 'react'
import { Image, StyleSheet } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import logo from '../../assets/images/splash.png'

class Splash extends React.Component {
  constructor (props) {
    super(props)

    this.state = {}
  }

  componentDidMount () {
    setTimeout(() => {
      this.props.navigation.navigate('AuthLoading')
    }, 3000)
  }
  render = () => <Image source={logo} style={styles.container} />
}

const styles = StyleSheet.create({
  container: {
    width: wp('100%'),
    height: hp('100%'),
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default Splash
