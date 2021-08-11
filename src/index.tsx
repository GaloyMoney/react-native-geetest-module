import { NativeModules } from "react-native"

type GeetestModuleType = {
  setUp(): void
  tearDown(): void
  handleRegisteredGeeTestCaptcha(params: string): void
}

const { GeetestModule } = NativeModules

export default GeetestModule as GeetestModuleType
