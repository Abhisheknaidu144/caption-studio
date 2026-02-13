# Font Directory for Video Captions

This directory should contain TrueType (.ttf) or OpenType (.otf) font files for use in video caption rendering.

## How to Add Fonts

1. Download your desired font files (TrueType .ttf or OpenType .otf format)
2. Place them in this directory: `backend/flat_fonts/`
3. The font files will be automatically available to FFmpeg for subtitle rendering

## Recommended Fonts

For best results with video captions, use these popular fonts:

- **Arial** (Built into most systems)
- **Inter** - Modern, clean, great for UI
- **Montserrat** - Bold and impactful
- **Roboto** - Google's default font, very readable
- **Poppins** - Friendly and modern
- **Open Sans** - Highly readable at all sizes

## System Fonts Fallback

If a specific font is not found in this directory, FFmpeg will attempt to use system fonts. However, for consistent results across different environments (especially in production), it's recommended to place all fonts here.

## Font Licensing

Ensure you have proper licensing rights for any fonts you use, especially for commercial projects.

## Note for Replit Deployment

When deploying to Replit, make sure this directory and its contents are included in your deployment. You may need to upload font files directly to Replit's file system if they're not in your git repository (due to size).
