import { NativeModules } from 'react-native';

type GeetestModuleType = {
  multiply(a: number, b: number): Promise<number>;
};

const { GeetestModule } = NativeModules;

export default GeetestModule as GeetestModuleType;
