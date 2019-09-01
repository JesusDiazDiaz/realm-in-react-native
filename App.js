/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment} from 'react';
import {StyleSheet, ScrollView, StatusBar} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Create from './src/views/Create.js';

const App = () => {
  return (
    <Fragment>
      <StatusBar barStyle="default" backgroundColor="#2078BB" />
      <Create />
    </Fragment>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
});

export default App;
