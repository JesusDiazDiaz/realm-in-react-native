import React, {Component} from 'react';
import {
  Text,
  StyleSheet,
  View,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

export default class LoadingModal extends Component {
  render() {
    const {isVisible} = this.props;
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        styles={styles.modal}>
        <View style={styles.wrapper}>
          <View style={styles.overlay} />
          <View style={styles.content}>
            <View>
              <Text style={styles.title}>Synchronizing information...</Text>
              <ActivityIndicator
                style={styles.spinner}
                size="large"
                color="#2078BB"
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: '#fff',
    width: width * 0.8,
    borderRadius: 10,
    paddingVertical: 30,
    paddingHorizontal: 10,
  },
  spinner: {
    marginTop: 10,
  },
  title: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
