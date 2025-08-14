package com.naigaonmarketapp

import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import androidx.core.view.WindowCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "NaigaonMarketApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Configure system UI for edge-to-edge experience with proper navigation bar
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      // For Android 11+ (API 30+)
      WindowCompat.setDecorFitsSystemWindows(window, false)
      window.navigationBarColor = resources.getColor(R.color.white, theme)
      window.statusBarColor = resources.getColor(R.color.white, theme)
      
      // Ensure light navigation bar icons
      window.decorView.systemUiVisibility = (
        View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
      )
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      // For Android 8+ (API 26+)
      window.navigationBarColor = resources.getColor(R.color.white, theme)
      window.statusBarColor = resources.getColor(R.color.white, theme)
      window.decorView.systemUiVisibility = (
        View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
      )
    } else {
      // For older versions
      window.statusBarColor = resources.getColor(R.color.white, theme)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
      }
    }
  }
}
