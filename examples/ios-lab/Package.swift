// swift-tools-version: 6.0
import PackageDescription
let package = Package(name: "RutaFlowLab", platforms: [.macOS(.v14), .iOS(.v17)],
    products: [.library(name: "RutaFlowLab", targets: ["RutaFlowLab"])],
    targets: [.target(name: "RutaFlowLab"), .testTarget(name: "RutaFlowLabTests", dependencies: ["RutaFlowLab"])])
