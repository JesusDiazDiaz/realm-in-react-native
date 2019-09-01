import React, {Component} from 'react';
import {Text, StyleSheet, View, TextInput} from 'react-native';

export default class Field extends Component {
  render() {
    const {label, hasError, ...other} = this.props;
    return (
      <View>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[styles.field, hasError && styles.fieldHasError]}
          {...other}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingVertical: 7,
  },
  fieldHasError: {
    borderWidth: 3,
    borderColor: '#ef5350',
  },
  label: {
    color: '#fff',
    marginBottom: 10,
  },
});
