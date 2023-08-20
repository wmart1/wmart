import React from 'react'
import { Platform, View } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import Modal from 'react-native-modal'
import { COLORS } from '../../constants'
import styles from './styles'

const CustomModal = ({ visible, height, onClose, children }) => {
  const content = () => {
    return (
      <View style={styles.screen}>
        <View style={[styles.screenContainer, { height: height || '80%' }]}>
          <View style={{ flex: 1, width: '100%' }}>{children}</View>
        </View>
      </View>
    )
  }

  const contentInTouchableWithoutFeedback = () => {
    return <TouchableWithoutFeedback>{content()}</TouchableWithoutFeedback>
  }

  return (
    <>
      {visible ? (
        <Modal
          isVisible={true}
          style={styles.modal}
          backdropOpacity={0.4}
          // swipeDirection={['down']}
          // onSwipeComplete={() => {
          //   onClose()
          // }}
        >
          {Platform.OS == 'android'
            ? contentInTouchableWithoutFeedback()
            : content()}
        </Modal>
      ) : null}
    </>
  )
}

export default CustomModal
