import { NativeModules, TurboModuleRegistry } from 'react-native';

type RewardKind = 'shield' | 'coach';

export type RewardResult = {
  earned: boolean;
  preview: boolean;
  message: string;
};

type AdsApi = {
  mobileAds: () => { initialize: () => Promise<unknown> };
  RewardedAd: {
    createForAdRequest: (unitId: string, options?: object) => AdHandle;
  };
  RewardedInterstitialAd: {
    createForAdRequest: (unitId: string, options?: object) => AdHandle;
  };
  RewardedAdEventType: { LOADED: string; EARNED_REWARD: string };
  AdEventType: { CLOSED: string; ERROR: string };
  TestIds: { REWARDED: string; REWARDED_INTERSTITIAL: string };
};

type AdHandle = {
  addAdEventListener: (type: string, listener: (payload?: { amount?: number }) => void) => () => void;
  load: () => void;
  show: () => void;
};

const KEYWORDS = ['fitness', 'strength', 'gym', 'workout'];

function nativeAdsPresent(): boolean {
  return Boolean(
    NativeModules.RNGoogleMobileAdsModule || TurboModuleRegistry.get?.('RNGoogleMobileAdsModule'),
  );
}

function loadAds(): AdsApi | null {
  if (!nativeAdsPresent()) return null;
  try {
    return require('react-native-google-mobile-ads') as AdsApi;
  } catch {
    return null;
  }
}

function showUnit(kind: RewardKind): Promise<RewardResult> {
  const ads = loadAds();
  if (!ads) {
    return Promise.resolve({
      earned: false,
      preview: true,
      message: 'Ad network is not in this build. Use a development build for live rewarded ads, or take the preview reward.',
    });
  }

  return new Promise((resolve) => {
    const unit =
      kind === 'shield'
        ? ads.RewardedAd.createForAdRequest(ads.TestIds.REWARDED, { keywords: KEYWORDS })
        : ads.RewardedInterstitialAd.createForAdRequest(ads.TestIds.REWARDED_INTERSTITIAL, { keywords: KEYWORDS });

    let earned = false;
    let settled = false;
    const finish = (result: RewardResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const unsubLoad = unit.addAdEventListener(ads.RewardedAdEventType.LOADED, () => {
      unit.show();
    });
    const unsubReward = unit.addAdEventListener(ads.RewardedAdEventType.EARNED_REWARD, () => {
      earned = true;
    });
    const unsubClose = unit.addAdEventListener(ads.AdEventType.CLOSED, () => {
      unsubLoad();
      unsubReward();
      unsubClose();
      unsubError();
      finish({
        earned,
        preview: false,
        message: earned ? 'Reward earned.' : 'Clip closed before the reward.',
      });
    });
    const unsubError = unit.addAdEventListener(ads.AdEventType.ERROR, () => {
      unsubLoad();
      unsubReward();
      unsubClose();
      unsubError();
      finish({
        earned: false,
        preview: true,
        message: 'The clip failed to load. You can take the preview reward instead.',
      });
    });

    ads.mobileAds().initialize().then(() => unit.load()).catch(() => {
      finish({
        earned: false,
        preview: true,
        message: 'Ads could not start. You can take the preview reward instead.',
      });
    });
  });
}

export function watchRewardedAd(): Promise<RewardResult> {
  return showUnit('shield');
}

export function watchRewardedInterstitial(): Promise<RewardResult> {
  return showUnit('coach');
}

export function adsNativeAvailable(): boolean {
  return nativeAdsPresent();
}
