import * as React from "react"
import {
  Button,
  EventSubscription,
  NativeModules,
  NativeEventEmitter,
  StyleSheet,
  Text,
  View,
} from "react-native"
import Toast from "react-native-root-toast"
import axios from "axios"

import GeetestModule from "react-native-geetest-module"

type GeetestValidationData = {
  geetestChallenge: string
  geetestSeccode: string
  geetestValidate: string
}

const toastShow = (message: string): void => {
  Toast.show(message, {
    duration: Toast.durations.LONG,
    shadow: false,
    animation: true,
    hideOnPress: true,
    delay: 0,
    position: 50,
    opacity: 1,
    backgroundColor: "#FF2301",
  })
}

// const registerURL = "https://www.geetest.com/demo/gt/register-slide"
const registerURL = "http://10.0.2.2:3333/register"
// const validateURL = "https://www.geetest.com/demo/gt/validate-slide"

export default function App() {
  const [geetestValidationData, setGeetestValidationData] =
    React.useState<GeetestValidationData | null>(null)

  const onGeetestDialogResultListener = React.useRef<EventSubscription>()
  const onGeetestFailedListener = React.useRef<EventSubscription>()

  const queryRegisterCaptcha = async () => {
    const { data } = await axios.get(registerURL)

    const params = {
      success: data.success,
      challenge: data.challenge,
      gt: data.gt,
      new_captcha: data.new_captcha,
    }
    console.log(params)
    GeetestModule.handleRegisteredGeeTestCaptcha(JSON.stringify(params))
  }

  React.useEffect(() => {
    GeetestModule.setUp()

    const eventEmitter = new NativeEventEmitter(NativeModules.GeetestModule)

    onGeetestDialogResultListener.current = eventEmitter.addListener(
      "GT3-->onDialogResult-->",
      (event) => {
        const parsedDialogResult = JSON.parse(event.result)
        setGeetestValidationData({
          geetestChallenge: parsedDialogResult.geetest_challenge,
          geetestSeccode: parsedDialogResult.geetest_seccode,
          geetestValidate: parsedDialogResult.geetest_validate,
        })
      },
    )

    onGeetestFailedListener.current = eventEmitter.addListener(
      "GT3-->onFailed-->",
      (event) => {
        console.log("GT3-->onFailed->", event.error)
        toastShow(event.error)
      },
    )

    return () => {
      GeetestModule.tearDown()

      onGeetestDialogResultListener.current?.remove()
      onGeetestFailedListener.current?.remove()
    }
  }, [])

  return (
    <View style={styles.container}>
      <Button title={"Verify"} onPress={queryRegisterCaptcha} />
      <Text>
        GeetestChallenge: {geetestValidationData?.geetestChallenge ?? "none"}
      </Text>
      <Text>
        GeetestSeccode: {geetestValidationData?.geetestSeccode ?? "none"}
      </Text>
      <Text>
        GeetestValidate: {geetestValidationData?.geetestValidate ?? "none"}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#3050C4",
    marginHorizontal: "50rem",
    marginTop: "30rem",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
})
