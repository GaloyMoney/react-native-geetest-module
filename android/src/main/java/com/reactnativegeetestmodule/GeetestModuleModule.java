package com.reactnativegeetestmodule;

import android.text.TextUtils;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;

import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.geetest.sdk.GT3ConfigBean;
import com.geetest.sdk.GT3ErrorBean;
import com.geetest.sdk.GT3GeetestUtils;
import com.geetest.sdk.GT3Listener;

import org.json.JSONObject;

import javax.annotation.Nullable;

@ReactModule(name = GeetestModuleModule.NAME)
public class GeetestModuleModule extends ReactContextBaseJavaModule {
    public static final String NAME = "GeetestModule";

    private GT3GeetestUtils gt3GeetestUtils;
    private GT3ConfigBean gt3ConfigBean;

    public GeetestModuleModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void setUp() {
        gt3GeetestUtils = new GT3GeetestUtils(getCurrentActivity());

        // Configure the bean file
        gt3ConfigBean = new GT3ConfigBean();
        // Set how captcha is presented，1：bind，2：unbind
        gt3ConfigBean.setPattern(1);
        // The default is false
        gt3ConfigBean.setCanceledOnTouchOutside(false);
        // Set language. Use system default language if null
        gt3ConfigBean.setLang(null);
        // Set the timeout for loading webview static files
        gt3ConfigBean.setTimeout(10000);
        // Set the timeout for webview request after user finishing the CAPTCHA verification. The default is 10,000
        gt3ConfigBean.setWebviewTimeout(10000);
        // Set callback listener
        gt3ConfigBean.setListener(new GT3Listener() {
            /**
             * CAPTCHA loading is completed
             * @param duration Loading duration and version info，in JSON format
             */
            @Override
            public void onDialogReady(String duration) {}

            /**
             * Verification result callback
             * @param code 1:success, 0:fail
             */
            @Override
            public void onReceiveCaptchaCode(int code) {}

            /**
             * api2 custom call
             * @param result
             */
            @Override
            public void onDialogResult(String result) {
                gt3GeetestUtils.dismissGeetestDialog();
                WritableMap params = Arguments.createMap();
                params.putString("result", result);
                sendEvent(getReactApplicationContext(), "GT3-->onDialogResult-->", params);
            }

            /**
             * Statistic info.
             * @param result
             */
            @Override
            public void onStatistics(String result) {}

            /**
             * Close the CAPTCHA
             * @param num 1 Click the close button to close the CAPTCHA, 2 Click anyplace on screen to close the CAPTCHA, 3 Click return button the close
             */
            @Override
            public void onClosed(int num) {}

            /**
             * Verfication succeeds
             * @param result
             */
            @Override
            public void onSuccess(String result) {}

            /**
             * Verification fails
             * @param errorBean Version info, error code & description, etc.
             */
            @Override
            public void onFailed(GT3ErrorBean errorBean) {
                WritableMap params = Arguments.createMap();
                params.putString("error", errorBean.toString());
                sendEvent(getReactApplicationContext(), "GT3-->onFailed-->", params);
            }

            /**
             * api1 custom call
             */
            @Override
            public void onButtonClick() {}
        });
        gt3GeetestUtils.init(gt3ConfigBean);
    }

    @ReactMethod
    public void tearDown() {
        getCurrentActivity().runOnUiThread(() -> {
            gt3GeetestUtils.destory();
            gt3GeetestUtils = null;
            gt3ConfigBean = null;
        });
    }

    @ReactMethod
    public void handleRegisteredGeeTestCaptcha(String params) {
        if (!TextUtils.isEmpty(params)) {
            try {
                JSONObject jsonObject = new JSONObject(params);
                getCurrentActivity().runOnUiThread(() -> {
                    gt3GeetestUtils.startCustomFlow();
                    gt3ConfigBean.setApi1Json(jsonObject);
                    gt3GeetestUtils.getGeetest();
                });
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }


    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @ReactMethod
    public void addListener(String eventName) {
        // Set up any upstream listeners or background tasks as necessary
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Remove upstream listeners, stop unnecessary background tasks
    }
}
