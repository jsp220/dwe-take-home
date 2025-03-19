#!/bin/sh

cd "$(dirname "$0")"

OS_NAME=$(uname)

case "$OS_NAME" in
    "Darwin")
        echo "Detected macOS. Building Focus Peaking App for macOS..."
        npm run build
        APP_PATH=$(find ./release -name "*.app" | head -n 1)
        if [ -z "$APP_PATH" ]; then
            echo "Electron .app not found!"
            exit 1
        fi
        echo "Launching macOS app: $APP_PATH"
        open "$APP_PATH"
    ;;  

    "Linux")
        echo "Detected Linux. Building Focus Peaking App for Linux..."
        npm run build
        APPIMAGE_PATH=$(find ./release -name "*.AppImage" | head -n 1)
        if [ -z "$APPIMAGE_PATH" ]; then
            echo "Electron AppImage not found!"
            exit 1
        fi
        chmod +x "$APPIMAGE_PATH"
        echo "Launching Linux AppImage: $APPIMAGE_PATH"
        "$APPIMAGE_PATH"
        ;;
    
    "MINGW"*|"CYGWIN"*|"MSYS"*)
        echo "Detected Windows (Git Bash or similar). Building Focus Peaking App for Windows..."
        npm run build
        EXE_PATH=$(find ./release -name "*.exe" | head -n 1)
        if [ -z "$EXE_PATH" ]; then
            echo "Electron .exe not found!"
            exit 1
        fi
        echo "Launching Windows executable: $EXE_PATH"
        "$EXE_PATH"
        ;;

    *)
        echo "Unsupported OS: $OS_NAME"
        exit 1
        ;;
esac