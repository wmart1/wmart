import { StyleSheet } from 'react-native'
import { COLORS } from '../../constants'

export default StyleSheet.create({
  modal: {
    margin: 0,
    zIndex: 5
  },
  screen: {
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  screenContainer: {
    backgroundColor: COLORS.white,
    height: '80%',
    alignItems: 'center',
    width: '95%',
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    paddingTop: 5
  },
  screenTitle: {
    fontSize: 20.0,
    fontWeight: '500',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 20
  },
  titleContainer: {
    flex: 1
  },
  centerText: {
    fontSize: 13,
    color: COLORS.mediumGrey,
    marginHorizontal: '8%',
    textAlign: 'center',
    paddingVertical: 20
  },
  optionTouchableView: {
    backgroundColor: COLORS.screenBackground,
    borderRadius: 10,
    marginHorizontal: '5%',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 10
  },
  contentContainer: {
    backgroundColor: COLORS.white,
    paddingTop: 20,
    paddingBottom: 40
  },
  optionText: {
    color: COLORS.black,
    fontSize: 16
  },
  closeTouchableView: {
    marginRight: 20,
    backgroundColor: COLORS.black, //darkBlue
    height: 25,
    width: 25,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeImage: {
    width: 10,
    height: 10,
    tintColor: COLORS.white
  }
})
