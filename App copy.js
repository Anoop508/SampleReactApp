import React from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { B2CClient } from './b2cClient';
import { b2cConfig, b2cScopes as scopes } from './msalConfig'

const b2cClient = new B2CClient(b2cConfig);

export default function App() {
  const [authResult, setAuthResult] = useState(null);
  const [iosEphemeralSession, setIosEphemeralSession] = useState(false);
  const webviewParameters = {
    ios_prefersEphemeralWebBrowserSession: iosEphemeralSession,
  };

  useEffect(() => {
    async function init() {
      try {
        await b2cClient.init();
        const isSignedIn = await b2cClient.isSignedIn();
        if (isSignedIn) {
          setAuthResult(await b2cClient.acquireTokenSilent({ scopes }));
        }
      } catch (error) {
        console.error(error);
      }
    }
    init();
  }, []);

  const handleSignInPress = async () => {
    try {
      const res = await b2cClient.signIn({ scopes, webviewParameters });
      setAuthResult(res);
    } catch (error) {
      console.warn(error);
    }
  };

  const handleSignoutPress = async () => {
    try {
      await b2cClient.signOut();
      setAuthResult(null);
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttonContainer}>
        {authResult ? (
          <>
            <TouchableOpacity style={styles.button} onPress={handleSignoutPress}>
              <Text>Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSignInPress}>
            <Text>Sign In</Text>
          </TouchableOpacity>
        )}

        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.button, styles.switchButton]}
            onPress={() => setIosEphemeralSession(!iosEphemeralSession)}
          >
            <Text>Prefer ephemeral browser session (iOS only)</Text>
            <Switch value={iosEphemeralSession} onValueChange={setIosEphemeralSession} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={styles.scrollView}>
        <Text>Access Token:"{JSON.stringify(authResult?.accessToken)}"</Text>
        <Text>expiresOn:"{JSON.stringify(authResult?.expiresOn)}"</Text>
        <Text>idToken:"{JSON.stringify(authResult?.idToken)}"</Text>
        <Text>tenantId:"{JSON.stringify(authResult?.tenantId)}"</Text>
        <Text>Account:"{JSON.stringify(authResult?.account)}"</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '1%',
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: '1%',
    margin: '-0.5%',
  },
  button: {
    backgroundColor: 'aliceblue',
    borderWidth: 1,
    margin: '0.5%',
    padding: 8,
    width: '49%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ddd',
  },
  switchButton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 4,
    margin: '0.5%',
    width: '99%',
  },
  scrollView: {
    borderWidth: 1,
    padding: 1,
  },
});
