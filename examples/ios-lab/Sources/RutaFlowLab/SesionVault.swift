import Foundation
import Security
public struct SesionVault {
    public let service: String
    public init(service: String) { self.service = service }
    public func guardarToken(_ token: String, cuenta: String) throws {
        let key: [String: Any] = [kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service, kSecAttrAccount as String: cuenta]
        let data = Data(token.utf8)
        let update = SecItemUpdate(key as CFDictionary, [kSecValueData as String: data] as CFDictionary)
        if update == errSecSuccess { return }
        guard update == errSecItemNotFound else { throw VaultError(status: update) }
        var item = key
        item[kSecValueData as String] = data
        item[kSecAttrAccessible as String] = kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        let status = SecItemAdd(item as CFDictionary, nil)
        guard status == errSecSuccess else { throw VaultError(status: status) }
    }
}
public struct VaultError: Error { public let status: OSStatus }
