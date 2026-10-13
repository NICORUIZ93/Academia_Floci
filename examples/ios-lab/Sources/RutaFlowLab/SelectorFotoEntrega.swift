#if os(iOS)
import SwiftUI
import UIKit
public struct SelectorFotoEntrega: UIViewControllerRepresentable {
    @Binding var foto: UIImage?
    @Environment(\.dismiss) private var dismiss
    public init(foto: Binding<UIImage?>) { _foto = foto }
    public func makeCoordinator() -> Coordinator { Coordinator(parent: self) }
    public func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = UIImagePickerController.isSourceTypeAvailable(.camera) ? .camera : .photoLibrary
        picker.delegate = context.coordinator
        return picker
    }
    public func updateUIViewController(_ picker: UIImagePickerController, context: Context) {
        context.coordinator.parent = self
    }
    @MainActor public final class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        var parent: SelectorFotoEntrega
        init(parent: SelectorFotoEntrega) { self.parent = parent }
        public func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            parent.foto = info[.originalImage] as? UIImage; parent.dismiss()
        }
        public func imagePickerControllerDidCancel(_ picker: UIImagePickerController) { parent.dismiss() }
    }
}
#endif
