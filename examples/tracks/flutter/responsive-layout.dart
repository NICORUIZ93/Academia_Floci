// Layout y diseño responsive (Módulo 2): LayoutBuilder + breakpoints.
import 'package:flutter/material.dart';

class PantallaResponsive extends StatelessWidget {
  const PantallaResponsive({super.key});

  @override
  Widget build(BuildContext context) {
    // LayoutBuilder reconstruye su hijo cada vez que cambian las restricciones
    // de tamaño del padre (rotación, redimensionar ventana en desktop/web) —
    // constraints.maxWidth es el ancho disponible real, no el de toda la pantalla.
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= 900) {
          return _layoutEscritorio();
        } else if (constraints.maxWidth >= 600) {
          return _layoutTablet();
        }
        return _layoutMovil();
      },
    );
  }

  Widget _layoutMovil() {
    // Column: apila verticalmente — apropiado para pantallas angostas.
    return Column(children: const [_Panel('Lista'), _Panel('Detalle')]);
  }

  Widget _layoutTablet() {
    return Row(
      children: const [
        Expanded(flex: 1, child: _Panel('Lista')),
        Expanded(flex: 2, child: _Panel('Detalle')),
      ],
    );
  }

  Widget _layoutEscritorio() {
    return Row(
      children: const [
        SizedBox(width: 280, child: _Panel('Navegación')),
        Expanded(flex: 1, child: _Panel('Lista')),
        Expanded(flex: 2, child: _Panel('Detalle')),
      ],
    );
  }
}

class _Panel extends StatelessWidget {
  final String etiqueta;
  const _Panel(this.etiqueta);

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.all(4),
        padding: const EdgeInsets.all(16),
        color: Colors.blueGrey.shade50,
        child: Text(etiqueta),
      );
}
