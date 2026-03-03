/** Default theme settings */
export const themeSettings = {
  themeScheme: 'light',
  grayscale: false,
  colourWeakness: false,
  recommendColor: false,
  themeColor: '#1f4d7a',
  otherColor: {
    info: '#2f6f9f',
    success: '#2f7d59',
    warning: '#b8860b',
    error: '#b84a4a'
  },
  isInfoFollowPrimary: true,
  resetCacheStrategy: 'close',
  layout: {
    mode: 'vertical',
    scrollMode: 'content',
    reverseHorizontalMix: false
  },
  page: {
    animate: true,
    animateMode: 'fade-slide'
  },
  header: {
    height: 56,
    breadcrumb: {
      visible: true,
      showIcon: true
    },
    multilingual: {
      visible: true
    },
    globalSearch: {
      visible: true
    }
  },
  tab: {
    visible: true,
    cache: true,
    height: 44,
    mode: 'chrome'
  },
  fixedHeaderAndTab: true,
  sider: {
    inverted: false,
    width: 220,
    collapsedWidth: 64,
    mixWidth: 90,
    mixCollapsedWidth: 64,
    mixChildMenuWidth: 200
  },
  footer: {
    visible: true,
    fixed: false,
    height: 48,
    right: true
  },
  watermark: {
    visible: false,
    text: 'EngageFinance',
    enableUserName: false
  },
  tokens: {
    light: {
      colors: {
        container: 'rgb(252, 253, 255)',
        layout: 'rgb(243, 246, 250)',
        inverted: 'rgb(20, 32, 47)',
        'base-text': 'rgb(35, 47, 62)'
      },
      boxShadow: {
        header: '0 2px 12px rgb(15, 23, 42, 0.08)',
        sider: '2px 0 14px 0 rgb(15, 23, 42, 0.08)',
        tab: '0 2px 10px rgb(15, 23, 42, 0.08)'
      }
    },
    dark: {
      colors: {
        container: 'rgb(24, 32, 44)',
        layout: 'rgb(15, 23, 34)',
        inverted: 'rgb(235, 241, 248)',
        'base-text': 'rgb(210, 220, 232)'
      },
      boxShadow: {
        header: '0 2px 12px rgb(2, 8, 20, 0.45)',
        sider: '2px 0 14px 0 rgb(2, 8, 20, 0.4)',
        tab: '0 2px 10px rgb(2, 8, 20, 0.4)'
      }
    }
  }
};

/**
 * Override theme settings
 *
 * If publish new version, use `overrideThemeSettings` to override certain theme settings
 */
export const overrideThemeSettings = {};
