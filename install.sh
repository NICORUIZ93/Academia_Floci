#!/usr/bin/env sh
# Floci CLI installer - curl -fsSL https://floci.io/install.sh | sh
set -e

VERSION="${FLOCI_CLI_VERSION:-latest}"
INSTALL_DIR="${FLOCI_INSTALL_DIR:-/usr/local/bin}"
BINARY="${FLOCI_BINARY_NAME:-floci}"
REPO="floci-io/floci-cli"

detect_platform() {
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)
    case "$ARCH" in
        x86_64)  ARCH="amd64" ;;
        aarch64|arm64) ARCH="arm64" ;;
        *) echo "Unsupported architecture: $ARCH" >&2; exit 1 ;;
    esac
    case "$OS" in
        linux) PLATFORM="linux-${ARCH}" ;;
        darwin) PLATFORM="darwin-${ARCH}" ;;
        mingw*|msys*|cygwin*)
            PLATFORM="windows-${ARCH}.exe"
            BINARY="floci.exe"
            ;;
        *)
            echo "Unsupported OS: $OS" >&2
            echo "Windows users: run this installer from WSL/Git Bash, or use Docker Compose:" >&2
            echo "  docker compose up -d floci stackport" >&2
            exit 1
            ;;
    esac
    echo "$PLATFORM"
}

fetch_latest_version() {
    curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
        | grep '"tag_name"' | sed 's/.*"tag_name": "\(.*\)".*/\1/'
}

main() {
    echo "Installing Floci CLI..."

    PLATFORM=$(detect_platform)
    if [ "$VERSION" = "latest" ]; then
        VERSION=$(fetch_latest_version)
    fi

    DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${VERSION}/floci-${PLATFORM}"
    TMP=$(mktemp)

    echo "Downloading floci ${VERSION} for ${PLATFORM}..."
    if ! curl -fsSL "$DOWNLOAD_URL" -o "$TMP"; then
        rm -f "$TMP"
        echo "Could not download ${DOWNLOAD_URL}" >&2
        echo "If you are on Windows and this release has no native CLI asset, use WSL or Docker Compose:" >&2
        echo "  wsl -d kali-linux -e bash -c \"curl -fsSL https://floci.io/install.sh | sh\"" >&2
        echo "  docker compose up -d floci stackport" >&2
        exit 1
    fi
    chmod +x "$TMP"

    # Verify checksum if sha256sum is available
    if command -v sha256sum >/dev/null 2>&1; then
        SUMS_URL="https://github.com/${REPO}/releases/download/${VERSION}/sha256sums.txt"
        EXPECTED=$(curl -fsSL "$SUMS_URL" | grep "floci-${PLATFORM}" | awk '{print $1}')
        ACTUAL=$(sha256sum "$TMP" | awk '{print $1}')
        if [ -n "$EXPECTED" ] && [ "$EXPECTED" != "$ACTUAL" ]; then
            echo "Checksum mismatch! Expected: $EXPECTED  Got: $ACTUAL" >&2
            rm -f "$TMP"
            exit 1
        fi
        if [ -n "$EXPECTED" ]; then
            echo "Checksum verified."
        else
            echo "Checksum file has no entry for floci-${PLATFORM}; skipping checksum verification."
        fi
    fi

    # Install
    if [ -w "$INSTALL_DIR" ]; then
        mv "$TMP" "${INSTALL_DIR}/${BINARY}"
    else
        echo "Installing to ${INSTALL_DIR} requires sudo..."
        sudo mv "$TMP" "${INSTALL_DIR}/${BINARY}"
    fi

    echo ""
    echo "Floci CLI ${VERSION} installed to ${INSTALL_DIR}/${BINARY}"
    echo ""
    echo "Quick start:"
    echo "  floci start            # launch Floci"
    echo "  floci doctor           # check your environment"
    echo "  export AWS_ENDPOINT_URL=http://localhost:4566"
    echo "  export AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_DEFAULT_REGION=us-east-1"
    echo "  aws s3 mb s3://my-bucket  # use the AWS CLI against Floci"
}

main "$@"
