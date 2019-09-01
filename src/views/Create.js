import React, {Component} from 'react';
import {
  Text,
  StyleSheet,
  View,
  Button,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import {Formik, ErrorMessage} from 'formik';
import Icon from 'react-native-vector-icons/Ionicons';
import * as yup from 'yup';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import DropdownAlert from 'react-native-dropdownalert';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';
import LoadingModal from '../components/LoadingModal';
import Field from '../components/Field';
import Realm from '../services/realm';

const {width, height} = Dimensions.get('window');

let schema = yup.object().shape({
  firstName: yup
    .string()
    .max(40)
    .required(),
  lastName: yup
    .string()
    .max(40)
    .required(),
  documentID: yup
    .string()
    .max(20)
    .required(),
  email: yup
    .string()
    .max(30)
    .email()
    .required(),
  phoneNumber: yup.number().required(),
});

export default class Create extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      realm: null,
      isVisibleSyncModal: false,
      pendingCount: 0,
      synchronizedCount: 0,
    };
  }

  _menu = null;

  setMenuRef = ref => {
    this._menu = ref;
  };

  hideMenu = () => {
    this._menu.hide();
  };

  showMenu = () => {
    this._menu.show();
  };

  restrictOnlyText = text => {
    return text.replace(/[`~0-9!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
  };

  restrictOnlyNumber = text => {
    return text.replace(/[`~a-zA-Z!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
  };

  save = async (
    {firstName, lastName, documentID, email, phoneNumber},
    {resetForm},
  ) => {
    const realm = await Realm;
    const lastPeople = realm.objects('People').sorted('id', true)[0];
    const highestId = lastPeople == null ? 0 : lastPeople.id;

    try {
      realm.write(() => {
        realm.create('People', {
          firstName,
          lastName,
          documentID,
          phoneNumber,
          email,
          createAt: new Date(),
          id: highestId == null ? 1 : highestId + 1,
        });
      });
      this.updatePendingCount();
      resetForm();
      this.dropDownAlertRef.alertWithType(
        'success',
        'Congratulations !!',
        'Saved information.',
      );
    } catch (error) {
      this.dropDownAlertRef.alertWithType('error', 'Error', error.message);
    }
  };

  sendData = async () => {
    const {isConnected} = await NetInfo.fetch();
    const {pendingCount} = this.state;
    const realm = await Realm;

    if (pendingCount <= 0) {
      this.dropDownAlertRef.alertWithType(
        'info',
        'Information !',
        'At the moment you have no data to synchronize',
      );
      return;
    }
    if (!isConnected) {
      this.dropDownAlertRef.alertWithType('info', 'Offline.');
      return;
    }
    try {
      let allPeople = realm
        .objects('People')
        .filtered('isSynchronized == false');
      let items = allPeople.map(people => ({
        firstName: people.firstName,
        lastName: people.lastName,
        documentID: people.documentID,
        phoneNumber: people.phoneNumber,
        email: people.email,
      }));
      this.setState({isVisibleSyncModal: true});

      try {
        // save data in your server
        await axios({
          method: 'post',
          url: 'http://example.com/save-data',
          data: items,
        });
        this.setPeopleSynchronized(allPeople);
        //this.clear();
        this.updatePendingCount();
        this.setState({isVisibleSyncModal: false});
        this.dropDownAlertRef.alertWithType(
          'success',
          'Congratulations !!',
          'Saved information.',
        );
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      this.dropDownAlertRef.alertWithType('error', 'Error', error.message);
    }
  };

  clear = async () => {
    try {
      const realm = await Realm;
      realm.write(() => {
        let allPeople = realm
          .objects('People')
          .filtered('isSynchronized == true');

        if (allPeople.length <= 0) {
          this.dropDownAlertRef.alertWithType(
            'info',
            'Information',
            'There are no records to delete.',
          );
          return;
        }
        realm.delete(allPeople);
        this.updatePendingCount();
      });
      this.dropDownAlertRef.alertWithType(
        'info',
        'Information',
        'All records that were synchronized were deleted.',
      );
    } catch (error) {
      this.dropDownAlertRef.alertWithType(
        'error',
        'Error',
        'Error deleting records.',
      );
    }
  };

  setPeopleSynchronized = async allPeople => {
    const realm = await Realm;
    realm.write(() => {
      for (const people of allPeople) {
        people.isSynchronized = true;
      }
    });
  };

  updatePendingCount = async () => {
    const realm = await Realm;
    const pendingCount = realm
      .objects('People')
      .filtered('isSynchronized == false').length;
    const synchronizedCount = realm
      .objects('People')
      .filtered('isSynchronized == true').length;
    this.setState({pendingCount, synchronizedCount});
  };

  componentDidMount() {
    this.updatePendingCount();
  }

  render() {
    const {
      loading,
      pendingCount,
      synchronizedCount,
      isVisibleSyncModal,
    } = this.state;

    return (
      <View style={styles.container}>
        <DropdownAlert ref={ref => (this.dropDownAlertRef = ref)} />
        <SafeAreaView>
          <KeyboardAwareScrollView
            resetScrollToCoords={{x: 0, y: 0}}
            scrollEnabled>
            <View style={styles.wrapper}>
              <View style={styles.content}>
                <Formik
                  initialValues={{
                    email: '',
                    firstName: '',
                    lastName: '',
                    documentID: '',
                    phoneNumber: '',
                  }}
                  validationSchema={schema}
                  onSubmit={this.save}>
                  {({
                    handleChange,
                    handleBlur,
                    setFieldTouched,
                    handleSubmit,
                    values,
                    resetForm,
                    setFieldValue,
                    touched,
                    errors,
                  }) => (
                    <React.Fragment>
                      <Field
                        onChangeText={firstName =>
                          setFieldValue(
                            'firstName',
                            this.restrictOnlyText(firstName),
                          )
                        }
                        maxLength={40}
                        onBlur={() => setFieldTouched('firstName')}
                        label="Nombres"
                        value={values.firstName}
                        hasError={errors.firstName && touched.firstName}
                      />
                      <Text style={styles.errorText}>
                        <ErrorMessage name="firstName" />
                      </Text>
                      <Field
                        onChangeText={lastName =>
                          setFieldValue(
                            'lastName',
                            this.restrictOnlyText(lastName),
                          )
                        }
                        maxLength={40}
                        onBlur={() => setFieldTouched('lastName')}
                        label="Apellidos"
                        value={values.lastName}
                        hasError={errors.lastName && touched.lastName}
                      />
                      <Text style={styles.errorText}>
                        <ErrorMessage name="lastName" />
                      </Text>
                      <Field
                        onChangeText={documentID =>
                          setFieldValue(
                            'documentID',
                            this.restrictOnlyNumber(documentID),
                          )
                        }
                        maxLength={20}
                        onBlur={() => setFieldTouched('documentID')}
                        label="Numero de documento"
                        value={values.documentID}
                        hasError={errors.documentID && touched.documentID}
                        keyboardType="numeric"
                      />
                      <Text style={styles.errorText}>
                        <ErrorMessage name="documentID" />
                      </Text>
                      <Field
                        onChangeText={phoneNumber =>
                          setFieldValue(
                            'phoneNumber',
                            this.restrictOnlyNumber(phoneNumber),
                          )
                        }
                        maxLength={20}
                        onBlur={() => setFieldTouched('phoneNumber')}
                        value={values.phoneNumber}
                        hasError={errors.phoneNumber && touched.phoneNumber}
                        keyboardType="numeric"
                        label="Telefono"
                      />
                      <Text style={styles.errorText}>
                        <ErrorMessage name="phoneNumber" />
                      </Text>
                      <Field
                        onChangeText={handleChange('email')}
                        onBlur={() => setFieldTouched('email')}
                        label="E-Mail"
                        keyboardType="email-address"
                        hasError={errors.email && touched.email}
                        value={values.email}
                        maxLength={30}
                      />
                      <Text style={styles.errorText}>
                        <ErrorMessage name="email" />
                      </Text>
                      <Button
                        disabled={loading}
                        onPress={() => handleSubmit()}
                        title="Guardar"
                        color="#ec008c"
                      />
                    </React.Fragment>
                  )}
                </Formik>
                <View style={styles.actions}>
                  <Menu
                    ref={this.setMenuRef}
                    style={styles.menu}
                    button={
                      <Icon.Button
                        name="md-settings"
                        color="#fff"
                        backgroundColor="transparent"
                        size={35}
                        onPress={this.showMenu}
                      />
                    }>
                    <MenuItem
                      onPress={() => {
                        this.hideMenu();
                        this.sendData();
                      }}>
                      Synchronize {pendingCount} records
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem
                      onPress={() => {
                        this.hideMenu();
                        this.clear();
                      }}>
                      Delete {synchronizedCount} records.
                    </MenuItem>
                  </Menu>
                  <Text style={styles.infoText}>
                    Pending syncs: {pendingCount}
                  </Text>
                </View>
                <LoadingModal
                  isVisible={isVisibleSyncModal}
                  setModalVisible={value =>
                    this.setState({isVisibleSyncModal: value})
                  }
                />
              </View>
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    height,
    backgroundColor: '#2078BB',
  },
  wrapper: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    width: width * 0.9,
    // maxWidth: 420,
    paddingBottom: 30,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  infoText: {
    paddingVertical: 20,
    color: '#fff',
    marginLeft: 20,
  },
  logo: {
    width: 140,
    height: 37,
    alignSelf: 'center',
    marginVertical: 20,
  },
  errorText: {
    color: '#fff',
    marginBottom: 10,
  },
  menu: {
    width: width * 0.9,
  },
});
