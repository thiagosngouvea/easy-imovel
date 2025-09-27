import { config } from '@tamagui/config/v3'
import { createTamagui } from '@tamagui/core'

const appConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
    light: {
      ...config.themes.light,
      primary: '#007AFF',
      primaryHover: '#0056CC',
      secondary: '#5856D6',
      secondaryHover: '#4A4AC7',
      background: '#FFFFFF',
      backgroundHover: '#F2F2F7',
      backgroundPress: '#E5E5EA',
      backgroundFocus: '#F2F2F7',
      backgroundStrong: '#F2F2F7',
      backgroundTransparent: 'rgba(255,255,255,0)',
      color: '#000000',
      colorHover: '#333333',
      colorPress: '#666666',
      colorFocus: '#000000',
      colorTransparent: 'rgba(0,0,0,0)',
      borderColor: '#C6C6C8',
      borderColorHover: '#A1A1A6',
      borderColorPress: '#8E8E93',
      borderColorFocus: '#007AFF',
      placeholderColor: '#8E8E93',
    },
    dark: {
      ...config.themes.dark,
      primary: '#0A84FF',
      primaryHover: '#409CFF',
      secondary: '#5E5CE6',
      secondaryHover: '#7D7AFF',
      background: '#000000',
      backgroundHover: '#1C1C1E',
      backgroundPress: '#2C2C2E',
      backgroundFocus: '#1C1C1E',
      backgroundStrong: '#1C1C1E',
      backgroundTransparent: 'rgba(0,0,0,0)',
      color: '#FFFFFF',
      colorHover: '#E5E5E7',
      colorPress: '#AEAEB2',
      colorFocus: '#FFFFFF',
      colorTransparent: 'rgba(255,255,255,0)',
      borderColor: '#38383A',
      borderColorHover: '#48484A',
      borderColorPress: '#636366',
      borderColorFocus: '#0A84FF',
      placeholderColor: '#8E8E93',
    },
  },
  tokens: {
    ...config.tokens,
    space: {
      ...config.tokens.space,
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    size: {
      ...config.tokens.size,
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      xxl: 40,
    },
    radius: {
      ...config.tokens.radius,
      xs: 2,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      xxl: 24,
    },
  },
})

export type AppConfig = typeof appConfig

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig
