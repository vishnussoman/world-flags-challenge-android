import {
  AdMob,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
  AdOptions,
  RewardAdOptions,
  AdMobRewardItem,
  AdmobConsentStatus,
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

/**
 * SINGLE-LINE PRODUCTION TOGGLE
 * - false: Uses Google's official Test Ad Unit IDs (safe for development & testing)
 * - true:  Uses your live AdMob Ad Unit IDs below for Google Play Store release
 */
export const IS_PRODUCTION_ADS = false;

/**
 * Show a full-screen interstitial ad after every N completed quiz rounds.
 * Set to 1 for every round, or 2 for every second round (recommended balance).
 */
export const INTERSTITIAL_FREQUENCY = 2;

const TEST_AD_IDS = {
  bannerAdId: 'ca-app-pub-3940256099942544/6300978111',       // Official Google Test Banner
  interstitialAdId: 'ca-app-pub-3940256099942544/1033173712', // Official Google Test Interstitial
  rewardedAdId: 'ca-app-pub-3940256099942544/5224354917',     // Official Google Test Rewarded Video
};

// Paste your live Android Ad Unit IDs from https://admob.google.com before setting IS_PRODUCTION_ADS = true
const LIVE_AD_IDS = {
  bannerAdId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  interstitialAdId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  rewardedAdId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
};

export const AD_CONFIG = IS_PRODUCTION_ADS ? LIVE_AD_IDS : TEST_AD_IDS;

let isInitialized = false;
let isConsentChecked = false;
let isBannerShown = false;
let isInterstitialReady = false;
let isPreloadingInterstitial = false;
let isRewardedReady = false;
let isPreloadingRewarded = false;
let completedRoundsCount = 0;

export const adManager = {
  /**
   * Requests Google UMP / GDPR consent when required (EEA/UK compliance),
   * initializes the Google Mobile Ads SDK, and preloads ads silently.
   */
  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      if (!isConsentChecked) {
        isConsentChecked = true;
        try {
          const consentInfo = await AdMob.requestConsentInfo();
          if (
            consentInfo.isConsentFormAvailable &&
            consentInfo.status === AdmobConsentStatus.REQUIRED
          ) {
            await AdMob.showConsentForm();
          }
        } catch {
          // Continue safely if UMP form is not yet configured in AdMob console
        }
      }

      if (!isInitialized) {
        await AdMob.initialize({
          initializeForTesting: !IS_PRODUCTION_ADS,
        });
        isInitialized = true;
      }

      // Preload in background without blocking UI
      void this.preloadInterstitial();
      void this.preloadRewardedAd();
    } catch {
      // Graceful fallback if running outside native bridge
    }
  },

  /**
   * Opens Google's UMP Privacy Options form (for Settings -> Ad Privacy Preferences)
   */
  async openPrivacyOptions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      await AdMob.requestConsentInfo();
      await AdMob.showPrivacyOptionsForm();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Preloads an interstitial ad silently in the background
   */
  async preloadInterstitial(): Promise<void> {
    if (!Capacitor.isNativePlatform() || isInterstitialReady || isPreloadingInterstitial) {
      return;
    }
    isPreloadingInterstitial = true;
    try {
      const options: AdOptions = {
        adId: AD_CONFIG.interstitialAdId,
        isTesting: !IS_PRODUCTION_ADS,
      };
      await AdMob.prepareInterstitial(options);
      isInterstitialReady = true;
    } catch {
      isInterstitialReady = false;
    } finally {
      isPreloadingInterstitial = false;
    }
  },

  /**
   * Preloads a rewarded video ad silently in the background
   */
  async preloadRewardedAd(): Promise<void> {
    if (!Capacitor.isNativePlatform() || isRewardedReady || isPreloadingRewarded) {
      return;
    }
    isPreloadingRewarded = true;
    try {
      const options: RewardAdOptions = {
        adId: AD_CONFIG.rewardedAdId,
        isTesting: !IS_PRODUCTION_ADS,
      };
      await AdMob.prepareRewardVideoAd(options);
      isRewardedReady = true;
    } catch {
      isRewardedReady = false;
    } finally {
      isPreloadingRewarded = false;
    }
  },

  /**
   * Shows an adaptive bottom banner ad (used on Title Screen & Flag Atlas)
   */
  async showBanner(): Promise<void> {
    if (!Capacitor.isNativePlatform() || isBannerShown) return;

    try {
      await this.initialize();
      const options: BannerAdOptions = {
        adId: AD_CONFIG.bannerAdId,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: !IS_PRODUCTION_ADS,
      };
      await AdMob.showBanner(options);
      isBannerShown = true;
    } catch {
      isBannerShown = false;
    }
  },

  /**
   * Hides the bottom banner ad (used during active gameplay & modals)
   */
  async hideBanner(): Promise<void> {
    if (!Capacitor.isNativePlatform() || !isBannerShown) return;

    try {
      await AdMob.hideBanner();
    } catch {
      // Ignore
    } finally {
      isBannerShown = false;
    }
  },

  /**
   * Shows a preloaded Interstitial Ad every N completed rounds (default: INTERSTITIAL_FREQUENCY).
   * Only shows immediately if already preloaded to prevent a 2-3s white loading screen.
   */
  async recordRoundAndShowInterstitial(frequency: number = INTERSTITIAL_FREQUENCY): Promise<void> {
    completedRoundsCount++;

    if (completedRoundsCount % frequency !== 0) {
      void this.preloadInterstitial();
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      return;
    }

    if (!isInterstitialReady) {
      // Ad not ready yet; skip showing now so user isn't stuck on a blank screen, and preload for next time
      void this.preloadInterstitial();
      return;
    }

    try {
      isInterstitialReady = false;
      await AdMob.showInterstitial();
    } catch {
      // Graceful catch so user flow is never blocked
    } finally {
      // Preload next interstitial for future rounds
      void this.preloadInterstitial();
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
      if (!isRewardedReady) {
        const options: RewardAdOptions = {
          adId: AD_CONFIG.rewardedAdId,
          isTesting: !IS_PRODUCTION_ADS,
        };
        await AdMob.prepareRewardVideoAd(options);
      }

      isRewardedReady = false;
      const rewardItem: AdMobRewardItem = await AdMob.showRewardVideoAd();

      // Preload next rewarded ad
      void this.preloadRewardedAd();

      return rewardItem && rewardItem.amount > 0;
    } catch {
      isRewardedReady = false;
      void this.preloadRewardedAd();
      return false;
    }
  },
};
