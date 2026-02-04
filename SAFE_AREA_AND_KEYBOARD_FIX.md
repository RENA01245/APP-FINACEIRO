# Safe Area and Keyboard Fixes - Diagnosis & Checklist

## Context
The application was using hardcoded values for paddings and margins, which caused issues on different devices, especially with modern notches and various Android navigation modes (gestures vs. 3 buttons).

## Problems Found
1. **StatusBar Overlap**: `HomeScreen` header was using `paddingTop: insets.top + 10`, but absolute positioning of gradients and list containers caused visual clipping.
2. **NavigationBar Overlap**: The floating Bottom Tab Bar used `bottom: 20` fixed, which overlaps with system navigation in some Android configurations.
3. **Keyboard Coverage**: `LoginScreen` and `AddTransactionScreen` did not use `KeyboardAvoidingView`, leading to hidden inputs during typing.
4. **Magic Numbers**: Usage of `100` for `paddingBottom` instead of calculating based on screen insets.

## Solutions Applied
- Centralized inset management using `useSafeAreaInsets()`.
- Dynamic tab bar height/bottom calculation.
- Implementation of `KeyboardAvoidingView` across all entry forms.
- Dynamic list padding calculation.

## Checklist de Testes
- [ ] Status bar não sobrepõe conteúdo
- [ ] Navigation bar não cobre a Bottom Nav
- [ ] Funciona em gestos e 3 botões
- [ ] Teclado não cobre inputs
- [ ] Funciona em dispositivos com notch
- [ ] Landscape OK (Básico)
