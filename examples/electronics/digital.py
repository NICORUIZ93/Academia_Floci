for paquete in (False, True):
    for cerrada in (False, True):
        # La decisión exige ambas condiciones.
        despachar = paquete and cerrada
        print(int(paquete), int(cerrada), int(despachar))
