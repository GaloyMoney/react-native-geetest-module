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

const registerURL = "" // Your register endpoint
const validateURL = "" // Your validate endpoint

const getRegisterCaptcha = async () => {
  const { data } = await axios.get(registerURL)

  const params = {
    success: data.success,
    challenge: data.challenge,
    gt: data.gt,
    new_captcha: data.new_captcha,
  }

  GeetestModule.handleRegisteredGeeTestCaptcha(JSON.stringify(params))
}

export default function App() {
  const [geetestValidationData, setGeetestValidationData] =
    React.useState<GeetestValidationData | null>(null)
  const [isVerified, setIsVerified] = React.useState<boolean | null>(null)

  const onGeetestDialogResultListener = React.useRef<EventSubscription>()
  const onGeetestFailedListener = React.useRef<EventSubscription>()

  const postValidateCaptcha = async () => {
    if (geetestValidationData === null) return

    const postData = {
      geetest_challenge: geetestValidationData.geetestChallenge,
      geetest_validate: geetestValidationData.geetestValidate,
      geetest_seccode: geetestValidationData.geetestSeccode,
    }

    const { data } = await axios.post(validateURL, postData)

    if (data.result === "success") {
      setIsVerified(true)
    } else if (data.result === "fail") {
      setIsVerified(false)
    }
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

  const reset = () => {
    setGeetestValidationData(null)
    setIsVerified(null)
  }

  const getValidationContent = () => {
    if (geetestValidationData === null) {
      return <Button title={"Verify"} onPress={getRegisterCaptcha} />
    } else if (isVerified === null) {
      return <Button title="Validate" onPress={postValidateCaptcha} />
    }

    const validationMessage = isVerified
      ? "Validation succeeded!"
      : "Validation failed"
    return (
      <>
        <Text>{validationMessage}</Text>
        <Button title={"Reset"} onPress={reset} />
      </>
    )
  }

  return (
    <>
      <View style={styles.container}>{getValidationContent()}</View>
      <View style={styles.container}>
        <View style={styles.container}>
          <Text>
            GeetestChallenge:{" "}
            {geetestValidationData?.geetestChallenge ?? "none"}
          </Text>
          <Text>
            GeetestSeccode: {geetestValidationData?.geetestSeccode ?? "none"}
          </Text>
          <Text>
            GeetestValidate: {geetestValidationData?.geetestValidate ?? "none"}
          </Text>
        </View>
      </View>
    </>
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
