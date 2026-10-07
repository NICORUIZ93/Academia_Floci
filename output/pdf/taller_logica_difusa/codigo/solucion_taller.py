import numpy as np
import matplotlib.pyplot as plt


def mu_a(x):
    """Funcion triangular A = (0, 1, 2)."""
    x = np.asarray(x, dtype=float)
    return np.maximum(np.minimum(x, 2 - x), 0)


def mu_b(x):
    """Funcion trapezoidal B = (1, 3, 4, 5)."""
    x = np.asarray(x, dtype=float)
    return np.maximum(
        np.minimum.reduce(((x - 1) / 2, np.ones_like(x), 5 - x)),
        0,
    )


x = np.linspace(0, 5, 501)
a = mu_a(x)
b = mu_b(x)

# Uniones (T-conormas)
s_z = np.maximum(a, b)
s_prob = a + b - a * b
s_l = np.minimum(1, a + b)

# Intersecciones (T-normas)
t_z = np.minimum(a, b)
t_a = a * b
t_l = np.maximum(0, a + b - 1)

# Negaciones de A
n_z = 1 - a
w = 2  # Supuesto para graficar; el enunciado no especifica w.
n_y = (1 - a**w) ** (1 / w)

# Comprobacion pedida
x0 = 1.5
a0 = float(mu_a([x0])[0])
b0 = float(mu_b([x0])[0])
print(f"x={x0}: A={a0}, B={b0}")
print(f"SZ={max(a0,b0)}")
print(f"Sprob={a0+b0-a0*b0}")
print(f"SL={min(1,a0+b0)}")
print(f"TZ={min(a0,b0)}")
print(f"TA={a0*b0}")
print(f"TL={max(0,a0+b0-1)}")

# Graficas
fig, axes = plt.subplots(2, 2, figsize=(12, 8))
axes[0, 0].plot(x, a, label="A", linewidth=2)
axes[0, 0].plot(x, b, label="B", linewidth=2)
axes[0, 0].set_title("Conjuntos originales")

axes[0, 1].plot(x, s_z, label="SZ", linewidth=2)
axes[0, 1].plot(x, s_prob, label="Sprob", linewidth=2)
axes[0, 1].plot(x, s_l, label="SL", linewidth=2)
axes[0, 1].set_title("Uniones")

axes[1, 0].plot(x, t_z, label="TZ", linewidth=2)
axes[1, 0].plot(x, t_a, label="TA", linewidth=2)
axes[1, 0].plot(x, t_l, label="TL", linewidth=2)
axes[1, 0].set_title("Intersecciones")

axes[1, 1].plot(x, n_z, label="NZ(A)", linewidth=2)
axes[1, 1].plot(x, n_y, label="NY(A), w=2", linewidth=2)
axes[1, 1].set_title("Negaciones de A")

for ax in axes.flat:
    ax.set_xlim(0, 5)
    ax.set_ylim(0, 1.05)
    ax.set_xlabel("x")
    ax.set_ylabel("Grado de pertenencia")
    ax.grid(True, alpha=0.3)
    ax.legend()

plt.tight_layout()
plt.show()
