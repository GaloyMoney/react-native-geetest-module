#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <GT3Captcha/GT3Captcha.h>

@interface GeetestModule : RCTEventEmitter <RCTBridgeModule, GT3CaptchaManagerDelegate>

@property (nonatomic, strong) GT3CaptchaManager *manager;

@end
