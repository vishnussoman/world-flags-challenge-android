import {
  AdMob,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
  AdOptions,
  RewardAdOptions,
  AdMobRewardItem,
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

/**
 * AD CONFIGURATION
 * These default IDs are Google's official, guaranteed test ad units.
 * Before releasing to production on the Google Play Store:
 * Replace these test IDs with your live Ad Unit IDs from your Google AdMob Dashboard.
 */
export const AD_CONFIG = {
  // Replace with your real AdMob Ad Unit IDs from https://admob.google.com
  bannerAdId: 'ca-app-pub-3940256099942544/6300978111',       // Official Google Test Banner
  interstitialAdId: 'ca-app-pub-3940256099942544/1033173712', // Official Google Test Interstitial
  rewardedAdId: 'ca-app-pub-3940256099942544/5224354917',     // Official Google Test Rewarded Video
};

let isInitialized = false;
let completedRoundsCount = 0;

export const adManager = {
  /**
   * Initializes the Google Mobile Ads (AdMob) SDK on native Android
   */
  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      if (!isInitialized) {
        await AdMob.initialize({
          initializeForTesting: true,
        });
        isInitialized = true;
      }
    } catch {
      // Graceful fallback if running outside native bridge
    }
  },

  /**
   * Shows a standard bottom banner ad
   */
  async showBanner(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await this.initialize();
      const options: BannerAdOptions = {
        adId: AD_CONFIG.bannerAdId,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: true,
      };
      await AdMob.showBanner(options);
    } catch {
      // Ignore banner load error gracefully
    }
  },

  /**
   * Hides the bottom banner ad
   */
  async hideBanner(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await AdMob.hideBanner();
    } catch {
      // Ignore
    }
  },

  /**
   * Shows an Interstitial Ad every few rounds (default: every 3 completed rounds)
   */
  async recordRoundAndShowInterstitial(frequency: number = 3): Promise<void> {
    completedRoundsCount++;

    if (completedRoundsCount % frequency !== 0) {
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await this.initialize();
      const options: AdOptions = {
        adId: AD_CONFIG.interstitialAdId,
        isTesting: true,
      };
      await AdMob.prepareInterstitial(options);
      await AdMob.showInterstitial();
    } catch {
      // Graceful catch so user flow is never blocked
    }
  },

  /**
   * Shows a Rewarded Video Ad (e.g. for +1 Extra Life in Survival Mode)
   * Resolves true if the user watched the video and earned the reward
   */
  async showRewardedAd(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      // In web/desktop preview mode, simulate successful ad watch after brief delay
      return new Promise((resolve) => setTimeout(() => resolve(true), 1200));
    }

    try {
      await this.initialize();
      const options: RewardAdOptions = {
        adId: AD_CONFIG.rewardedAdId,
        isTesting: true,
      };

      await AdMob.prepareRewardVideoAd(options);
      const rewardItem: AdMobRewardItem = await AdMob.showRewardVideoAd();

      return rewardItem && rewardItem.amount > 0;
    } catch {
      return false;
    }
  },
};
