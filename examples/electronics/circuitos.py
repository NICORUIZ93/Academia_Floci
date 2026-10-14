fuente, r1, r2, carga = 5.0, 1000.0, 1000.0, 1000.0
vth = fuente * r2 / (r1 + r2)
rth = r1 * r2 / (r1 + r2)
# La entrada de medida es parte del circuito.
v_carga = vth * carga / (rth + carga)
print(f"Vth={vth:.3f} V; Rth={rth:.0f} ohm; salida={v_carga:.3f} V")
