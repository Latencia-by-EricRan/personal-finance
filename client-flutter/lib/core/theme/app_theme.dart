import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

abstract final class AppRadius {
  AppRadius._();

  static const sm = 12.0;
  static const md = 20.0;
  static const lg = 28.0;
}

abstract final class AppTheme {
  AppTheme._();

  static ThemeData get dark {
    // Text-on-fill pairing was measured, not eyeballed: white reads on
    // nuPurple (7.2:1) and secondary/nuViolet (4.65:1), but income/expense/
    // warning are bright enough that only dark ink clears contrast on them.
    final colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.nuPurple,
      brightness: Brightness.dark,
    ).copyWith(
      primary: AppColors.nuPurple,
      onPrimary: Colors.white,
      secondary: AppColors.nuViolet,
      onSecondary: Colors.white,
      surface: AppColors.ink,
      onSurface: AppColors.textPrimary,
      surfaceContainer: AppColors.surface,
      surfaceContainerHigh: AppColors.surfaceHigh,
      surfaceContainerHighest: AppColors.surfaceHighest,
      error: AppColors.expense,
      onError: AppColors.ink,
    );

    final textTheme = TextTheme(
      headlineLarge: GoogleFonts.manrope(
        fontWeight: FontWeight.w800,
        fontSize: 34,
        height: 1.1,
        color: AppColors.textPrimary,
      ),
      headlineMedium: GoogleFonts.manrope(
        fontWeight: FontWeight.w800,
        fontSize: 26,
        color: AppColors.textPrimary,
      ),
      headlineSmall: GoogleFonts.manrope(
        fontWeight: FontWeight.w700,
        fontSize: 22,
        color: AppColors.textPrimary,
      ),
      titleLarge: GoogleFonts.manrope(
        fontWeight: FontWeight.w700,
        fontSize: 17,
        color: AppColors.textPrimary,
      ),
      titleMedium: GoogleFonts.inter(
        fontWeight: FontWeight.w600,
        fontSize: 14.5,
        color: AppColors.textPrimary,
      ),
      titleSmall: GoogleFonts.inter(
        fontWeight: FontWeight.w600,
        fontSize: 13,
        color: AppColors.textSecondary,
      ),
      bodyLarge: GoogleFonts.inter(fontSize: 16, color: AppColors.textPrimary),
      bodyMedium: GoogleFonts.inter(
        fontSize: 14,
        color: AppColors.textSecondary,
      ),
      bodySmall: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
      labelLarge: GoogleFonts.inter(
        fontWeight: FontWeight.w700,
        fontSize: 15,
        color: AppColors.textPrimary,
      ),
      labelMedium: GoogleFonts.inter(
        fontWeight: FontWeight.w600,
        fontSize: 12.5,
        color: AppColors.textSecondary,
      ),
      labelSmall: GoogleFonts.inter(
        fontWeight: FontWeight.w600,
        fontSize: 11,
        letterSpacing: 0.4,
        color: AppColors.textMuted,
      ),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.ink,
      textTheme: textTheme,
      cardTheme: CardThemeData(
        color: colorScheme.surfaceContainer,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: colorScheme.primary,
          foregroundColor: colorScheme.onPrimary,
          minimumSize: const Size.fromHeight(52),
          textStyle: textTheme.labelLarge,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.sm),
          ),
        ),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: colorScheme.secondary,
        foregroundColor: Colors.white,
        shape: const CircleBorder(),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colorScheme.surfaceContainer,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 15,
          vertical: 13,
        ),
        hintStyle: textTheme.bodyMedium?.copyWith(color: AppColors.textMuted),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.sm),
          borderSide: BorderSide.none,
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: colorScheme.surfaceContainerHigh,
        indicatorColor: AppColors.nuPurple.withValues(alpha: 0.16),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return textTheme.labelSmall?.copyWith(
            color: selected ? colorScheme.onSurface : AppColors.textMuted,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return IconThemeData(
            color: selected ? AppColors.nuViolet : AppColors.textMuted,
          );
        }),
      ),
      segmentedButtonTheme: SegmentedButtonThemeData(
        style: SegmentedButton.styleFrom(
          backgroundColor: colorScheme.surfaceContainer,
          selectedForegroundColor: AppColors.ink,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(999),
          ),
        ),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: colorScheme.surfaceContainerHigh,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
        ),
        showDragHandle: true,
        dragHandleColor: AppColors.textMuted,
      ),
    );
  }
}
