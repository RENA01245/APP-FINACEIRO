export const lightColors = {
  primary: '#1A237E', // Deep Royal Blue
  secondary: '#00C853', // Emerald Green
  danger: '#FF5252', // Soft Red
  background: '#F8F9FA', // Ghost White
  surface: '#FFFFFF', // Pure White
  textPrimary: '#212121', // Dark Gunmetal
  textSecondary: '#757575', // Slate Gray
  placeholder: '#BDBDBD',
  border: '#E0E0E0',
  gradientPrimary: ['#1A237E', '#3949AB'] as readonly [string, string, ...string[]],
  gradientSecondary: ['#00C853', '#69F0AE'] as readonly [string, string, ...string[]],
};

export const darkColors = {
  primary: '#3F51B5',
  secondary: '#00E676',
  danger: '#FF5252',
  background: '#121212',
  surface: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  placeholder: '#424242',
  border: '#333333',
  gradientPrimary: ['#1A237E', '#283593'] as readonly [string, string, ...string[]],
  gradientSecondary: ['#00C853', '#009624'] as readonly [string, string, ...string[]],
};

export const theme = {
  typography: {
    fontFamily: {
      regular: 'System',
      bold: 'System',
    },
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      bold: '700' as const,
      extraBold: '800' as const,
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    pill: 999,
  },
  shadows: {
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    }
  }
};
